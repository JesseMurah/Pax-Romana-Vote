import { PrismaService } from "../../../../db";
import { NominationWorkflowService } from "./nomination-workflow.service";
import { VerificationResponseDto } from "../../auth/dto/auth-response.dto";
export declare class GuarantorVerificationService {
    private prisma;
    private workflowService;
    private notificationService;
    constructor(prisma: PrismaService, workflowService: NominationWorkflowService);
    verifyGuarantor(verificationDto: VerificationResponseDto): Promise<{
        message: string;
        nominationId: string;
    }>;
    getVerificationDetails(token: string): Promise<{
        nomination: any;
        guarantorName: string;
        guarantorEmail: string;
        tokenType: "GUARANTOR_VERIFICATION";
        isExpired: false;
        isAlreadyVerified: boolean;
        verificationStatus: string;
    }>;
    resendVerificationEmail(nominationId: string, guarantorEmail: string): Promise<{
        message: string;
        expiresAt: Date;
    }>;
    private generateVerificationToken;
}
