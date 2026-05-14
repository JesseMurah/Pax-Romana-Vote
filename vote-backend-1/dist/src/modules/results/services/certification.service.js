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
var CertificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificationService = void 0;
const common_1 = require("@nestjs/common");
const real_time_service_1 = require("../../real-time/services/real-time.service");
const db_1 = require("../../../../db");
const vote_counting_service_1 = require("./vote-counting.service");
const index_1 = require("@prisma/client/index");
const sse_event_types_enum_1 = require("../../real-time/enums/sse-event-types.enum");
const result_status_enum_1 = require("../enums/result-status.enum");
let CertificationService = CertificationService_1 = class CertificationService {
    prisma;
    voteCountingService;
    sseService;
    logger = new common_1.Logger(CertificationService_1.name);
    constructor(prisma, voteCountingService, sseService) {
        this.prisma = prisma;
        this.voteCountingService = voteCountingService;
        this.sseService = sseService;
    }
    async certifyResults(certifyDto, certifiedByUserId) {
        this.logger.log(`Starting result certification by user ${certifiedByUserId}`);
        const certifyingUser = await this.prisma.user.findUnique({
            where: { id: certifiedByUserId },
        });
        if (!certifyingUser || certifyingUser.role !== index_1.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('Only Super Admin can certify results');
        }
        const certifiedPositions = [];
        const errors = [];
        for (const positionCert of certifyDto.positions) {
            try {
                await this.certifyPosition(positionCert.position, certifiedByUserId, certifyingUser.name, positionCert.comments);
                certifiedPositions.push(positionCert.position);
                this.sseService.broadcast({
                    type: sse_event_types_enum_1.SseEventType.RESULT_UPDATE,
                    data: {
                        position: positionCert.position,
                        status: 'CERTIFIED',
                        certifiedBy: certifyingUser.name,
                        certifiedAt: new Date(),
                    },
                    timestamp: new Date(),
                });
            }
            catch (error) {
                this.logger.error(`Failed to certify ${positionCert.position}:`, error);
                errors.push(`${positionCert.position}: ${error.message}`);
            }
        }
        if (certifiedPositions.length > 0) {
            await this.createCertificationRecord(certifiedPositions, certifiedByUserId, certifyDto.overallComments);
        }
        this.logger.log(`Certification completed. Success: ${certifiedPositions.length}, Errors: ${errors.length}`);
        return {
            success: certifiedPositions.length > 0,
            certifiedPositions,
            errors,
        };
    }
    async certifyPosition(position, certifiedBy, certifiedByName, comments) {
        const positionResult = await this.voteCountingService.countVotesForPosition(position, false);
        if (positionResult.status === result_status_enum_1.ResultStatus.DISPUTED) {
            throw new common_1.BadRequestException(`Position ${position} has disputed results and cannot be certified`);
        }
        if (positionResult.candidates.length === 0) {
            throw new common_1.BadRequestException(`Position ${position} has no candidates`);
        }
        if (positionResult.candidates.length === 1 && !positionResult.unopposedThresholdMet) {
            throw new common_1.BadRequestException(`Unopposed candidate for ${position} did not meet 50% threshold (${positionResult.candidates[0].percentage}%)`);
        }
        await this.prisma.$executeRaw `
      INSERT INTO result_certifications (
        id, position, certified_by, certified_by_name, certification_comments, 
        final_vote_counts, certified_at
      ) VALUES (
        gen_random_uuid()::text, ${position}, ${certifiedBy}, ${certifiedByName}, 
        ${comments || ''}, ${JSON.stringify(positionResult.candidates)}, NOW()
      )
    `;
        for (const candidate of positionResult.candidates) {
            await this.prisma.candidate.update({
                where: { id: candidate.candidateId },
                data: {
                    voteCount: candidate.voteCount,
                },
            });
        }
        this.logger.log(`Position ${position} certified by ${certifiedByName}`);
    }
    async createCertificationRecord(certifiedPositions, certifiedBy, overallComments) {
        await this.prisma.auditLog.create({
            data: {
                action: 'CERTIFY_RESULTS',
                entity: 'ELECTION_RESULTS',
                entityId: 'ELECTION_2025',
                newValues: {
                    certifiedPositions,
                    overallComments,
                    certificationTimestamp: new Date(),
                },
                userId: certifiedBy,
            },
        });
    }
    async getCertificationHistory() {
        const certificationLogs = await this.prisma.auditLog.findMany({
            where: {
                action: 'CERTIFY_RESULTS',
                entity: 'ELECTION_RESULTS',
            },
            include: {
                user: {
                    select: { name: true, email: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return certificationLogs.map(log => ({
            id: log.id,
            certifiedBy: log.user?.name || 'Unknown',
            certifiedByEmail: log.user?.email,
            certifiedAt: log.createdAt,
            certifiedPositions: log.newValues?.['certifiedPositions'] || [],
            comments: log.newValues?.['overallComments'],
        }));
    }
    async isElectionFullyCertified() {
        const allPositions = Object.values(index_1.Candidate_Position);
        const certificationHistory = await this.getCertificationHistory();
        if (certificationHistory.length === 0)
            return false;
        const latestCertification = certificationHistory[0];
        const certifiedPositions = latestCertification.certifiedPositions || [];
        return allPositions.every(position => certifiedPositions.includes(position));
    }
    async revokeCertification(position, revokedBy, reason) {
        const revokingUser = await this.prisma.user.findUnique({
            where: { id: revokedBy },
        });
        if (!revokingUser || revokingUser.role !== index_1.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('Only Super Admin can revoke certification');
        }
        await this.prisma.auditLog.create({
            data: {
                action: 'REVOKE_CERTIFICATION',
                entity: 'ELECTION_RESULTS',
                entityId: position,
                newValues: {
                    revokedBy: revokingUser.name,
                    reason,
                    revokedAt: new Date(),
                },
                userId: revokedBy,
            },
        });
        await this.voteCountingService.clearResultsCache();
        this.sseService.broadcastToAdmins({
            type: sse_event_types_enum_1.SseEventType.SYSTEM_STATUS,
            data: {
                action: 'CERTIFICATION_REVOKED',
                position,
                revokedBy: revokingUser.name,
                reason,
            },
            timestamp: new Date(),
        });
        this.logger.warn(`Certification revoked for ${position} by ${revokingUser.name}: ${reason}`);
    }
};
exports.CertificationService = CertificationService;
exports.CertificationService = CertificationService = CertificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_1.PrismaService,
        vote_counting_service_1.VoteCountingService,
        real_time_service_1.RealTimeService])
], CertificationService);
//# sourceMappingURL=certification.service.js.map