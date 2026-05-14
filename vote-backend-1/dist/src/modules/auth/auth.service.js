"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const notification_service_1 = require("../notifications/notification.service");
const index_1 = require("@prisma/client/index");
const db_1 = require("../../../db");
let AuthService = AuthService_1 = class AuthService {
    jwtService;
    configService;
    usersService;
    prisma;
    notificationsService;
    logger = new common_1.Logger(AuthService_1.name);
    verificationCodes = new Map();
    MAX_ATTEMPTS = 5;
    CODE_EXPIRY = 10 * 60 * 1000;
    RESEND_COOLDOWN = 60 * 1000;
    constructor(jwtService, configService, usersService, prisma, notificationsService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.usersService = usersService;
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        this.logger.log('AuthService initialized');
    }
    async sendVerificationCode(email, name) {
        try {
            const existing = this.verificationCodes.get(email);
            if (existing && existing.expires > new Date()) {
                const timeRemaining = Math.ceil((existing.expires.getTime() - Date.now()) / 1000);
                if (timeRemaining > (this.CODE_EXPIRY - this.RESEND_COOLDOWN) / 1000) {
                    return {
                        action: 'decline',
                        message: 'Verification code already sent. Please wait before requesting a new one.',
                        success: false,
                        timeRemaining,
                        verificationToken: '',
                        reason: 'Rate limited',
                        then: undefined,
                    };
                }
            }
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expires = new Date(Date.now() + this.CODE_EXPIRY);
            this.verificationCodes.set(email, {
                code,
                expires,
                attempts: 0,
            });
            await this.notificationsService.sendEmail(email, 'Pax Romana KNUST - Verification Code', `Your verification code is: ${code}. Valid for 10 minutes.`);
            if (name) {
                try {
                    await this.usersService.createOrUpdateUser({
                        email,
                        name,
                        role: index_1.UserRole.SUPER_ADMIN,
                    });
                }
                catch (error) {
                    this.logger.warn(`Failed to create/update user ${email}: ${error.message}`);
                }
            }
            this.logger.log(`Verification code sent to ${email}`);
            return {
                action: 'approve',
                message: 'Verification code sent successfully',
                success: true,
                timeRemaining: this.CODE_EXPIRY / 1000,
                verificationToken: '',
                reason: 'Code sent successfully',
                then: undefined,
            };
        }
        catch (error) {
            this.logger.error(`Error sending verification code to ${email}:`, error);
            throw new common_1.BadRequestException('Failed to send verification code. Please try again.');
        }
    }
    async verifyEmailAndLogin(email, verificationCode) {
        const storedData = this.verificationCodes.get(email);
        if (!storedData) {
            throw new common_1.UnauthorizedException('No verification code found. Please request a new code.');
        }
        if (storedData.expires < new Date()) {
            this.verificationCodes.delete(email);
            throw new common_1.UnauthorizedException('Verification code has expired. Please request a new code.');
        }
        if (storedData.attempts >= this.MAX_ATTEMPTS) {
            this.verificationCodes.delete(email);
            throw new common_1.UnauthorizedException('Maximum verification attempts exceeded. Please request a new code.');
        }
        if (storedData.code !== verificationCode) {
            storedData.attempts++;
            throw new common_1.UnauthorizedException(`Invalid verification code. ${this.MAX_ATTEMPTS - storedData.attempts} attempts remaining.`);
        }
        this.verificationCodes.delete(email);
        try {
            const user = await this.usersService.findByEmail(email);
            if (!user) {
                throw new common_1.UnauthorizedException('User not found. Please try logging in again.');
            }
            const allowedRoles = [index_1.UserRole.SUPER_ADMIN, index_1.UserRole.EC_MEMBER, index_1.UserRole.ADMIN];
            if (!allowedRoles.includes(user.role)) {
                throw new common_1.UnauthorizedException('Access denied. Admin privileges required.');
            }
            try {
                await this.usersService.updateEmailVerificationStatus(user.id, true);
            }
            catch (error) {
                this.logger.warn(`Failed to update email verification status for user ${user.id}:`, error);
            }
            try {
                await this.usersService.updateLastLogin(user.id);
            }
            catch (error) {
                this.logger.warn(`Failed to update last login for user ${user.id}:`, error);
            }
            const tokens = await this.generateTokens(user);
            this.logger.log(`User ${email} logged in successfully via email verification`);
            return {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    emailVerified: true,
                    isActive: user.isActive,
                },
            };
        }
        catch (error) {
            this.logger.error(`Error during email verification login for ${email}:`, error);
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('Login failed. Please try again.');
        }
    }
    async adminLogin(adminLoginDto) {
        const { email, password } = adminLoginDto;
        try {
            const user = await this.usersService.findByEmail(email);
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            const allowedRoles = [index_1.UserRole.SUPER_ADMIN, index_1.UserRole.EC_MEMBER, index_1.UserRole.ADMIN];
            if (!allowedRoles.includes(user.role)) {
                throw new common_1.UnauthorizedException('Access denied. Admin privileges required.');
            }
            if (!user.isActive) {
                throw new common_1.UnauthorizedException('Account has been suspended. Please contact support.');
            }
            if (!user.password) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            try {
                await this.usersService.updateLastLogin(user.id);
            }
            catch (error) {
                this.logger.warn(`Failed to update last login for user ${user.id}:`, error);
            }
            const tokens = await this.generateTokens(user);
            this.logger.log(`Admin ${email} logged in successfully`);
            return {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    emailVerified: user.emailVerified,
                    isActive: user.isActive,
                },
            };
        }
        catch (error) {
            this.logger.error(`Error during admin login for ${email}:`, error);
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('Login failed. Please try again.');
        }
    }
    async refreshToken(refreshTokenDto) {
        try {
            const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
            const user = await this.usersService.findById(payload.sub);
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            if (!user.isActive) {
                throw new common_1.UnauthorizedException('Account has been suspended');
            }
            const access_token = this.jwtService.sign({
                sub: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
            });
            return { access_token };
        }
        catch (error) {
            this.logger.error('Error refreshing token:', error);
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(userId) {
        this.logger.log(`User ${userId} logged out`);
        return { message: 'Logged out successfully' };
    }
    async getProfile(userId) {
        try {
            const user = await this.usersService.findById(userId);
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                emailVerified: user.emailVerified,
                isActive: user.isActive,
                createdAt: user.createdAt,
                lastLoginAt: user.lastLoginAt,
            };
        }
        catch (error) {
            this.logger.error(`Error getting profile for user ${userId}:`, error);
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('Failed to get user profile');
        }
    }
    async validateAdminCredentials(email, password) {
        return this.usersService.validateAdminCredentials(email, password);
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        };
        const [access_token, refresh_token] = await Promise.all([
            this.jwtService.signAsync(payload, {
                expiresIn: '1h',
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            }),
        ]);
        return { access_token, refresh_token };
    }
    cleanupExpiredCodes() {
        const now = new Date();
        for (const [email, data] of this.verificationCodes.entries()) {
            if (data.expires < now) {
                this.verificationCodes.delete(email);
            }
        }
        this.logger.log('Expired verification codes cleaned up');
    }
    async requestPasswordReset(email) {
        try {
            const user = await this.usersService.findByEmail(email);
            if (!user) {
                return { message: 'If the email exists, a reset link has been sent.' };
            }
            const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
            const expires = new Date(Date.now() + 30 * 60 * 1000);
            this.verificationCodes.set(`reset_${email}`, {
                code: resetToken,
                expires,
                attempts: 0,
            });
            await this.notificationsService.sendEmail(email, 'Pax Romana KNUST - Password Reset', `Your password reset code is: ${resetToken}. Valid for 30 minutes.`);
            this.logger.log(`Password reset requested for ${email}`);
            return { message: 'If the email exists, a reset link has been sent.' };
        }
        catch (error) {
            this.logger.error(`Error requesting password reset for ${email}:`, error);
            return { message: 'If the email exists, a reset link has been sent.' };
        }
    }
    async resetPassword(email, resetToken, newPassword) {
        const storedData = this.verificationCodes.get(`reset_${email}`);
        if (!storedData || storedData.code !== resetToken || storedData.expires < new Date()) {
            this.verificationCodes.delete(`reset_${email}`);
            throw new common_1.UnauthorizedException('Invalid or expired reset token');
        }
        try {
            const user = await this.usersService.findByEmail(email);
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await this.usersService.update(user.id, { password: hashedPassword });
            this.verificationCodes.delete(`reset_${email}`);
            this.logger.log(`Password reset completed for ${email}`);
            return { message: 'Password reset successfully' };
        }
        catch (error) {
            this.logger.error(`Error resetting password for ${email}:`, error);
            this.verificationCodes.delete(`reset_${email}`);
            throw new common_1.UnauthorizedException('Failed to reset password. Please try again.');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        users_service_1.UsersService,
        db_1.PrismaService,
        notification_service_1.NotificationService])
], AuthService);
//# sourceMappingURL=auth.service.js.map