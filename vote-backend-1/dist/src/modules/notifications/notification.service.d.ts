import { MnotifySmsService } from "./service/mnotify-sms.service";
import { EmailService } from "./service/email.service";
import { NotificationQueueService } from "./service/notification-queue.service";
import { AdminNotificationsService } from "./service/admin-notifications.service";
import { PrismaService } from "../../../db";
import { AdminActions } from "../common/enums/nomination-status.enum";
import { Candidate_Position } from "@prisma/client/index";
export declare class NotificationService {
    private notifySmsService;
    private emailService;
    private prisma;
    private notificationQueueService;
    private adminNotificationsService;
    private readonly logger;
    constructor(notifySmsService: MnotifySmsService, emailService: EmailService, prisma: PrismaService, notificationQueueService: NotificationQueueService, adminNotificationsService: AdminNotificationsService);
    private getTemplatePath;
    getTemplate(templateName: string): Promise<string>;
    sendSms(to: string, message: string): Promise<boolean>;
    sendVerificationCode(phoneNumber: string, code: string): Promise<boolean>;
    sendEmail(to: string, subject: string, html: string): Promise<boolean>;
    sendTemplateEmail(to: string, subject: string, template: string, data: any): Promise<boolean>;
    notifyNominationStatusChange(nominationData: any, status: string, reason?: string): Promise<void>;
    notifyAdminsOfNewNomination(data: {
        nominationId: string;
        nomineeName: string;
        position: string;
        createdAt: Date;
    }): Promise<void>;
    notifyAdminsOfReadyNomination(nominationData: any): Promise<void>;
    sendNominatorVerificationEmail(data: {
        nomination: {
            nomineeName: string;
            nomineePosition: Candidate_Position;
        };
        nominatorEmail: string;
        nominatorName: string;
        token: string;
    }): Promise<void>;
    notifyEcMembersOfDecision(nominationId: string, reviewerId: string, action: AdminActions): Promise<void>;
    notifyAspirantOfDecision(nominationId: string, decision: 'APPROVE' | 'REJECT' | null): Promise<void>;
    sendGuarantorVerificationEmail(data: {
        nomination: {
            nomineeName: string;
            nomineePosition: string;
        };
        guarantorName: string;
        guarantorEmail: string;
        token: string;
    }): Promise<void>;
    notifyNominationVerificationComplete(data: {
        nominee: {
            name: string;
            email: string;
            phoneNumber: string;
        };
        position: string;
        createdAt: Date;
    }): Promise<void>;
    sendDeadlineReminder(to: string, type: 'email' | 'sms', hoursLeft: number): Promise<boolean>;
    sendECNotificationEmail(email: string, nominationId: string): Promise<boolean>;
    sendDecisionNotificationEmail(email: string, nomineeName: string, decision: 'APPROVED' | 'REJECTED', reason?: string): Promise<boolean>;
    sendBulkNotifications(recipients: {
        email?: string;
        phone?: string;
    }[], subject: string, message: string, type?: 'email' | 'sms' | 'both'): Promise<{
        success: number;
        failed: number;
    }>;
    private getNominationDetails;
}
