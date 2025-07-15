import { NotificationService } from './notification.service';
export declare class NotificationTestController {
    private notificationsService;
    constructor(notificationsService: NotificationService);
    testSms(body: {
        phoneNumber: string;
        message: string;
    }): Promise<boolean>;
    testEmail(body: {
        email: string;
        subject: string;
        message: string;
    }): Promise<boolean>;
    testVerificationCode(body: {
        phoneNumber: string;
    }): Promise<boolean>;
}
