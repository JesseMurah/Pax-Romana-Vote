import { PrismaService } from '../../../../db';
import { NotificationService } from '../../notifications/notification.service';
export declare class NominationWorkflowService {
    private prisma;
    private notificationService;
    private readonly logger;
    constructor(prisma: PrismaService, notificationService: NotificationService);
    processVerification(token: string, action: 'CONFIRM' | 'DECLINE', reason?: string): Promise<void>;
}
