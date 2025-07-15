import { EmailService } from "./email.service";
import { AdminAlertDto } from "../dto/admin-alert.dto";
import { AdminActions } from "../../common/enums/nomination-status.enum";
import { PrismaService } from "../../../../db";
export declare class AdminNotificationsService {
    private emailService;
    private prisma;
    private readonly logger;
    constructor(emailService: EmailService, prisma: PrismaService);
    notifyNewNomination(nominationData: any): Promise<void>;
    notifyNominationReady(nominationData: any): Promise<void>;
    notifyUrgentAction(alert: AdminAlertDto): Promise<void>;
    notifyEcMemberOfDecision(data: {
        ecMemberEmails: string[];
        reviewerName: string;
        aspirantName: string;
        position: string;
        action: string;
        nominationId: string;
    }): Promise<boolean>;
    private formatPosition;
    notifyDeadlineApproaching(hoursLeft: number): Promise<void>;
    notifyAspirantOfDecision(nominationId: string, decision: AdminActions): Promise<void>;
    private getNextCandidateNumber;
    private getEcMemberEmails;
    private getAdminEmails;
}
