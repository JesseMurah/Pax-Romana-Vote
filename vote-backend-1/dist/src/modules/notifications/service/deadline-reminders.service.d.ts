import { AdminNotificationsService } from "./admin-notifications.service";
import { MnotifySmsService } from "./mnotify-sms.service";
import { EmailService } from "./email.service";
import { DeadlineService } from "../../common/utils/deadline.service";
import { PrismaService } from "../../../../db";
export declare class DeadlineRemindersService {
    private prisma;
    private deadlineService;
    private adminNotificationsService;
    private emailService;
    private smsService;
    private readonly logger;
    constructor(prisma: PrismaService, deadlineService: DeadlineService, adminNotificationsService: AdminNotificationsService, emailService: EmailService, smsService: MnotifySmsService);
    checkDeadlines(): Promise<void>;
    private sendFinalDeadlineReminders;
    private send6HourReminder;
    private send1HourReminder;
    private getAspirantsWithPendingNominations;
    triggerDeadlineCheck(): Promise<void>;
    getDeadlineStatistics(): Promise<any>;
}
