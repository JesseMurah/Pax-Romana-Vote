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
var VoteCountingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteCountingService = void 0;
const common_1 = require("@nestjs/common");
const db_1 = require("../../../../db");
const cache_service_1 = require("../../caches/cache.service");
const index_1 = require("@prisma/client/index");
const result_status_enum_1 = require("../enums/result-status.enum");
const vote_encryption_service_1 = require("./vote-encryption.service");
let VoteCountingService = VoteCountingService_1 = class VoteCountingService {
    prisma;
    cacheService;
    encryption;
    logger = new common_1.Logger(VoteCountingService_1.name);
    UNOPPOSED_THRESHOLD = 0.5;
    constructor(prisma, cacheService, encryption) {
        this.prisma = prisma;
        this.cacheService = cacheService;
        this.encryption = encryption;
    }
    async countAllVotes() {
        const positions = Object.values(index_1.Candidate_Position);
        const results = [];
        for (const position of positions) {
            const result = await this.countVotesForPosition(position);
            results.push(result);
        }
        return results;
    }
    async countVotesForPosition(position, useCache = true) {
        const cacheKey = `position_results:${position}`;
        if (useCache) {
            const cached = await this.cacheService.get(cacheKey);
            if (cached) {
                return cached;
            }
        }
        this.logger.log(`Counting votes for position: ${position}`);
        const candidates = await this.prisma.candidate.findMany({
            where: { position, isActive: true },
            include: { nomination: true },
            orderBy: { candidateNumber: 'asc' },
        });
        if (candidates.length === 0) {
            return this.createEmptyPositionResult(position);
        }
        const totalEligibleVoters = await this.prisma.user.count({
            where: { role: index_1.UserRole.VOTER, isActive: true },
        });
        const decryptedVotes = await this.decryptAllVotes();
        const positionVotes = decryptedVotes
            .map(vote => vote.selections[position])
            .filter(candidateId => candidateId);
        const totalVotes = positionVotes.length;
        const turnoutPercentage = totalEligibleVoters > 0
            ? (totalVotes / totalEligibleVoters) * 100
            : 0;
        const voteCounts = this.countVotesPerCandidate(candidates, positionVotes, totalVotes);
        const isUnopposed = candidates.length === 1;
        const winner = this.determineWinner(voteCounts, isUnopposed, totalEligibleVoters);
        const requiresRunoff = this.checkRunoffRequired(voteCounts);
        const unopposedThresholdMet = isUnopposed
            ? voteCounts[0]?.voteCount >= (totalEligibleVoters * this.UNOPPOSED_THRESHOLD)
            : true;
        const result = {
            position,
            totalVotes,
            totalEligibleVoters,
            turnoutPercentage: Math.round(turnoutPercentage * 100) / 100,
            candidates: voteCounts,
            status: this.determineResultStatus(voteCounts, isUnopposed, unopposedThresholdMet),
            certificationStatus: result_status_enum_1.CertificationStatus.NOT_CERTIFIED,
            winner,
            requiresRunoff,
            unopposedThresholdMet,
        };
        await this.cacheService.set(cacheKey, result, 60);
        return result;
    }
    async decryptAllVotes() {
        const cacheKey = 'decrypted_votes_all';
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            this.logger.log('Retrieved decrypted votes from cache');
            return cached;
        }
        const decryptedVotes = await this.encryption.decryptAllVotes();
        await this.cacheService.set(cacheKey, decryptedVotes, 300);
        return decryptedVotes;
    }
    decryptVote(encryptedVote) {
        return this.encryption.decryptVote(encryptedVote);
    }
    async clearDecryptedVotesCache() {
        await this.cacheService.del('decrypted_votes_all');
        this.logger.log('Decrypted votes cache cleared');
    }
    countVotesPerCandidate(candidates, positionVotes, totalVotes) {
        const voteCounts = [];
        for (const candidate of candidates) {
            const voteCount = positionVotes.filter(vote => vote === candidate.id).length;
            const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
            voteCounts.push({
                candidateId: candidate.id,
                candidateName: candidate.name,
                candidateNumber: candidate.candidateNumber,
                position: candidate.position,
                voteCount,
                percentage: Math.round(percentage * 100) / 100,
                isWinner: false,
                isRunnerUp: false,
                isUnopposed: candidates.length === 1,
            });
        }
        voteCounts.sort((a, b) => b.voteCount - a.voteCount);
        if (voteCounts.length > 0) {
            voteCounts[0].isWinner = true;
            if (voteCounts.length > 1 && voteCounts[1].voteCount > 0) {
                voteCounts[1].isRunnerUp = true;
            }
        }
        return voteCounts;
    }
    determineWinner(voteCounts, isUnopposed, totalEligibleVoters) {
        if (voteCounts.length === 0)
            return undefined;
        const topCandidate = voteCounts[0];
        if (isUnopposed) {
            const threshold = totalEligibleVoters * this.UNOPPOSED_THRESHOLD;
            return topCandidate.voteCount >= threshold ? topCandidate : undefined;
        }
        else {
            return topCandidate.voteCount > 0 ? topCandidate : undefined;
        }
    }
    checkRunoffRequired(voteCounts) {
        if (voteCounts.length < 2)
            return false;
        return voteCounts[0].voteCount === voteCounts[1].voteCount && voteCounts[0].voteCount > 0;
    }
    determineResultStatus(voteCounts, isUnopposed, unopposedThresholdMet) {
        if (voteCounts.length === 0)
            return result_status_enum_1.ResultStatus.PENDING;
        if (isUnopposed && !unopposedThresholdMet) {
            return result_status_enum_1.ResultStatus.DISPUTED;
        }
        if (this.checkRunoffRequired(voteCounts)) {
            return result_status_enum_1.ResultStatus.DISPUTED;
        }
        return result_status_enum_1.ResultStatus.PROVISIONAL;
    }
    createEmptyPositionResult(position) {
        return {
            position,
            totalVotes: 0,
            totalEligibleVoters: 0,
            turnoutPercentage: 0,
            candidates: [],
            status: result_status_enum_1.ResultStatus.PENDING,
            certificationStatus: result_status_enum_1.CertificationStatus.NOT_CERTIFIED,
            requiresRunoff: false,
            unopposedThresholdMet: false,
        };
    }
    async clearResultsCache() {
        const positions = Object.values(index_1.Candidate_Position);
        for (const position of positions) {
            await this.cacheService.del(`position_results:${position}`);
        }
        await this.cacheService.del('all_results_summary');
        this.logger.log('Results cache cleared');
    }
    async updateCandidateVoteCounts() {
        const results = await this.countAllVotes();
        for (const positionResult of results) {
            for (const candidate of positionResult.candidates) {
                await this.prisma.candidate.update({
                    where: { id: candidate.candidateId },
                    data: { voteCount: candidate.voteCount },
                });
            }
        }
        this.logger.log('Candidate vote counts updated in database');
    }
};
exports.VoteCountingService = VoteCountingService;
exports.VoteCountingService = VoteCountingService = VoteCountingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_1.PrismaService,
        cache_service_1.CacheService,
        vote_encryption_service_1.VoteEncryptionService])
], VoteCountingService);
//# sourceMappingURL=vote-counting.service.js.map