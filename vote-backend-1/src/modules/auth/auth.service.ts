import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { AdminLoginDto, LoginDto, RefreshTokenDto, VerifySmsDto } from "./dto/login.dto";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { NotificationService } from "../notifications/notification.service";
import { AuthResponseDto, VerificationResponseDto } from "./dto/auth-response.dto";
import { UserRole } from '@prisma/client/index';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private verificationCodes = new Map<string, { code: string; expires: Date; attempts: number }>();
  private readonly MAX_ATTEMPTS = 5;
  private readonly CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes
  private readonly RESEND_COOLDOWN = 60 * 1000; // 1 minute

  constructor(
      private jwtService: JwtService,
      private configService: ConfigService,
      private usersService: UsersService,
      private notificationsService: NotificationService
  ) {
    console.log('Instantiating AuthService');
  }

  async sendVerificationCode(loginDto: LoginDto): Promise<VerificationResponseDto> {
    const { phone, name } = loginDto;

    // Check if code was recently sent
    const existing = this.verificationCodes.get(phone);
    if (existing && existing.expires > new Date()) {
      const timeRemaining = Math.ceil((existing.expires.getTime() - Date.now()) / 1000);
      if (timeRemaining > (this.CODE_EXPIRY - this.RESEND_COOLDOWN) / 1000) {
        return {
          //@ts-ignore
          message: 'Verification code already sent. Please wait before requesting a new one.',
          success: false,
          timeRemaining,
        };
      }
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + this.CODE_EXPIRY);

    // Store code
    this.verificationCodes.set(phone, {
      code,
      expires,
      attempts: 0,
    });

    // Send SMS
    await this.notificationsService.sendSms(
        phone,
        `Your Pax Romana KNUST verification code is: ${code}. Valid for 10 minutes.`,
    );

    // Create or update user
    await this.usersService.createOrUpdateUser({
      phone,
      name,
      //@ts-ignore
      email,
      role: UserRole.VOTER,
    });

    this.logger.log(`Verification code sent to ${phone}`);
    return {
      //@ts-ignore
      message: 'Verification code sent successfully',
      success: true,
    };
  }

  async verifyAndLogin(verifySmsDto: VerifySmsDto): Promise<AuthResponseDto> {
    const { phone, verificationCode } = verifySmsDto; // Changed from phoneNumber to phone

    const storedData = this.verificationCodes.get(phone);

    if (!storedData) {
      throw new UnauthorizedException('No verification code found. Please request a new code.');
    }

    if (storedData.expires < new Date()) {
      this.verificationCodes.delete(phone);
      throw new UnauthorizedException('Verification code has expired. Please request a new code.');
    }

    if (storedData.attempts >= this.MAX_ATTEMPTS) {
      this.verificationCodes.delete(phone);
      throw new UnauthorizedException('Maximum verification attempts exceeded. Please request a new code.');
    }

    if (storedData.code !== verificationCode) {
      storedData.attempts++;
      throw new UnauthorizedException(`Invalid verification code. ${this.MAX_ATTEMPTS - storedData.attempts} attempts remaining.`);
    }

    // Code is valid, clean up
    this.verificationCodes.delete(phone);

    // Get or create user - fixed method name
    const user = await this.usersService.findByPhone(phone); // Changed from findByPhoneNumber
    if (!user) {
      throw new UnauthorizedException('User not found. Please try logging in again.');
    }

    // Update verification status
    await this.usersService.updatePhoneVerificationStatus(user.id, true); // More specific method name

    // Generate tokens
    const tokens = await this.generateTokens(user);

    this.logger.log(`User ${phone} logged in successfully`);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone, // Changed from phoneNumber
        role: user.role,
        phoneVerified: true, // Changed from isVerified to match schema
      },
    };
  }

  async adminLogin(adminLoginDto: AdminLoginDto): Promise<AuthResponseDto> {
    const { email, password } = adminLoginDto; // Changed from username to email

    const user = await this.usersService.findByEmail(email); // Changed from findByUsername
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.EC_MEMBER && user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Access denied. Admin privileges required.');
    }

    // Check if a password exists (some users might not have passwords)
    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);

    this.logger.log(`Admin ${email} logged in successfully`);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email, // Changed from username
        role: user.role,
        phoneVerified: user.phoneVerified, // Changed from isVerified
        emailVerified: user.emailVerified, // Added email verification status
      },
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const access_token = this.jwtService.sign({
        sub: user.id,
        phone: user.phone, // Changed from phoneNumber
        email: user.email, // Changed from username
        role: user.role,
      });

      return { access_token };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<{ message: string }> {
    // Optional: Invalidate refresh tokens in a database
    // await this.usersService.invalidateRefreshTokens(userId);

    this.logger.log(`User ${userId} logged out`);
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      phone: user.phone, // Changed from phoneNumber
      email: user.email, // Changed from username
      role: user.role,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return { access_token, refresh_token };
  }

  // Cleanup expired verification codes (run periodically)
  cleanupExpiredCodes() {
    const now = new Date();
    for (const [phone, data] of this.verificationCodes.entries()) {
      if (data.expires < now) {
        this.verificationCodes.delete(phone);
      }
    }
  }
}
