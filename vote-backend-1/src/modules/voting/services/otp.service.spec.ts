import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { OtpService } from './otp.service';
import { PrismaService } from '../../../../db';
import { CacheService } from '../../caches/cache.service';
import { RealTimeService } from '../../real-time/services/real-time.service';

const mockPrisma = {
    user: { findUnique: jest.fn(), create: jest.fn() },
    votingSession: { create: jest.fn() },
};
const mockCacheService = {
    setSmsCode: jest.fn(),
    getSmsCode: jest.fn(),
    clearSmsCode: jest.fn(),
    setVotingSession: jest.fn(),
};
const mockRealTimeService = {
    broadcastToAdmins: jest.fn(),
    getConnectionStats: jest.fn().mockReturnValue({ totalConnections: 0 }),
};
const mockHttpService = { post: jest.fn() };
const mockConfigService = { get: jest.fn() };

describe('OtpService', () => {
    let service: OtpService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OtpService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: ConfigService, useValue: mockConfigService },
                { provide: HttpService, useValue: mockHttpService },
                { provide: CacheService, useValue: mockCacheService },
                { provide: RealTimeService, useValue: mockRealTimeService },
            ],
        }).compile();
        service = module.get<OtpService>(OtpService);
        jest.clearAllMocks();
    });

    describe('generateOtp', () => {
        const dto = { phoneNumber: '0551234567', name: 'Test User', email: 'test@knust.edu.gh' };

        it('sends OTP when user has not voted', async () => {
            mockConfigService.get.mockReturnValue('test-api-key');
            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockHttpService.post.mockReturnValue(of({ data: { code: '1000', ussd_code: '*920*10#' } }));
            mockCacheService.setSmsCode.mockResolvedValue(undefined);

            const result = await service.generateOtp(dto);

            expect(result.message).toContain('OTP sent successfully');
            expect(result.expiresIn).toBe('5 minutes');
            expect(mockCacheService.setSmsCode).toHaveBeenCalledWith(dto.phoneNumber, expect.any(String));
        });

        it('throws ConflictException when user has already voted', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ hasVoted: true });
            await expect(service.generateOtp(dto)).rejects.toThrow(ConflictException);
        });

        it('throws BadRequestException when API key is missing', async () => {
            mockConfigService.get.mockReturnValue(undefined);
            mockPrisma.user.findUnique.mockResolvedValue(null);
            await expect(service.generateOtp(dto)).rejects.toThrow(BadRequestException);
        });

        it('throws BadRequestException when Arkesel returns error code', async () => {
            mockConfigService.get.mockReturnValue('api-key');
            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockHttpService.post.mockReturnValue(of({ data: { code: '1001', message: 'Invalid number' } }));
            await expect(service.generateOtp(dto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('verifyOtp', () => {
        const dto = { phoneNumber: '0551234567', otp: '123456', email: 'test@knust.edu.gh' };

        it('creates session for new user on valid OTP', async () => {
            mockConfigService.get.mockReturnValue('api-key');
            mockHttpService.post.mockReturnValue(of({ data: { code: '1000' } }));
            mockCacheService.getSmsCode.mockResolvedValue(JSON.stringify({ name: 'Test User', email: dto.email }));
            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockPrisma.user.create.mockResolvedValue({ id: 'u1', name: 'Test User', email: dto.email });
            mockPrisma.votingSession.create.mockResolvedValue({
                id: 's1', createdAt: new Date(), expiresAt: new Date(Date.now() + 30 * 60 * 1000),
            });
            mockCacheService.setVotingSession.mockResolvedValue(undefined);
            mockCacheService.clearSmsCode.mockResolvedValue(undefined);

            const result = await service.verifyOtp(dto);

            expect(result.message).toBe('OTP verified successfully');
            expect(result).toHaveProperty('sessionId');
        });

        it('throws BadRequestException for invalid OTP (non-1000 code)', async () => {
            mockConfigService.get.mockReturnValue('api-key');
            mockHttpService.post.mockReturnValue(of({ data: { code: '1002' } }));
            await expect(service.verifyOtp(dto)).rejects.toThrow(BadRequestException);
        });

        it('throws NotFoundException when OTP session cache is missing', async () => {
            mockConfigService.get.mockReturnValue('api-key');
            mockHttpService.post.mockReturnValue(of({ data: { code: '1000' } }));
            mockCacheService.getSmsCode.mockResolvedValue(null);
            await expect(service.verifyOtp(dto)).rejects.toThrow(NotFoundException);
        });

        it('throws BadRequestException when email does not match cached data', async () => {
            mockConfigService.get.mockReturnValue('api-key');
            mockHttpService.post.mockReturnValue(of({ data: { code: '1000' } }));
            mockCacheService.getSmsCode.mockResolvedValue(JSON.stringify({ email: 'other@knust.edu.gh' }));
            await expect(service.verifyOtp(dto)).rejects.toThrow(BadRequestException);
        });

        it('throws ConflictException when existing user has already voted', async () => {
            mockConfigService.get.mockReturnValue('api-key');
            mockHttpService.post.mockReturnValue(of({ data: { code: '1000' } }));
            mockCacheService.getSmsCode.mockResolvedValue(JSON.stringify({ name: 'Test User', email: dto.email }));
            mockPrisma.user.findUnique.mockResolvedValue({ hasVoted: true, email: dto.email });
            await expect(service.verifyOtp(dto)).rejects.toThrow(ConflictException);
        });
    });
});
