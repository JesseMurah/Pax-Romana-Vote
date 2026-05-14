export interface CacheOptions {
    ttl?: number; // Time to live in seconds
    key?: string; // Custom cache key
}

export interface VotingSessionCache {
    sessionId: string;
    voterHash: string;
    userId: string;
    email: string;
    name: string;
    createdAt: Date;
    currentStep: number;
    isValid: boolean;
}

export interface CandidateCache {
    id: string;
    name: string;
    position: string;
    photoUrl?: string;
    candidateNumber: number;
    biography?: string;
    isActive: boolean;
}

export interface VotingStatsCache {
    totalVotes: number;
    totalVoters: number;
    votingPercentage: number;
    votesByPosition: Record<string, number>;
    lastUpdated: Date;
}

export interface BallotCache {
    ballot: Record<string, BallotCandidate[]>;
    totalPositions: number;
    totalCandidates: number;
    instructions: string[];
}

export interface BallotCandidate {
    id: string;
    name: string;
    candidateNumber: number;
    photoUrl?: string;
    biography?: string;
    college?: string;
    department?: string;
    programme?: string;
    level?: string;
    vision?: string[];
}