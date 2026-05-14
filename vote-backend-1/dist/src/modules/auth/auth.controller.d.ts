import { AuthService } from './auth.service';
import { AdminLoginDto, RefreshTokenDto } from "./dto/login.dto";
declare class SendVerificationCodeDto {
    email: string;
    name?: string;
}
declare class VerifyEmailCodeDto {
    email: string;
    verificationCode: string;
}
declare class PasswordResetRequestDto {
    email: string;
}
declare class PasswordResetDto {
    email: string;
    resetToken: string;
    newPassword: string;
}
export declare class AuthController {
    private authService;
    private readonly logger;
    constructor(authService: AuthService);
    sendVerificationCode(dto: SendVerificationCodeDto): Promise<{
        action: string;
        message: string;
        success: boolean;
        timeRemaining: number;
        verificationToken: string;
        reason: string;
        then: undefined;
    }>;
    verifyEmailAndLogin(dto: VerifyEmailCodeDto): Promise<{
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
    logout(user: any): Promise<{
        message: string;
    }>;
    getProfile(user: any): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        emailVerified: boolean;
        isActive: boolean;
        createdAt: Date;
        lastLoginAt: Date | null;
    }>;
    requestPasswordReset(dto: PasswordResetRequestDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: PasswordResetDto): Promise<{
        message: string;
    }>;
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
        service: string;
    }>;
}
export {};
