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
let AuthService = AuthService_1 = class AuthService {
    jwtService;
    configService;
    usersService;
    notificationsService;
    logger = new common_1.Logger(AuthService_1.name);
    verificationCodes = new Map();
    MAX_ATTEMPTS = 5;
    CODE_EXPIRY = 10 * 60 * 1000;
    RESEND_COOLDOWN = 60 * 1000;
    constructor(jwtService, configService, usersService, notificationsService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.usersService = usersService;
        this.notificationsService = notificationsService;
        console.log('Instantiating AuthService');
    }
    async sendVerificationCode(loginDto) {
        const { phone, name } = loginDto;
        const existing = this.verificationCodes.get(phone);
        if (existing && existing.expires > new Date()) {
            const timeRemaining = Math.ceil((existing.expires.getTime() - Date.now()) / 1000);
            if (timeRemaining > (this.CODE_EXPIRY - this.RESEND_COOLDOWN) / 1000) {
                return {
                    message: 'Verification code already sent. Please wait before requesting a new one.',
                    success: false,
                    timeRemaining,
                };
            }
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + this.CODE_EXPIRY);
        this.verificationCodes.set(phone, {
            code,
            expires,
            attempts: 0,
        });
        await this.notificationsService.sendSms(phone, `Your Pax Romana KNUST verification code is: ${code}. Valid for 10 minutes.`);
        await this.usersService.createOrUpdateUser({
            phone,
            name,
            email,
            role: index_1.UserRole.VOTER,
        });
        this.logger.log(`Verification code sent to ${phone}`);
        return {
            message: 'Verification code sent successfully',
            success: true,
        };
    }
    async verifyAndLogin(verifySmsDto) {
        const { phone, verificationCode } = verifySmsDto;
        const storedData = this.verificationCodes.get(phone);
        if (!storedData) {
            throw new common_1.UnauthorizedException('No verification code found. Please request a new code.');
        }
        if (storedData.expires < new Date()) {
            this.verificationCodes.delete(phone);
            throw new common_1.UnauthorizedException('Verification code has expired. Please request a new code.');
        }
        if (storedData.attempts >= this.MAX_ATTEMPTS) {
            this.verificationCodes.delete(phone);
            throw new common_1.UnauthorizedException('Maximum verification attempts exceeded. Please request a new code.');
        }
        if (storedData.code !== verificationCode) {
            storedData.attempts++;
            throw new common_1.UnauthorizedException(`Invalid verification code. ${this.MAX_ATTEMPTS - storedData.attempts} attempts remaining.`);
        }
        this.verificationCodes.delete(phone);
        const user = await this.usersService.findByPhone(phone);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found. Please try logging in again.');
        }
        await this.usersService.updatePhoneVerificationStatus(user.id, true);
        const tokens = await this.generateTokens(user);
        this.logger.log(`User ${phone} logged in successfully`);
        return {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                role: user.role,
                phoneVerified: true,
            },
        };
    }
    async adminLogin(adminLoginDto) {
        const { email, password } = adminLoginDto;
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.role !== index_1.UserRole.SUPER_ADMIN && user.role !== index_1.UserRole.EC_MEMBER && user.role !== index_1.UserRole.ADMIN) {
            throw new common_1.UnauthorizedException('Access denied. Admin privileges required.');
        }
        if (!user.password) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
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
                phoneVerified: user.phoneVerified,
                emailVerified: user.emailVerified,
            },
        };
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
            const access_token = this.jwtService.sign({
                sub: user.id,
                phone: user.phone,
                email: user.email,
                role: user.role,
            });
            return { access_token };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(userId) {
        this.logger.log(`User ${userId} logged out`);
        return { message: 'Logged out successfully' };
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            phone: user.phone,
            email: user.email,
            role: user.role,
        };
        const [access_token, refresh_token] = await Promise.all([
            this.jwtService.signAsync(payload),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            }),
        ]);
        return { access_token, refresh_token };
    }
    cleanupExpiredCodes() {
        const now = new Date();
        for (const [phone, data] of this.verificationCodes.entries()) {
            if (data.expires < now) {
                this.verificationCodes.delete(phone);
            }
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        users_service_1.UsersService,
        notification_service_1.NotificationService])
], AuthService);
//# sourceMappingURL=auth.service.js.map