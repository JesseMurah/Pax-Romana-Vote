import { Injectable, Logger } from "@nestjs/common";
import { EmailService } from "./email.service";
import { AdminAlertDto } from "../dto/admin-alert.dto";
import {AdminActions} from "../../common/enums/nomination-status.enum";
import {Candidate_Position, UserRole} from '@prisma/client/index';
import { PrismaService } from "../../../../db";


@Injectable()
export class AdminNotificationsService {
    private readonly logger = new Logger(AdminNotificationsService.name);

    constructor(
        private emailService: EmailService,
        private prisma: PrismaService
    ) {}

    async notifyNewNomination(nominationData: any): Promise<void> {
        const ecMembers = await this.prisma.user.findMany({
            where: { role: { in: [UserRole.ADMIN, UserRole.EC_MEMBER] }, isActive: true },
        });

        await this.emailService.sendAdminNotificationEmail(
            ecMembers.map((m) => m.email).filter(Boolean) as string[],
            `New Nomination: ${nominationData.nomineeName}`,
            {
                nomineeName: nominationData.nomineeName,
                position: nominationData.position,
                submissionDate: nominationData.createdAt,
                nominationId: nominationData.nominationId,
                reviewUrl: `${process.env.FRONTEND_URL}/admin/nominations/${nominationData.nominationId}/review`,
            },
        );
    }

    async notifyNominationReady(nominationData: any): Promise<void> {
        const ecMembers = await this.prisma.user.findMany({
            where: { role: { in: [UserRole.ADMIN, UserRole.EC_MEMBER] }, isActive: true },
        });

        await this.emailService.sendAdminNotificationEmail(
            ecMembers.map((m) => m.email).filter(Boolean) as string[],
            `Nomination Ready for Review: ${nominationData.nomineeName}`,
            {
                nomineeName: nominationData.nomineeName,
                position: nominationData.position,
                submissionDate: nominationData.createdAt,
                nominationId: nominationData.nominationId,
                reviewUrl: `${process.env.FRONTEND_URL}/admin/nominations/${nominationData.nominationId}/review`,
            },
        );
    }

    async notifyUrgentAction(alert: AdminAlertDto): Promise<void> {
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

    async notifyEcMemberOfDecision(data: {
        ecMemberEmails: string[];
        reviewerName: string;
        aspirantName: string;
        position: string;
        action: string;
        nominationId: string;
    }): Promise<boolean> {
        try {
            return await this.emailService.sendAdminNotificationEmail(
                data.ecMemberEmails,
                `Nomination Review Update for ${data.aspirantName}`,
                {
                    reviewerName: data.reviewerName,
                    aspirantName: data.aspirantName,
                    position: data.position,
                    action: data.action,
                    nominationId: data.nominationId,
                    reviewUrl: `${process.env.FRONTEND_URL}/admin/nominations/${data.nominationId}/review`,
                },
            );
        } catch (error) {
            this.logger.error('Failed to notify EC members:', error);
            return false;
        }
    }

    private formatPosition(position: Candidate_Position): string {
        const positionMap: Record<Candidate_Position, string> = {
            [Candidate_Position.PRESIDENT]: 'President',
            [Candidate_Position.VICE_PRESIDENT]: 'Vice President',
            [Candidate_Position.GEN_SECRETARY]: 'General Secretary',
            [Candidate_Position.FINANCIAL_SECRETARY]: 'Financial Secretary',
            [Candidate_Position.ORGANIZING_SECRETARY_MAIN]: 'Organizing Secretary (Main)',
            [Candidate_Position.ORGANIZING_SECRETARY_ASST]: 'Organizing Secretary (Assistant)',
            [Candidate_Position.PRO_MAIN]: 'PRO (Main)',
            [Candidate_Position.PRO_ASSISTANT]: 'PRO (Assistant)',
            [Candidate_Position.WOMEN_COMMISSIONER]: 'Women Commissioner'
        };

        return positionMap[position] || position;
    }

    async notifyDeadlineApproaching(hoursLeft: number): Promise<void> {
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


    async notifyAspirantOfDecision(nominationId: string, decision: AdminActions): Promise<void> {
        try {
            // Get the nomination details with aspirant information
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

            const isApproved = decision === AdminActions.APPROVE;
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
                    // Additional data for approved nominations
                    ...(isApproved && {
                        nextSteps: 'Your nomination has been approved and you are now a candidate. Further instructions will follow.',
                        candidateNumber: await this.getNextCandidateNumber()
                    }),
                    // Additional data for rejected nominations
                    ...(!isApproved && {
                        //@ts-ignore
                        rejectionReason: nomination.rejectionReason || 'Decision made by EC consensus',
                        appealProcess: 'If you wish to appeal this decision, please contact the EC within 48 hours.'
                    })
                },
            });

            this.logger.log(`Notification sent to aspirant ${nomination.aspirant.name} for ${actionText} nomination`);
        } catch (error) {
            this.logger.error('Failed to send aspirant decision notification:', error);
            throw error;
        }
    }

    private async getNextCandidateNumber(): Promise<number> {
        const lastCandidate = await this.prisma.candidate.findFirst({
            orderBy: { candidateNumber: 'desc' },
        });
        return lastCandidate ? lastCandidate.candidateNumber + 1 : 1;
    }

    private async getEcMemberEmails(): Promise<string[]> {
        // Query database for EC member emails
        return [
            'ec.member1@knust.edu.gh',
            'ec.member2@knust.edu.gh',
            'ec.member3@knust.edu.gh',
        ];
    }

    private async getAdminEmails(): Promise<string[]> {
        // Query database for all admin emails
        return [
            'super.admin@knust.edu.gh',
            ...await this.getEcMemberEmails(),
        ];
    }
}