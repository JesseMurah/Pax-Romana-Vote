import { Inject, Injectable, Logger } from "@nestjs/common";
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import { CacheKeys } from "./enum/cache-keys.enum";
import { CandidateCache, VotingSessionCache, VotingStatsCache } from "./types/cache.types";

@Injectable()
export class CacheService {
    private readonly logger = new Logger(CacheService.name);

    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    // ============= GENERIC CACHE METHODS =============

    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        try {
            await this.cacheManager.set(key, value, ttl);
            this.logger.debug(`Cache set: ${key}`);
        } catch (error) {
            this.logger.error(`Failed to set cache for key ${key}:`, error);
        }
    }

    async get<T>(key: string): Promise<T | undefined> {
        try {
            const value = await this.cacheManager.get<T>(key);
            this.logger.debug(`Cache ${value ? 'hit' : 'miss'}: ${key}`);
            return value;
        } catch (error) {
            this.logger.error(`Failed to get cache for key ${key}:`, error);
            return undefined;
        }
    }

    async del(key: string): Promise<void> {
        try {
            await this.cacheManager.del(key);
            this.logger.debug(`Cache deleted: ${key}`);
        } catch (error) {
            this.logger.error(`Failed to delete cache for key ${key}:`, error);
        }
    }

    async reset(): Promise<void> {
        try {
            await this.cacheManager.clear();
            this.logger.debug('Cache reset completed');
        } catch (error) {
            this.logger.error('Failed to reset cache:', error);
        }
    }

    // ============= SMS VERIFICATION METHODS =============

    async setSmsCode(phone: string, code: string): Promise<void> {
        const key = `${CacheKeys.SMS_CODE}${phone}`;
        await this.set(key, code, 300); // 5 minutes TTL
    }

    async getSmsCode(phone: string): Promise<string | undefined> {
        const key = `${CacheKeys.SMS_CODE}${phone}`;
        return this.get<string>(key);
    }

    async deleteSmsCode(phone: string): Promise<void> {
        const key = `${CacheKeys.SMS_CODE}${phone}`;
        await this.del(key);
    }

    async clearSmsCode(phoneNumber: string): Promise<void> {
        try {
            const pattern = `${CacheKeys.SMS_CODE}*`;
            const keys = await this.getKeys(pattern);
            if (keys.length > 0) {
                await this.mdel(keys);
                this.logger.debug(`Cleared ${keys.length} SMS code cache entries`);
            }
        } catch (error) {
            this.logger.error('Failed to clear SMS code cache:', error);
        }
    }

    // ============= CANDIDATES CACHE METHODS =============

    async setCandidates(candidates: CandidateCache[]): Promise<void> {
        await this.set(CacheKeys.CANDIDATES_ALL, candidates, 3600); // 1-hour TTL
    }

    async getCandidates(): Promise<CandidateCache[] | undefined> {
        return this.get<CandidateCache[]>(CacheKeys.CANDIDATES_ALL);
    }

    async setCandidatesByPosition(position: string, candidates: CandidateCache[]): Promise<void> {
        const key = `${CacheKeys.CANDIDATES_BY_POSITION}${position}`;
        await this.set(key, candidates, 3600); // 1 hour TTL
    }

    async getCandidatesByPosition(position: string): Promise<CandidateCache[] | undefined> {
        const key = `${CacheKeys.CANDIDATES_BY_POSITION}${position}`;
        return this.get<CandidateCache[]>(key);
    }

    async setCandidateDetails(candidateId: string, candidate: CandidateCache): Promise<void> {
        const key = `${CacheKeys.CANDIDATE_DETAILS}${candidateId}`;
        await this.set(key, candidate, 3600); // 1 hour TTL
    }

    async getCandidateDetails(candidateId: string): Promise<CandidateCache | undefined> {
        const key = `${CacheKeys.CANDIDATE_DETAILS}${candidateId}`;
        return this.get<CandidateCache>(key);
    }

    async clearCandidatesCache(): Promise<void> {
        await this.del(CacheKeys.CANDIDATES_ALL);
        // Clear position-specific caches (you might want to track these keys)
        this.logger.debug('Candidates cache cleared');
    }

    // ============= VOTING SESSION METHODS =============

    async setVotingSession(phoneHash: string, session: VotingSessionCache): Promise<void> {
        const key = `${CacheKeys.VOTING_SESSION}${phoneHash}`;
        await this.set(key, session, 1800); // 30 minutes TTL
    }

    async getVotingSession(phoneHash: string): Promise<VotingSessionCache | undefined> {
        const key = `${CacheKeys.VOTING_SESSION}${phoneHash}`;
        return this.get<VotingSessionCache>(key);
    }

    async deleteVotingSession(phoneHash: string): Promise<void> {
        const key = `${CacheKeys.VOTING_SESSION}${phoneHash}`;
        await this.del(key);
    }

    async setVoterStatus(phoneHash: string, status: { hasVoted: boolean; inkVerified: boolean }): Promise<void> {
        const key = `${CacheKeys.VOTER_STATUS}${phoneHash}`;
        await this.set(key, status, 7200); // 2 hours TTL
    }

    async getVoterStatus(phoneHash: string): Promise<{ hasVoted: boolean; inkVerified: boolean } | undefined> {
        const key = `${CacheKeys.VOTER_STATUS}${phoneHash}`;
        return this.get(key);
    }

    // ============= VOTING STATISTICS METHODS =============

    async setVotingStats(stats: VotingStatsCache): Promise<void> {
        await this.set(CacheKeys.VOTING_STATS_LIVE, stats, 60); // 1 minute TTL for real-time stats
    }

    async getVotingStats(): Promise<VotingStatsCache | undefined> {
        return this.get<VotingStatsCache>(CacheKeys.VOTING_STATS_LIVE);
    }

    async setVotingStatsByPosition(position: string, stats: any): Promise<void> {
        const key = `${CacheKeys.VOTING_STATS_BY_POSITION}${position}`;
        await this.set(key, stats, 300); // 5 minutes TTL
    }

    async getVotingStatsByPosition(position: string): Promise<any> {
        const key = `${CacheKeys.VOTING_STATS_BY_POSITION}${position}`;
        return this.get(key);
    }

    // ============= BALLOT STRUCTURE METHODS =============

    async setBallotStructure(structure: any): Promise<void> {
        await this.set(CacheKeys.BALLOT_STRUCTURE, structure, 7200); // 2-hour TTL
    }

    async getBallotStructure(): Promise<any> {
        return this.get(CacheKeys.BALLOT_STRUCTURE);
    }

    async setBallotPositions(positions: string[]): Promise<void> {
        await this.set(CacheKeys.BALLOT_POSITIONS, positions, 7200); // 2-hour TTL
    }

    async getBallotPositions(): Promise<string[] | undefined> {
        return this.get<string[]>(CacheKeys.BALLOT_POSITIONS);
    }

    async setBallot(ballotData: any): Promise<void> {
        await this.cacheManager.set('ballot:complete', ballotData, 1800); // 30 min TTL
    }

    async getBallot(): Promise<any | undefined> {
        return this.cacheManager.get('ballot:complete');
    }

    async clearBallotCache(): Promise<void> {
        await this.cacheManager.del('ballot:complete');
    }

    // ============= SYSTEM CONFIGURATION METHODS =============

    async setSystemConfig(key: string, value: any): Promise<void> {
        const cacheKey = `${CacheKeys.SYSTEM_CONFIG}${key}`;
        await this.set(cacheKey, value, 3600); // 1 hour TTL
    }

    async getSystemConfig(key: string): Promise<any> {
        const cacheKey = `${CacheKeys.SYSTEM_CONFIG}${key}`;
        return this.get(cacheKey);
    }

    async setElectionTimeline(timeline: any): Promise<void> {
        await this.set(CacheKeys.ELECTION_TIMELINE, timeline, 1800); // 30 minutes TTL
    }

    async getElectionTimeline(): Promise<any> {
        return this.get(CacheKeys.ELECTION_TIMELINE);
    }

    // ============= AUTHENTICATION & SECURITY METHODS =============

    async blacklistJwtToken(tokenId: string, expiresIn: number): Promise<void> {
        const key = `${CacheKeys.JWT_BLACKLIST}${tokenId}`;
        await this.set(key, true, expiresIn);
    }

    async isJwtTokenBlacklisted(tokenId: string): Promise<boolean> {
        const key = `${CacheKeys.JWT_BLACKLIST}${tokenId}`;
        const result = await this.get<boolean>(key);
        return result === true;
    }

    async incrementLoginAttempts(phone: string): Promise<number> {
        const key = `${CacheKeys.LOGIN_ATTEMPTS}${phone}`;
        const current = await this.get<number>(key) || 0;
        const newCount = current + 1;
        await this.set(key, newCount, 3600); // 1 hour TTL
        return newCount;
    }

    async getLoginAttempts(phone: string): Promise<number> {
        const key = `${CacheKeys.LOGIN_ATTEMPTS}${phone}`;
        return await this.get<number>(key) || 0;
    }

    async resetLoginAttempts(phone: string): Promise<void> {
        const key = `${CacheKeys.LOGIN_ATTEMPTS}${phone}`;
        await this.del(key);
    }

    // ============= RATE LIMITING METHODS =============

    async setRateLimit(identifier: string, count: number, ttl: number): Promise<void> {
        const key = `${CacheKeys.RATE_LIMIT}${identifier}`;
        await this.set(key, count, ttl);
    }

    async getRateLimit(identifier: string): Promise<number> {
        const key = `${CacheKeys.RATE_LIMIT}${identifier}`;
        return await this.get<number>(key) || 0;
    }

    async incrementRateLimit(identifier: string, ttl: number): Promise<number> {
        const key = `${CacheKeys.RATE_LIMIT}${identifier}`;
        const current = await this.get<number>(key) || 0;
        const newCount = current + 1;
        await this.set(key, newCount, ttl);
        return newCount;
    }

    // ============= UTILITY METHODS =============

    async getKeys(pattern?: string): Promise<string[]> {
        try {
            const allKeys: string[] = [];

            // Define known key prefixes to search
            const keyPrefixes = [
                CacheKeys.SMS_CODE,
                CacheKeys.CANDIDATES_BY_POSITION,
                CacheKeys.CANDIDATE_DETAILS,
                CacheKeys.VOTING_SESSION,
                CacheKeys.VOTER_STATUS,
                CacheKeys.VOTING_STATS_BY_POSITION,
                CacheKeys.SYSTEM_CONFIG,
                CacheKeys.JWT_BLACKLIST,
                CacheKeys.LOGIN_ATTEMPTS,
                CacheKeys.RATE_LIMIT,
            ];

            // Add static keys
            const staticKeys = [
                CacheKeys.CANDIDATES_ALL,
                CacheKeys.VOTING_STATS_LIVE,
                CacheKeys.BALLOT_STRUCTURE,
                CacheKeys.BALLOT_POSITIONS,
                CacheKeys.ELECTION_TIMELINE,
            ];

            allKeys.push(...staticKeys);

            // If pattern is provided, filter keys
            if (pattern) {
                const regex = new RegExp(pattern.replace('*', '.*'));
                return allKeys.filter(key => regex.test(key));
            }

            return allKeys;
        } catch (error) {
            this.logger.error('Failed to get cache keys:', error);
            return [];
        }
    }

    async getTtl(key: string): Promise<number> {
        try {
            const ttlKey = `${key}:ttl`;
            const ttlData = await this.cacheManager.get<{ expiresAt: number }>(ttlKey);

            if (ttlData) {
                const now = Date.now();
                return Math.max(0, Math.floor((ttlData.expiresAt - now) / 1000));
            }

            // If no TTL metadata found, return -1 (unknown)
            return -1;
        } catch (error) {
            this.logger.error(`Failed to get TTL for key ${key}:`, error);
            return -1;
        }
    }

    // Enhanced set method that also stores TTL metadata
    async setWithTtlTracking<T>(key: string, value: T, ttl?: number): Promise<void> {
        try {
            await this.cacheManager.set(key, value, ttl);

            // Store TTL metadata if TTL is provided
            if (ttl) {
                const ttlKey = `${key}:ttl`;
                const expiresAt = Date.now() + (ttl * 1000);
                await this.cacheManager.set(ttlKey, { expiresAt }, ttl);
            }

            this.logger.debug(`Cache set with TTL tracking: ${key}`);
        } catch (error) {
            this.logger.error(`Failed to set cache with TTL tracking for key ${key}:`, error);
        }
    }

    // Check if a key exists in cache
    async exists(key: string): Promise<boolean> {
        try {
            const value = await this.cacheManager.get(key);
            return value !== undefined && value !== null;
        } catch (error) {
            this.logger.error(`Failed to check existence for key ${key}:`, error);
            return false;
        }
    }

    // Get multiple keys at once
    async mget<T>(keys: string[]): Promise<(T | undefined)[]> {
        try {
            const promises = keys.map(key => this.get<T>(key));
            return await Promise.all(promises);
        } catch (error) {
            this.logger.error('Failed to get multiple keys:', error);
            return keys.map(() => undefined);
        }
    }

    // Set multiple key-value pairs at once
    async mset<T>(keyValuePairs: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
        try {
            const promises = keyValuePairs.map(({ key, value, ttl }) =>
                this.set(key, value, ttl)
            );
            await Promise.all(promises);
            this.logger.debug(`Multiple cache set completed: ${keyValuePairs.length} items`);
        } catch (error) {
            this.logger.error('Failed to set multiple keys:', error);
        }
    }

    // Delete multiple keys at once
    async mdel(keys: string[]): Promise<void> {
        try {
            const promises = keys.map(key => this.del(key));
            await Promise.all(promises);
            this.logger.debug(`Multiple cache delete completed: ${keys.length} items`);
        } catch (error) {
            this.logger.error('Failed to delete multiple keys:', error);
        }
    }

    // Clear all keys matching a pattern
    async clearByPattern(pattern: string): Promise<void> {
        try {
            const keys = await this.getKeys(pattern);
            if (keys.length > 0) {
                await this.mdel(keys);
                this.logger.debug(`Cleared ${keys.length} keys matching pattern: ${pattern}`);
            }
        } catch (error) {
            this.logger.error(`Failed to clear keys by pattern ${pattern}:`, error);
        }
    }

    // Get cache size (approximate)
    async getCacheSize(): Promise<number> {
        try {
            const keys = await this.getKeys();
            return keys.length;
        } catch (error) {
            this.logger.error('Failed to get cache size:', error);
            return 0;
        }
    }

    // // Get cache memory usage (if available)
    // async getMemoryUsage(): Promise<{ used: number; total: number } | null> {
    //     try {
    //         // This would be implementation-specific
    //         // For in-memory cache, we can't easily get this info
    //         // In Redis, you would use MEMORY USAGE commands
    //         return null;
    //     } catch (error) {
    //         this.logger.error('Failed to get memory usage:', error);
    //         return null;
    //     }
    // }

    // ============= HEALTH CHECK METHOD =============

    async healthCheck(): Promise<{ status: 'ok' | 'error'; message?: string }> {
        try {
            const testKey = 'health_check';
            const testValue = Date.now();

            await this.set(testKey, testValue, 10);
            const retrieved = await this.get<number>(testKey);
            await this.del(testKey);

            if (retrieved === testValue) {
                return { status: 'ok' };
            } else {
                return { status: 'error', message: 'Cache read/write mismatch' };
            }
        } catch (error) {
            return { status: 'error', message: error.message };
        }
    }
}