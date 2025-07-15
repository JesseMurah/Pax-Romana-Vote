import { GuarantorVerificationService } from "../services/guarantor-verification.service";
import { VerificationResponseDto } from "../../auth/dto/auth-response.dto";
export declare class GuarantorVerificationController {
    private guarantorVerificationService;
    constructor(guarantorVerificationService: GuarantorVerificationService);
    getVerificationDetails(token: string): Promise<{
        nomination: any;
        guarantorName: string;
        guarantorEmail: string;
        tokenType: "GUARANTOR_VERIFICATION";
        isExpired: false;
        isAlreadyVerified: boolean;
        verificationStatus: string;
    }>;
    verifyGuarantor(verificationDto: VerificationResponseDto): Promise<{
        message: string;
        nominationId: string;
    }>;
}
