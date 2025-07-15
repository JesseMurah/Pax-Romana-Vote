import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { AdminLoginDto, LoginDto, RefreshTokenDto, VerifySmsDto } from "./dto/login.dto";
import { ConfigService } from "@nestjs/config";
import { NotificationService } from "../notifications/notification.service";
import { AuthResponseDto, VerificationResponseDto } from "./dto/auth-response.dto";
export declare class AuthService {
    private jwtService;
    private configService;
    private usersService;
    private notificationsService;
    private readonly logger;
    private verificationCodes;
    private readonly MAX_ATTEMPTS;
    private readonly CODE_EXPIRY;
    private readonly RESEND_COOLDOWN;
    constructor(jwtService: JwtService, configService: ConfigService, usersService: UsersService, notificationsService: NotificationService);
    sendVerificationCode(loginDto: LoginDto): Promise<VerificationResponseDto>;
    verifyAndLogin(verifySmsDto: VerifySmsDto): Promise<AuthResponseDto>;
    adminLogin(adminLoginDto: AdminLoginDto): Promise<AuthResponseDto>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
        access_token: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    private generateTokens;
    cleanupExpiredCodes(): void;
}
