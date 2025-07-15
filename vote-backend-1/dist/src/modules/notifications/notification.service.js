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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const mnotify_sms_service_1 = require("./service/mnotify-sms.service");
const email_service_1 = require("./service/email.service");
const notification_queue_service_1 = require("./service/notification-queue.service");
const admin_notifications_service_1 = require("./service/admin-notifications.service");
const db_1 = require("../../../db");
const index_1 = require("@prisma/client/index");
const path = require("node:path");
const fs = require("node:fs");
let NotificationService = NotificationService_1 = class NotificationService {
    notifySmsService;
    emailService;
    prisma;
    notificationQueueService;
    adminNotificationsService;
    logger = new common_1.Logger(NotificationService_1.name);
    constructor(notifySmsService, emailService, prisma, notificationQueueService, adminNotificationsService) {
        this.notifySmsService = notifySmsService;
        this.emailService = emailService;
        this.prisma = prisma;
        this.notificationQueueService = notificationQueueService;
        this.adminNotificationsService = adminNotificationsService;
        console.log('Instantiating NotificationService');
    }
    getTemplatePath(templateName) {
        if (process.env.NODE_ENV === 'development') {
            return path.join(process.cwd(), 'src', 'modules', 'notifications', 'templates', 'email', templateName);
        }
        return path.join(process.cwd(), 'dist', 'src', 'modules', 'notifications', 'templates', 'email', templateName);
    }
    async getTemplate(templateName) {
        const templatePath = this.getTemplatePath(templateName);
        try {
            return await fs.promises.readFile(templatePath, 'utf8');
        }
        catch (error) {
            console.error(`Template not found: ${templatePath}`);
            throw new Error(`Template ${templateName} not found`);
        }
    }
    async sendSms(to, message) {
        const result = await this.notifySmsService.sendSms({ to, message });
        if (!result.success) {
            this.logger.error(`Failed to send SMS to ${to}: ${result.error}`);
            throw new Error(`Failed to send SMS: ${result.error}`);
        }
        return true;
    }
    async sendVerificationCode(phoneNumber, code) {
        const result = await this.notifySmsService.sendVerificationCode(phoneNumber, code);
        if (!result) {
            this.logger.error(`Failed to send verification code to ${phoneNumber}`);
            throw new Error('Failed to send verification code');
        }
        return true;
    }
    async sendEmail(to, subject, html) {
        try {
            const result = await this.emailService.sendEmail({ to, subject, html });
            return result.success;
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${to}:`, error);
            return false;
        }
    }
    async sendTemplateEmail(to, subject, template, data) {
        try {
            const result = await this.emailService.sendEmail({
                to,
                subject,
                template,
                templateData: data
            });
            return result.success;
        }
        catch (error) {
            this.logger.error(`Failed to send template email to ${to}:`, error);
            return false;
        }
    }
    async notifyNominationStatusChange(nominationData, status, reason) {
        try {
            await this.emailService.sendNominationStatusEmail(nominationData.nominee.email, nominationData.nominee.name, status, reason);
            await this.notifySmsService.sendNominationStatusUpdate(nominationData.nominee.phoneNumber, nominationData.nominee.name, status, reason);
        }
        catch (error) {
            this.logger.error('Failed to send nomination status change notification:', error);
            throw error;
        }
    }
    async notifyAdminsOfNewNomination(data) {
        const admins = await this.prisma.user.findMany({
            where: { role: { in: [index_1.UserRole.ADMIN, index_1.UserRole.EC_MEMBER, index_1.UserRole.SUPER_ADMIN] }, isActive: true },
            select: { email: true },
        });
        const adminEmails = admins.map((a) => a.email).filter(Boolean);
        try {
            const success = await this.emailService.sendAdminNotificationEmail(adminEmails, `New Nomination: ${data.nomineeName}`, {
                nomineeName: data.nomineeName,
                position: data.position,
                submissionDate: data.createdAt.toISOString(),
                reviewUrl: `${process.env.FRONTEND_URL}/admin/nominations/${data.nominationId}/review`,
            });
            if (!success) {
                throw new Error(`Failed to send admin notification to ${adminEmails.join(', ')}`);
            }
            this.logger.log(`Admin notification sent to ${adminEmails.join(', ')}`);
        }
        catch (error) {
            this.logger.error(`Failed to send admin notification`, error);
            throw error;
        }
    }
    async notifyAdminsOfReadyNomination(nominationData) {
        try {
            await this.adminNotificationsService.notifyNominationReady(nominationData);
        }
        catch (error) {
            this.logger.error('Failed to notify admins of ready nomination:', error);
            throw error;
        }
    }
    async sendNominatorVerificationEmail(data) {
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-nomination/${data.token}`;
        try {
            const result = await this.emailService.sendEmail({
                to: data.nominatorEmail,
                subject: `Nominator Verification for ${data.nomination.nomineeName}'s Nomination`,
                template: 'nominator-verification',
                templateData: {
                    nominatorName: data.nominatorName,
                    nomineeName: data.nomination.nomineeName,
                    position: data.nomination.nomineePosition,
                    verificationUrl,
                    expirationHours: 48,
                    submissionDate: new Date().toLocaleDateString(),
                },
            });
            if (!result.success) {
                throw new Error(`Failed to send nominator verification email to ${data.nominatorEmail}`);
            }
            this.logger.log(`Nominator verification email sent to ${data.nominatorEmail}`);
        }
        catch (error) {
            this.logger.error(`Failed to send nominator verification email to ${data.nominatorEmail}`, error);
            throw error;
        }
    }
    async notifyEcMembersOfDecision(nominationId, reviewerId, action) {
        try {
            const nomination = await this.prisma.nomination.findUnique({
                where: { id: nominationId },
                include: {
                    aspirant: true,
                },
            });
            if (!nomination) {
                throw new Error('Nomination not found');
            }
            const ecMembers = await this.prisma.user.findMany({
                where: {
                    role: { in: [index_1.UserRole.ADMIN, index_1.UserRole.EC_MEMBER, index_1.UserRole.SUPER_ADMIN] },
                    id: { not: reviewerId },
                    isActive: true,
                },
            });
            const reviewer = await this.prisma.user.findUnique({
                where: { id: reviewerId },
                select: { name: true },
            });
            await this.adminNotificationsService.notifyEcMemberOfDecision({
                ecMemberEmails: ecMembers.map((m) => m.email).filter(Boolean),
                reviewerName: reviewer?.name || 'Unknown',
                aspirantName: nomination.nomineeName,
                position: nomination.nomineePosition,
                action,
                nominationId,
            });
        }
        catch (error) {
            this.logger.error('Failed to notify EC members of decision:', error);
            throw error;
        }
    }
    async notifyAspirantOfDecision(nominationId, decision) {
        if (!decision)
            return;
        try {
            const nomination = await this.prisma.nomination.findUnique({
                where: { id: nominationId },
                include: {
                    aspirant: true,
                },
            });
            if (!nomination) {
                throw new Error('Nomination not found');
            }
            if (nomination.nomineeEmail) {
                await this.emailService.sendNominationStatusEmail(nomination.nomineeEmail, nomination.nomineeName, decision, nomination.rejectionReason);
            }
        }
        catch (error) {
            this.logger.error('Failed to notify aspirant of decision:', error);
            throw error;
        }
    }
    async sendGuarantorVerificationEmail(data) {
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-nomination/${data.token}`;
        try {
            const result = await this.emailService.sendEmail({
                to: data.guarantorEmail,
                subject: `Guarantor Verification for ${data.nomination.nomineeName}'s Nomination`,
                template: 'guarantor-verification',
                templateData: {
                    guarantorName: data.guarantorName,
                    nomineeName: data.nomination.nomineeName,
                    position: data.nomination.nomineePosition,
                    verificationUrl,
                    expirationHours: 48,
                    submissionDate: new Date().toLocaleDateString(),
                },
            });
            if (!result.success) {
                throw new Error(`Failed to send guarantor verification email to ${data.guarantorEmail}`);
            }
            this.logger.log(`Guarantor verification email sent to ${data.guarantorEmail}`);
        }
        catch (error) {
            this.logger.error(`Failed to send guarantor verification email to ${data.guarantorEmail}`, error);
            throw error;
        }
    }
    async notifyNominationVerificationComplete(data) {
        try {
            const success = await this.emailService.sendVerificationCompleteEmail(data.nominee.email, {
                nomineeName: data.nominee.name,
                position: data.position,
                completionDate: data.createdAt.toISOString(),
            });
            if (!success) {
                throw new Error(`Failed to send verification complete email to ${data.nominee.email}`);
            }
            this.logger.log(`Verification complete email sent to ${data.nominee.email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send verification complete email to ${data.nominee.email}`, error);
            throw error;
        }
    }
    async sendDeadlineReminder(to, type, hoursLeft) {
        try {
            const message = `Reminder: Nomination deadline in ${hoursLeft} hours. Submit your nomination before it's too late!`;
            if (type === 'email') {
                return await this.sendEmail(to, 'Nomination Deadline Reminder', `<p>${message}</p>`);
            }
            else {
                return await this.sendSms(to, message);
            }
        }
        catch (error) {
            this.logger.error(`Failed to send deadline reminder to ${to}:`, error);
            return false;
        }
    }
    async sendECNotificationEmail(email, nominationId) {
        try {
            const nomination = await this.getNominationDetails(nominationId);
            return await this.emailService.sendEmail({
                to: email,
                subject: 'New Nomination Ready for Review',
                template: 'ec-notification',
                templateData: {
                    nomineeName: nomination.nomineeName,
                    position: nomination.nomineePosition,
                    submissionDate: nomination.createdAt,
                    nominationId: nominationId,
                    reviewUrl: `${process.env.FRONTEND_URL}/admin/nominations/${nominationId}/review`
                }
            });
        }
        catch (error) {
            this.logger.error(`Failed to send EC notification email to ${email}:`, error);
            return false;
        }
    }
    async sendDecisionNotificationEmail(email, nomineeName, decision, reason) {
        try {
            const subject = decision === 'APPROVED'
                ? 'Nomination Approved - Congratulations!'
                : 'Nomination Decision Update';
            return await this.emailService.sendEmail({
                to: email,
                subject,
                template: 'nomination-decision',
                templateData: {
                    nomineeName,
                    decision,
                    reason,
                    isApproved: decision === 'APPROVED',
                    nextSteps: decision === 'APPROVED'
                        ? 'Your nomination has been approved and you are now a candidate. Good luck!'
                        : 'You may resubmit your nomination if you address the feedback provided.'
                }
            });
        }
        catch (error) {
            this.logger.error(`Failed to send decision notification email to ${email}:`, error);
            return false;
        }
    }
    async sendBulkNotifications(recipients, subject, message, type = 'both') {
        let success = 0;
        let failed = 0;
        for (const recipient of recipients) {
            try {
                if (type === 'email' || type === 'both') {
                    if (recipient.email) {
                        const result = await this.sendEmail(recipient.email, subject, message);
                        if (result)
                            success++;
                        else
                            failed++;
                    }
                }
                if (type === 'sms' || type === 'both') {
                    if (recipient.phone) {
                        const result = await this.sendSms(recipient.phone, message);
                        if (result)
                            success++;
                        else
                            failed++;
                    }
                }
            }
            catch (error) {
                this.logger.error(`Failed to send notification to recipient:`, error);
                failed++;
            }
        }
        return { success, failed };
    }
    async getNominationDetails(nominationId) {
        try {
            const nomination = await this.prisma.nomination.findUnique({
                where: { id: nominationId },
                include: {
                    aspirant: true,
                },
            });
            if (!nomination) {
                throw new Error(`Nomination with ID ${nominationId} not found`);
            }
            return {
                nomineeName: nomination.nomineeName,
                nomineePosition: nomination.nomineePosition,
                createdAt: nomination.createdAt,
                aspirantName: nomination.aspirant.name,
                aspirantEmail: nomination.aspirant.email,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get nomination details for ${nominationId}:`, error);
            throw error;
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mnotify_sms_service_1.MnotifySmsService,
        email_service_1.EmailService,
        db_1.PrismaService,
        notification_queue_service_1.NotificationQueueService,
        admin_notifications_service_1.AdminNotificationsService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map