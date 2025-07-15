import { SmsMessageDto } from "../dto/sms-message.dto";
import { EmailMessageDto } from "../dto/email-message.dto";
import { Queue } from "bull";
export declare class NotificationQueueService {
    private smsQueue;
    private emailQueue;
    constructor(smsQueue: Queue, emailQueue: Queue);
    queueSms(smsDto: SmsMessageDto, delay?: number): Promise<void>;
    queueEmail(emailDto: EmailMessageDto, delay?: number): Promise<void>;
    queueBulkEmails(emails: EmailMessageDto[], delay?: number): Promise<void>;
}
