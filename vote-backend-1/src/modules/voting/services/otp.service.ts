import {
    BadRequestException,
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { createHash } from 'crypto';
import { PrismaService } from '../../../../db';
import { CacheService } from '../../caches/cache.service';
import { RealTimeService } from '../../real-time/services/real-time.service';
import { SseEventType } from '../../real-time/enums/sse-event-types.enum';
import { GenerateOtpDto } from '../dto/generate-otp.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';

@Injectable()
export class OtpService {
    private readonly logger = new Logger(OtpService.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly cacheService: CacheService,
        private readonly realTimeService: RealTimeService,
    ) {}

    async generateOtp(dto: GenerateOtpDto): Promise<any> {
        const { phoneNumber, name, email } = dto;

        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser?.hasVoted) {
            throw new ConflictException('You have already voted in this election');
        }

        const apiKey = this.configService.get('ARKESEL_API_KEY');
        if (!apiKey) {
            throw new BadRequestException('SMS service is not configured');
        }

        const data = {
            expiry: 5,
            length: 6,
            medium: 'sms',
            message: 'Your Pax Romana KNUST voting OTP is %otp_code%. Valid for 5 minutes.',
            number: phoneNumber,
            sender_id: 'VotingApp',
            type: 'numeric',
        };

        try {
            const response = await firstValueFrom(
                this.httpService.post('https://sms.arkesel.com/api/otp/generate', data, {
                    headers: { 'api-key': apiKey },
                }),
            );

            if (response.data.code === '1000') {
                await this.cacheService.setSmsCode(phoneNumber, JSON.stringify({
                    name,
                    email,
                    timestamp: Date.now(),
                    status: 'PENDING',
                }));

                this.realTimeService.broadcastToAdmins({
                    type: SseEventType.SYSTEM_STATUS,
                    data: {
                        action: 'OTP_GENERATED',
                        phoneNumber: phoneNumber.slice(-4),
                        email: email.split('@')[0] + '@***',
                        timestamp: new Date(),
                    },
                    timestamp: new Date(),
                });

                return {
                    message: 'OTP sent successfully to ' + phoneNumber,
                    ussd_code: response.data.ussd_code,
                    expiresIn: '5 minutes',
                };
            } else {
                throw new BadRequestException(`Failed to generate OTP: ${response.data.message}`);
            }
        } catch (error) {
            this.realTimeService.broadcastToAdmins({
                type: SseEventType.SYSTEM_STATUS,
                data: {
                    action: 'OTP_GENERATION_FAILED',
                    phoneNumber: phoneNumber.slice(-4),
                    error: error.message,
                    timestamp: new Date(),
                },
                timestamp: new Date(),
            });

            if (error.response?.status === 401) {
                throw new BadRequestException('SMS service authentication failed');
            }
            throw new BadRequestException(`Error generating OTP: ${error.message}`);
        }
    }

    async verifyOtp(dto: VerifyOtpDto): Promise<any> {
        const { phoneNumber, otp, email } = dto;

        const apiKey = this.configService.get('ARKESEL_API_KEY');
        const data = { number: phoneNumber, otp };

        // Only the HTTP call is in try/catch
        let response: any;
        try {
            response = await firstValueFrom(
                this.httpService.post('https://sms.arkesel.com/api/otp/verify', data, {
                    headers: { 'api-key': apiKey },
                }),
            );
        } catch (error) {
            throw new BadRequestException(`Error verifying OTP: ${error.message}`);
        }

        if (response.data.code !== '1000') {
            this.realTimeService.broadcastToAdmins({
                type: SseEventType.SYSTEM_STATUS,
                data: {
                    action: 'OTP_VERIFICATION_FAILED',
                    phoneNumber: phoneNumber.slice(-4),
                    reason: 'Invalid or expired OTP',
                    timestamp: new Date(),
                },
                timestamp: new Date(),
            });
            throw new BadRequestException('Invalid or expired OTP');
        }

        const cachedData = await this.cacheService.getSmsCode(phoneNumber);
        if (!cachedData) {
            throw new NotFoundException('OTP session not found or expired');
        }

        const otpData = JSON.parse(cachedData);
        if (otpData.email !== email) {
            throw new BadRequestException('Email mismatch with OTP request');
        }

        const phoneHash = createHash('sha256').update(phoneNumber).digest('hex');

        let user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    name: otpData.name,
                    email,
                    phone: phoneNumber,
                    phoneVerified: true,
                    role: 'VOTER',
                },
            });
        } else if (user.hasVoted) {
            throw new ConflictException('You have already voted in this election');
        }

        const sessionId = createHash('sha256')
            .update(`${phoneNumber}_${Date.now()}_${Math.random()}`)
            .digest('hex');

        const votingSession = await this.prisma.votingSession.create({
            data: {
                sessionId,
                voterHash: phoneHash,
                userId: user.id,
                expiresAt: new Date(Date.now() + 30 * 60 * 1000),
            },
        });

        await this.cacheService.setVotingSession(phoneHash, {
            sessionId,
            userId: user.id,
            email: user.email,
            name: user.name,
            createdAt: votingSession.createdAt,
            voterHash: phoneHash,
            currentStep: 0,
            isValid: true,
        });

        await this.cacheService.clearSmsCode(phoneNumber);

        const connectionStats = this.realTimeService.getConnectionStats();
        this.realTimeService.broadcastToAdmins({
            type: SseEventType.SYSTEM_STATUS,
            data: {
                action: 'VOTER_LOGIN_SUCCESS',
                voterName: user.name.split(' ')[0] + ' ***',
                sessionId: sessionId.slice(0, 8) + '***',
                activeVotingSessions: connectionStats.totalConnections + 1,
                timestamp: new Date(),
            },
            timestamp: new Date(),
        });

        return {
            message: 'OTP verified successfully',
            sessionId,
            voter: { name: user.name, email: user.email },
            expiresAt: votingSession.expiresAt,
        };
    }
}
