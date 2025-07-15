import { ConfigService } from "@nestjs/config";
import { EmailMessageDto } from "../dto/email-message.dto";
export declare class EmailService {
    private configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    sendEmail(emailDto: EmailMessageDto): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    private renderTemplate;
    private getTemplatePath;
    sendNominatorVerificationEmail(to: string, data: any): Promise<void>;
    sendGuarantorVerificationEmail(to: string, data: any): Promise<void>;
    sendNominationStatusEmail(email: string, nomineeName: string, status: string, reason?: string): Promise<boolean>;
    sendNominationConfirmationEmail(email: string, nominationData: any): Promise<boolean>;
    sendVerificationCompleteEmail(email: string, nominationData: any): Promise<boolean>;
    sendDeadlineReminderEmail(email: string, hoursLeft: number): Promise<boolean>;
    sendAdminNotificationEmail(emails: string[], subject: string, data: any): Promise<boolean>;
}
