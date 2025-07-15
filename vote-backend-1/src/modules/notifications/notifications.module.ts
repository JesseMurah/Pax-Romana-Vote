import {forwardRef, Module} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationTestController } from './notifications.controller';
import { BullModule } from "@nestjs/bull";
import { MnotifySmsService } from "./service/mnotify-sms.service";
import { EmailService } from "./service/email.service";
import { NotificationQueueService } from "./service/notification-queue.service";
import { AdminNotificationsService } from "./service/admin-notifications.service";
import { DeadlineRemindersService } from "./service/deadline-reminders.service";
import { ConfigModule } from "@nestjs/config";
import { DbModule } from "../../../db";
import {CommonModule} from "../common/common.module";

@Module({
  imports: [
      ConfigModule.forRoot({}),
    BullModule.registerQueue({
      name: 'sms-queue',
    }),
    BullModule.registerQueue({
      name: 'email-queue',
    }),
      DbModule,
      forwardRef(() => CommonModule),
  ],
  controllers: [NotificationTestController],
  providers: [
    NotificationService,
    MnotifySmsService,
    EmailService,
    NotificationQueueService,
    AdminNotificationsService,
    DeadlineRemindersService,
  ],
  exports: [
    NotificationService,
    MnotifySmsService,
    EmailService,
    AdminNotificationsService,
    DeadlineRemindersService,
  ],
})
export class NotificationsModule {}
