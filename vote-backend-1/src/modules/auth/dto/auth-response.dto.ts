import { UserRole } from "@prisma/client/index";

export class AuthResponseDto {
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

export class VerificationResponseDto {
    verificationToken: string;
    action: 'approve' | 'decline';
    reason?: string;
}

export class VerificationDetailsResponseDto {
    nomination: {
        id: string;
        nomineeName: string;
        nomineePosition: string;
        status: string;
        createdAt: Date;
        // Add other nomination fields as needed
    };
    guarantorName: string;
    guarantorEmail: string;
    tokenType: string;
    isExpired: boolean;
    isAlreadyVerified: boolean;
    verificationStatus: string;
}

export class VerificationSuccessResponseDto {
    message: string;
    success: boolean;
    timeRemaining?: number; // seconds until can resend
    nominationId?: string;
    expiresAt?: Date;
}