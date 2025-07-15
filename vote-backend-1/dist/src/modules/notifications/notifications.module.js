"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification.service");
const notifications_controller_1 = require("./notifications.controller");
const bull_1 = require("@nestjs/bull");
const mnotify_sms_service_1 = require("./service/mnotify-sms.service");
const email_service_1 = require("./service/email.service");
const notification_queue_service_1 = require("./service/notification-queue.service");
const admin_notifications_service_1 = require("./service/admin-notifications.service");
const deadline_reminders_service_1 = require("./service/deadline-reminders.service");
const config_1 = require("@nestjs/config");
const db_1 = require("../../../db");
const common_module_1 = require("../common/common.module");
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({}),
            bull_1.BullModule.registerQueue({
                name: 'sms-queue',
            }),
            bull_1.BullModule.registerQueue({
                name: 'email-queue',
            }),
            db_1.DbModule,
            (0, common_1.forwardRef)(() => common_module_1.CommonModule),
        ],
        controllers: [notifications_controller_1.NotificationTestController],
        providers: [
            notification_service_1.NotificationService,
            mnotify_sms_service_1.MnotifySmsService,
            email_service_1.EmailService,
            notification_queue_service_1.NotificationQueueService,
            admin_notifications_service_1.AdminNotificationsService,
            deadline_reminders_service_1.DeadlineRemindersService,
        ],
        exports: [
            notification_service_1.NotificationService,
            mnotify_sms_service_1.MnotifySmsService,
            email_service_1.EmailService,
            admin_notifications_service_1.AdminNotificationsService,
            deadline_reminders_service_1.DeadlineRemindersService,
        ],
    })
], NotificationsModule);
//# sourceMappingURL=notifications.module.js.map