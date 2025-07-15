"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DeadlineRemindersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeadlineRemindersService = void 0;
const common_1 = require("@nestjs/common");
const admin_notifications_service_1 = require("./admin-notifications.service");
const mnotify_sms_service_1 = require("./mnotify-sms.service");
const email_service_1 = require("./email.service");
const deadline_service_1 = require("../../common/utils/deadline.service");
const schedule_1 = require("@nestjs/schedule");
const db_1 = require("../../../../db");
let DeadlineRemindersService = DeadlineRemindersService_1 = class DeadlineRemindersService {
    prisma;
    deadlineService;
    adminNotificationsService;
    emailService;
    smsService;
    logger = new common_1.Logger(DeadlineRemindersService_1.name);
    constructor(prisma, deadlineService, adminNotificationsService, emailService, smsService) {
        this.prisma = prisma;
        this.deadlineService = deadlineService;
        this.adminNotificationsService = adminNotificationsService;
        this.emailService = emailService;
        this.smsService = smsService;
    }
    async checkDeadlines() {
        try {
            const timeRemaining = this.deadlineService.getTimeRemaining();
            if (timeRemaining.days === 0 && timeRemaining.hours <= 24) {
                await this.adminNotificationsService.notifyDeadlineApproaching(timeRemaining.hours);
            }
            if (timeRemaining.days === 1 && timeRemaining.hours === 0) {
                await this.sendFinalDeadlineReminders();
            }
            if (timeRemaining.days === 0 && timeRemaining.hours === 6) {
                await this.send6HourReminder();
            }
            if (timeRemaining.days === 0 && timeRemaining.hours === 1) {
                await this.send1HourReminder();
            }
            this.logger.log(`Deadline check completed. Time remaining: ${timeRemaining.days} days, ${timeRemaining.hours} hours`);
        }
        catch (error) {
            this.logger.error('Error checking deadlines:', error);
        }
    }
    async sendFinalDeadlineReminders() {
        try {
            const aspirants = await this.getAspirantsWithPendingNominations();
            this.logger.log(`Sending final deadline reminders to ${aspirants.length} aspirants`);
            for (const aspirant of aspirants) {
                await this.emailService.sendEmail({
                    to: aspirant.email,
                    subject: 'FINAL REMINDER: 24 Hours Left for Nominations',
                    template: 'final-deadline-reminder',
                    templateData: {
                        name: aspirant.name,
                        position: aspirant.position,
                        timeLeft: '24 hours'
                    },
                });
                if (aspirant.phone) {
                    await this.smsService.sendSms({
                        to: aspirant.phone,
                        message: `FINAL REMINDER: 24 hours left to complete your Pax Romana KNUST nomination. Visit the portal now.`,
                    });
                }
            }
        }
        catch (error) {
            this.logger.error('Error sending final deadline reminders:', error);
        }
    }
    async send6HourReminder() {
        try {
            const aspirants = await this.getAspirantsWithPendingNominations();
            this.logger.log(`Sending 6-hour deadline reminders to ${aspirants.length} aspirants`);
            for (const aspirant of aspirants) {
                await this.emailService.sendEmail({
                    to: aspirant.email,
                    subject: 'URGENT: 6 Hours Left for Nominations',
                    template: 'urgent-deadline-reminder',
                    templateData: {
                        name: aspirant.name,
                        timeLeft: '6 hours'
                    },
                });
                if (aspirant.phone) {
                    await this.smsService.sendSms({
                        to: aspirant.phone,
                        message: `URGENT: Only 6 hours left to complete your Pax Romana KNUST nomination!`,
                    });
                }
            }
        }
        catch (error) {
            this.logger.error('Error sending 6-hour deadline reminders:', error);
        }
    }
    async send1HourReminder() {
        try {
            const aspirants = await this.getAspirantsWithPendingNominations();
            this.logger.log(`Sending 1-hour deadline reminders to ${aspirants.length} aspirants`);
            for (const aspirant of aspirants) {
                await this.emailService.sendEmail({
                    to: aspirant.email,
                    subject: 'LAST CALL: 1 Hour Left for Nominations',
                    template: 'last-call-reminder',
                    templateData: {
                        name: aspirant.name,
                        timeLeft: '1 hour'
                    },
                });
                if (aspirant.phone) {
                    await this.smsService.sendSms({
                        to: aspirant.phone,
                        message: `LAST CALL: Only 1 hour left to complete your Pax Romana KNUST nomination!`,
                    });
                }
            }
        }
        catch (error) {
            this.logger.error('Error sending 1-hour deadline reminders:', error);
        }
    }
    async getAspirantsWithPendingNominations() {
        try {
            const aspirants = await this.prisma.user.findMany({
                where: {
                    role: 'ASPIRANT',
                    nominations: {
                        some: {
                            status: {
                                in: ['PENDING', 'AWAITING_VERIFICATION', 'PARTIALLY_VERIFIED']
                            }
                        }
                    }
                },
                include: {
                    nominations: {
                        where: {
                            status: {
                                in: ['PENDING', 'AWAITING_VERIFICATION', 'PARTIALLY_VERIFIED']
                            }
                        },
                        select: {
                            id: true,
                            nomineePosition: true,
                            status: true,
                            createdAt: true
                        }
                    }
                }
            });
            return aspirants.map(aspirant => ({
                id: aspirant.id,
                name: aspirant.name,
                email: aspirant.email,
                phone: aspirant.phone,
                position: aspirant.nominations[0]?.nomineePosition || 'Unknown',
                nominationStatus: aspirant.nominations[0]?.status || 'Unknown',
                submissionDate: aspirant.nominations[0]?.createdAt
            }));
        }
        catch (error) {
            this.logger.error('Error fetching aspirants with pending nominations:', error);
            return [];
        }
    }
    async triggerDeadlineCheck() {
        this.logger.log('Manually triggering deadline check');
        await this.checkDeadlines();
    }
    async getDeadlineStatistics() {
        try {
            const timeRemaining = this.deadlineService.getTimeRemaining();
            const pendingNominations = await this.prisma.nomination.count({
                where: {
                    status: {
                        in: ['PENDING', 'AWAITING_VERIFICATION', 'PARTIALLY_VERIFIED']
                    }
                }
            });
            const totalNominations = await this.prisma.nomination.count();
            const approvedNominations = await this.prisma.nomination.count({
                where: { status: 'APPROVED' }
            });
            return {
                timeRemaining,
                pendingNominations,
                totalNominations,
                approvedNominations,
                completionRate: totalNominations > 0 ? (approvedNominations / totalNominations) * 100 : 0
            };
        }
        catch (error) {
            this.logger.error('Error getting deadline statistics:', error);
            return null;
        }
    }
};
exports.DeadlineRemindersService = DeadlineRemindersService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DeadlineRemindersService.prototype, "checkDeadlines", null);
exports.DeadlineRemindersService = DeadlineRemindersService = DeadlineRemindersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_1.PrismaService,
        deadline_service_1.DeadlineService,
        admin_notifications_service_1.AdminNotificationsService,
        email_service_1.EmailService,
        mnotify_sms_service_1.MnotifySmsService])
], DeadlineRemindersService);
//# sourceMappingURL=deadline-reminders.service.js.map