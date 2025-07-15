import { UserRole } from "@prisma/client/index";
export declare class AuthResponseDto {
    access_token: string;
    refresh_token: string;
    user: {
        id: string;
        name: string;
        phone?: string;
        email?: string;
        role: UserRole;
        phoneVerified: boolean;
        emailVerified?: boolean;
    };
}
export declare class VerificationResponseDto {
    verificationToken: string;
    action: 'approve' | 'decline';
    reason?: string;
}
export declare class VerificationDetailsResponseDto {
    nomination: {
        id: string;
        nomineeName: string;
        nomineePosition: string;
        status: string;
        createdAt: Date;
    };
    guarantorName: string;
    guarantorEmail: string;
    tokenType: string;
    isExpired: boolean;
    isAlreadyVerified: boolean;
    verificationStatus: string;
}
export declare class VerificationSuccessResponseDto {
    message: string;
    success: boolean;
    timeRemaining?: number;
    nominationId?: string;
    expiresAt?: Date;
}
