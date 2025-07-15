import { AuthService } from './auth.service';
import { AdminLoginDto, LoginDto, RefreshTokenDto, VerifySmsDto } from "./dto/login.dto";
import { AuthResponseDto, VerificationResponseDto } from "./dto/auth-response.dto";
export declare class AuthController {
    private authService;
    private readonly logger;
    constructor(authService: AuthService);
    sendVerificationCode(loginDto: LoginDto): Promise<VerificationResponseDto>;
    verifyAndLogin(verifySmsDto: VerifySmsDto): Promise<AuthResponseDto>;
    adminLogin(adminLoginDto: AdminLoginDto): Promise<AuthResponseDto>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
        access_token: string;
    }>;
    logout(user: any): Promise<{
        message: string;
    }>;
    getProfile(user: any): Promise<{
        id: any;
        name: any;
        phone: any;
        email: any;
        role: any;
        phoneVerified: any;
        emailVerified: any;
    }>;
}
