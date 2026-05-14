"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandidateStatsDto = exports.PositionStatsDto = exports.VotingProgressDto = void 0;
class VotingProgressDto {
    totalVotes;
    totalEligibleVoters;
    turnoutPercentage;
    positionStats;
    lastUpdated;
}
exports.VotingProgressDto = VotingProgressDto;
class PositionStatsDto {
    position;
    totalVotes;
    candidates;
    isCompleted;
}
exports.PositionStatsDto = PositionStatsDto;
class CandidateStatsDto {
    candidateId;
    name;
    candidateNumber;
    voteCount;
    percentage;
    isLeading;
}
exports.CandidateStatsDto = CandidateStatsDto;
//# sourceMappingURL=voting-progress.dto.js.map