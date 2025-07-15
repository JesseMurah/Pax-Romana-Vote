import { Injectable, Logger} from "@nestjs/common";
import { AdminNotificationsService } from "./admin-notifications.service";
import { MnotifySmsService } from "./mnotify-sms.service";
import { EmailService } from "./email.service";
import { DeadlineService } from "../../common/utils/deadline.service";
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from "../../../../db";

@Injectable()
export class DeadlineRemindersService {
    private readonly logger = new Logger(DeadlineRemindersService.name);

    constructor(
        private prisma: PrismaService,
        private deadlineService: DeadlineService,
        private adminNotificationsService: AdminNotificationsService,
        private emailService: EmailService,
        private smsService: MnotifySmsService
    ) {}

    @Cron(CronExpression.EVERY_HOUR)
    async checkDeadlines(): Promise<void> {
        try {
            const timeRemaining = this.deadlineService.getTimeRemaining();

            // Check if less than 24 hours remaining
            if (timeRemaining.days === 0 && timeRemaining.hours <= 24) {
                await this.adminNotificationsService.notifyDeadlineApproaching(timeRemaining.hours);
            }

            // Send final reminders when exactly 24 hours left
            if (timeRemaining.days === 1 && timeRemaining.hours === 0) {
                await this.sendFinalDeadlineReminders();
            }

            // Send a 6-hour reminder
            if (timeRemaining.days === 0 && timeRemaining.hours === 6) {
                await this.send6HourReminder();
            }

            // Send a 1-hour reminder
            if (timeRemaining.days === 0 && timeRemaining.hours === 1) {
                await this.send1HourReminder();
            }

            this.logger.log(`Deadline check completed. Time remaining: ${timeRemaining.days} days, ${timeRemaining.hours} hours`);
        } catch (error) {
            this.logger.error('Error checking deadlines:', error);
        }
    }

    private async sendFinalDeadlineReminders(): Promise<void> {
        try {
            // Send final reminders to all aspirants
            const aspirants = await this.getAspirantsWithPendingNominations();

            this.logger.log(`Sending final deadline reminders to ${aspirants.length} aspirants`);

            for (const aspirant of aspirants) {
                // Send email reminder
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

                // Send SMS a reminder if the phone number exists
                if (aspirant.phone) {
                    await this.smsService.sendSms({
                        to: aspirant.phone,
                        message: `FINAL REMINDER: 24 hours left to complete your Pax Romana KNUST nomination. Visit the portal now.`,
                    });
                }
            }
        } catch (error) {
            this.logger.error('Error sending final deadline reminders:', error);
        }
    }

    private async send6HourReminder(): Promise<void> {
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
        } catch (error) {
            this.logger.error('Error sending 6-hour deadline reminders:', error);
        }
    }

    private async send1HourReminder(): Promise<void> {
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
        } catch (error) {
            this.logger.error('Error sending 1-hour deadline reminders:', error);
        }
    }

    private async getAspirantsWithPendingNominations(): Promise<any[]> {
        try {
            // Query database for aspirants with pending nominations
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

            // Transform data for easier use
            return aspirants.map(aspirant => ({
                id: aspirant.id,
                name: aspirant.name,
                email: aspirant.email,
                phone: aspirant.phone,
                position: aspirant.nominations[0]?.nomineePosition || 'Unknown',
                nominationStatus: aspirant.nominations[0]?.status || 'Unknown',
                submissionDate: aspirant.nominations[0]?.createdAt
            }));
        } catch (error) {
            this.logger.error('Error fetching aspirants with pending nominations:', error);
            return [];
        }
    }

    // Manual trigger for testing
    async triggerDeadlineCheck(): Promise<void> {
        this.logger.log('Manually triggering deadline check');
        await this.checkDeadlines();
    }

    // Get statistics for the admin dashboard
    async getDeadlineStatistics(): Promise<any> {
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
        } catch (error) {
            this.logger.error('Error getting deadline statistics:', error);
            return null;
        }
    }
}