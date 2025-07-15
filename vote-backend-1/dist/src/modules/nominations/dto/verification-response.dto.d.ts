export declare enum VerificationAction {
    CONFIRM = "CONFIRM",
    DECLINE = "DECLINE"
}
export declare class VerificationResponseDto {
    verificationToken: string;
    action: VerificationAction;
    reason?: string;
}
export declare class NomineeVerificationDto {
    verificationToken: string;
    action: VerificationAction;
    reason?: string;
}
