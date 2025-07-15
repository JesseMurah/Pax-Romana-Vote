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
var AdminNotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminNotificationsService = void 0;
const common_1 = require("@nestjs/common");
const email_service_1 = require("./email.service");
const nomination_status_enum_1 = require("../../common/enums/nomination-status.enum");
const index_1 = require("@prisma/client/index");
const db_1 = require("../../../../db");
let AdminNotificationsService = AdminNotificationsService_1 = class AdminNotificationsService {
    emailService;
    prisma;
    logger = new common_1.Logger(AdminNotificationsService_1.name);
    constructor(emailService, prisma) {
        this.emailService = emailService;
        this.prisma = prisma;
    }
    async notifyNewNomination(nominationData) {
        const ecMembers = await this.prisma.user.findMany({
            where: { role: { in: [index_1.UserRole.ADMIN, index_1.UserRole.EC_MEMBER] }, isActive: true },
        });
        await this.emailService.sendAdminNotificationEmail(ecMembers.map((m) => m.email).filter(Boolean), `New Nomination: ${nominationData.nomineeName}`, {
            nomineeName: nominationData.nomineeName,
            position: nominationData.position,
            submissionDate: nominationData.createdAt,
            nominationId: nominationData.nominationId,
            reviewUrl: `${process.env.FRONTEND_URL}/admin/nominations/${nominationData.nominationId}/review`,
        });
    }
    async notifyNominationReady(nominationData) {
        const ecMembers = await this.prisma.user.findMany({
            where: { role: { in: [index_1.UserRole.ADMIN, index_1.UserRole.EC_MEMBER] }, isActive: true },
        });
        await this.emailService.sendAdminNotificationEmail(ecMembers.map((m) => m.email).filter(Boolean), `Nomination Ready for Review: ${nominationData.nomineeName}`, {
            nomineeName: nominationData.nomineeName,
            position: nominationData.position,
            submissionDate: nominationData.createdAt,
            nominationId: nominationData.nominationId,
            reviewUrl: `${process.env.FRONTEND_URL}/admin/nominations/${nominationData.nominationId}/review`,
        });
    }
    async notifyUrgentAction(alert) {
        const adminEmails = await this.getAdminEmails();
        for (const email of adminEmails) {
            await this.emailService.sendEmail({
                to: email,
                subject: `URGENT: ${alert.title}`,
                template: 'admin-urgent-alert',
                templateData: alert,
            });
        }
    }
    async notifyEcMemberOfDecision(data) {
        try {
            return await this.emailService.sendAdminNotificationEmail(data.ecMemberEmails, `Nomination Review Update for ${data.aspirantName}`, {
                reviewerName: data.reviewerName,
                aspirantName: data.aspirantName,
                position: data.position,
                action: data.action,
                nominationId: data.nominationId,
                reviewUrl: `${process.env.FRONTEND_URL}/admin/nominations/${data.nominationId}/review`,
            });
        }
        catch (error) {
            this.logger.error('Failed to notify EC members:', error);
            return false;
        }
    }
    formatPosition(position) {
        const positionMap = {
            [index_1.Candidate_Position.PRESIDENT]: 'President',
            [index_1.Candidate_Position.VICE_PRESIDENT]: 'Vice President',
            [index_1.Candidate_Position.GEN_SECRETARY]: 'General Secretary',
            [index_1.Candidate_Position.FINANCIAL_SECRETARY]: 'Financial Secretary',
            [index_1.Candidate_Position.ORGANIZING_SECRETARY_MAIN]: 'Organizing Secretary (Main)',
            [index_1.Candidate_Position.ORGANIZING_SECRETARY_ASST]: 'Organizing Secretary (Assistant)',
            [index_1.Candidate_Position.PRO_MAIN]: 'PRO (Main)',
            [index_1.Candidate_Position.PRO_ASSISTANT]: 'PRO (Assistant)',
            [index_1.Candidate_Position.WOMEN_COMMISSIONER]: 'Women Commissioner'
        };
        return positionMap[position] || position;
    }
    async notifyDeadlineApproaching(hoursLeft) {
        const adminEmails = await this.getAdminEmails();
        for (const email of adminEmails) {
            await this.emailService.sendEmail({
                to: email,
                subject: `Deadline Alert: ${hoursLeft} hours remaining`,
                template: 'deadline-reminder',
                templateData: { hoursLeft },
            });
        }
    }
    async notifyAspirantOfDecision(nominationId, decision) {
        try {
            const nomination = await this.prisma.nomination.findUnique({
                where: { id: nominationId },
                include: {
                    aspirant: true
                }
            });
            if (!nomination) {
                throw new Error('Nomination not found');
            }
            if (!nomination.aspirant.email) {
                this.logger.warn(`Aspirant ${nomination.aspirant.name} has no email address`);
                return;
            }
            const isApproved = decision === nomination_status_enum_1.AdminActions.APPROVE;
            const actionText = isApproved ? 'approved' : 'rejected';
            const positionText = this.formatPosition(nomination.nomineePosition);
            await this.emailService.sendEmail({
                to: nomination.aspirant.email,
                subject: `Nomination ${isApproved ? 'Approved' : 'Rejected'}: ${positionText}`,
                template: isApproved ? 'aspirant-nomination-approved' : 'aspirant-nomination-rejected',
                templateData: {
                    aspirantName: nomination.aspirant.name,
                    nomineeName: nomination.nomineeName,
                    position: positionText,
                    action: actionText,
                    actionColor: isApproved ? '#28a745' : '#dc3545',
                    nominationId: nominationId,
                    timestamp: new Date().toLocaleString(),
                    ...(isApproved && {
                        nextSteps: 'Your nomination has been approved and you are now a candidate. Further instructions will follow.',
                        candidateNumber: await this.getNextCandidateNumber()
                    }),
                    ...(!isApproved && {
                        rejectionReason: nomination.rejectionReason || 'Decision made by EC consensus',
                        appealProcess: 'If you wish to appeal this decision, please contact the EC within 48 hours.'
                    })
                },
            });
            this.logger.log(`Notification sent to aspirant ${nomination.aspirant.name} for ${actionText} nomination`);
        }
        catch (error) {
            this.logger.error('Failed to send aspirant decision notification:', error);
            throw error;
        }
    }
    async getNextCandidateNumber() {
        const lastCandidate = await this.prisma.candidate.findFirst({
            orderBy: { candidateNumber: 'desc' },
        });
        return lastCandidate ? lastCandidate.candidateNumber + 1 : 1;
    }
    async getEcMemberEmails() {
        return [
            'ec.member1@knust.edu.gh',
            'ec.member2@knust.edu.gh',
            'ec.member3@knust.edu.gh',
        ];
    }
    async getAdminEmails() {
        return [
            'super.admin@knust.edu.gh',
            ...await this.getEcMemberEmails(),
        ];
    }
};
exports.AdminNotificationsService = AdminNotificationsService;
exports.AdminNotificationsService = AdminNotificationsService = AdminNotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [email_service_1.EmailService,
        db_1.PrismaService])
], AdminNotificationsService);
//# sourceMappingURL=admin-notifications.service.js.map