import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { AdminLoginDto, RefreshTokenDto } from "./dto/login.dto";
import { ConfigService } from "@nestjs/config";
import { NotificationService } from "../notifications/notification.service";
import { PrismaService } from "../../../db";
export declare class AuthService {
    private jwtService;
    private configService;
    private usersService;
    private prisma;
    private notificationsService;
    private readonly logger;
    private verificationCodes;
    private readonly MAX_ATTEMPTS;
    private readonly CODE_EXPIRY;
    private readonly RESEND_COOLDOWN;
    constructor(jwtService: JwtService, configService: ConfigService, usersService: UsersService, prisma: PrismaService, notificationsService: NotificationService);
    sendVerificationCode(email: string, name?: string): Promise<{
        action: string;
        message: string;
        success: boolean;
        timeRemaining: number;
        verificationToken: string;
        reason: string;
        then: undefined;
    }>;
    verifyEmailAndLogin(email: string, verificationCode: string): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            name: any;
            email: any;
            role: any;
            emailVerified: boolean;
            isActive: any;
        };
    }>;
    adminLogin(adminLoginDto: AdminLoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            name: any;
            email: any;
            role: any;
            emailVerified: any;
            isActive: any;
        };
    }>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
        access_token: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        emailVerified: boolean;
        isActive: boolean;
        createdAt: Date;
        lastLoginAt: Date | null;
    }>;
    validateAdminCredentials(email: string, password: string): Promise<{
        subgroup: string | null;
        programme: string | null;
        level: string | null;
        name: string;
        phone: string | null;
        email: string;
        password: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        college: string | null;
        phoneVerified: boolean;
        emailVerified: boolean;
        isActive: boolean;
        inkVerified: boolean;
        id: string;
        hasVoted: boolean;
        emailVerifiedAt: Date | null;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        subgroupId: string | null;
    } | null>;
    private generateTokens;
    cleanupExpiredCodes(): void;
    requestPasswordReset(email: string): Promise<{
        message: string;
    }>;
    resetPassword(email: string, resetToken: string, newPassword: string): Promise<{
        message: string;
    }>;
}
