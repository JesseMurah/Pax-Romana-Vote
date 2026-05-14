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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const cache_keys_enum_1 = require("./enum/cache-keys.enum");
let CacheService = CacheService_1 = class CacheService {
    cacheManager;
    logger = new common_1.Logger(CacheService_1.name);
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
    }
    async set(key, value, ttl) {
        try {
            await this.cacheManager.set(key, value, ttl);
            this.logger.debug(`Cache set: ${key}`);
        }
        catch (error) {
            this.logger.error(`Failed to set cache for key ${key}:`, error);
        }
    }
    async get(key) {
        try {
            const value = await this.cacheManager.get(key);
            this.logger.debug(`Cache ${value ? 'hit' : 'miss'}: ${key}`);
            return value;
        }
        catch (error) {
            this.logger.error(`Failed to get cache for key ${key}:`, error);
            return undefined;
        }
    }
    async del(key) {
        try {
            await this.cacheManager.del(key);
            this.logger.debug(`Cache deleted: ${key}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete cache for key ${key}:`, error);
        }
    }
    async reset() {
        try {
            await this.cacheManager.clear();
            this.logger.debug('Cache reset completed');
        }
        catch (error) {
            this.logger.error('Failed to reset cache:', error);
        }
    }
    async setSmsCode(phone, code) {
        const key = `${cache_keys_enum_1.CacheKeys.SMS_CODE}${phone}`;
        await this.set(key, code, 300);
    }
    async getSmsCode(phone) {
        const key = `${cache_keys_enum_1.CacheKeys.SMS_CODE}${phone}`;
        return this.get(key);
    }
    async deleteSmsCode(phone) {
        const key = `${cache_keys_enum_1.CacheKeys.SMS_CODE}${phone}`;
        await this.del(key);
    }
    async clearSmsCode(phoneNumber) {
        try {
            const pattern = `${cache_keys_enum_1.CacheKeys.SMS_CODE}*`;
            const keys = await this.getKeys(pattern);
            if (keys.length > 0) {
                await this.mdel(keys);
                this.logger.debug(`Cleared ${keys.length} SMS code cache entries`);
            }
        }
        catch (error) {
            this.logger.error('Failed to clear SMS code cache:', error);
        }
    }
    async setCandidates(candidates) {
        await this.set(cache_keys_enum_1.CacheKeys.CANDIDATES_ALL, candidates, 3600);
    }
    async getCandidates() {
        return this.get(cache_keys_enum_1.CacheKeys.CANDIDATES_ALL);
    }
    async setCandidatesByPosition(position, candidates) {
        const key = `${cache_keys_enum_1.CacheKeys.CANDIDATES_BY_POSITION}${position}`;
        await this.set(key, candidates, 3600);
    }
    async getCandidatesByPosition(position) {
        const key = `${cache_keys_enum_1.CacheKeys.CANDIDATES_BY_POSITION}${position}`;
        return this.get(key);
    }
    async setCandidateDetails(candidateId, candidate) {
        const key = `${cache_keys_enum_1.CacheKeys.CANDIDATE_DETAILS}${candidateId}`;
        await this.set(key, candidate, 3600);
    }
    async getCandidateDetails(candidateId) {
        const key = `${cache_keys_enum_1.CacheKeys.CANDIDATE_DETAILS}${candidateId}`;
        return this.get(key);
    }
    async clearCandidatesCache() {
        await this.del(cache_keys_enum_1.CacheKeys.CANDIDATES_ALL);
        this.logger.debug('Candidates cache cleared');
    }
    async setVotingSession(phoneHash, session) {
        const key = `${cache_keys_enum_1.CacheKeys.VOTING_SESSION}${phoneHash}`;
        await this.set(key, session, 1800);
    }
    async getVotingSession(phoneHash) {
        const key = `${cache_keys_enum_1.CacheKeys.VOTING_SESSION}${phoneHash}`;
        return this.get(key);
    }
    async deleteVotingSession(phoneHash) {
        const key = `${cache_keys_enum_1.CacheKeys.VOTING_SESSION}${phoneHash}`;
        await this.del(key);
    }
    async setVoterStatus(phoneHash, status) {
        const key = `${cache_keys_enum_1.CacheKeys.VOTER_STATUS}${phoneHash}`;
        await this.set(key, status, 7200);
    }
    async getVoterStatus(phoneHash) {
        const key = `${cache_keys_enum_1.CacheKeys.VOTER_STATUS}${phoneHash}`;
        return this.get(key);
    }
    async setVotingStats(stats) {
        await this.set(cache_keys_enum_1.CacheKeys.VOTING_STATS_LIVE, stats, 60);
    }
    async getVotingStats() {
        return this.get(cache_keys_enum_1.CacheKeys.VOTING_STATS_LIVE);
    }
    async setVotingStatsByPosition(position, stats) {
        const key = `${cache_keys_enum_1.CacheKeys.VOTING_STATS_BY_POSITION}${position}`;
        await this.set(key, stats, 300);
    }
    async getVotingStatsByPosition(position) {
        const key = `${cache_keys_enum_1.CacheKeys.VOTING_STATS_BY_POSITION}${position}`;
        return this.get(key);
    }
    async setBallotStructure(structure) {
        await this.set(cache_keys_enum_1.CacheKeys.BALLOT_STRUCTURE, structure, 7200);
    }
    async getBallotStructure() {
        return this.get(cache_keys_enum_1.CacheKeys.BALLOT_STRUCTURE);
    }
    async setBallotPositions(positions) {
        await this.set(cache_keys_enum_1.CacheKeys.BALLOT_POSITIONS, positions, 7200);
    }
    async getBallotPositions() {
        return this.get(cache_keys_enum_1.CacheKeys.BALLOT_POSITIONS);
    }
    async setBallot(ballotData) {
        await this.cacheManager.set('ballot:complete', ballotData, 1800);
    }
    async getBallot() {
        return this.cacheManager.get('ballot:complete');
    }
    async clearBallotCache() {
        await this.cacheManager.del('ballot:complete');
    }
    async setSystemConfig(key, value) {
        const cacheKey = `${cache_keys_enum_1.CacheKeys.SYSTEM_CONFIG}${key}`;
        await this.set(cacheKey, value, 3600);
    }
    async getSystemConfig(key) {
        const cacheKey = `${cache_keys_enum_1.CacheKeys.SYSTEM_CONFIG}${key}`;
        return this.get(cacheKey);
    }
    async setElectionTimeline(timeline) {
        await this.set(cache_keys_enum_1.CacheKeys.ELECTION_TIMELINE, timeline, 1800);
    }
    async getElectionTimeline() {
        return this.get(cache_keys_enum_1.CacheKeys.ELECTION_TIMELINE);
    }
    async blacklistJwtToken(tokenId, expiresIn) {
        const key = `${cache_keys_enum_1.CacheKeys.JWT_BLACKLIST}${tokenId}`;
        await this.set(key, true, expiresIn);
    }
    async isJwtTokenBlacklisted(tokenId) {
        const key = `${cache_keys_enum_1.CacheKeys.JWT_BLACKLIST}${tokenId}`;
        const result = await this.get(key);
        return result === true;
    }
    async incrementLoginAttempts(phone) {
        const key = `${cache_keys_enum_1.CacheKeys.LOGIN_ATTEMPTS}${phone}`;
        const current = await this.get(key) || 0;
        const newCount = current + 1;
        await this.set(key, newCount, 3600);
        return newCount;
    }
    async getLoginAttempts(phone) {
        const key = `${cache_keys_enum_1.CacheKeys.LOGIN_ATTEMPTS}${phone}`;
        return await this.get(key) || 0;
    }
    async resetLoginAttempts(phone) {
        const key = `${cache_keys_enum_1.CacheKeys.LOGIN_ATTEMPTS}${phone}`;
        await this.del(key);
    }
    async setRateLimit(identifier, count, ttl) {
        const key = `${cache_keys_enum_1.CacheKeys.RATE_LIMIT}${identifier}`;
        await this.set(key, count, ttl);
    }
    async getRateLimit(identifier) {
        const key = `${cache_keys_enum_1.CacheKeys.RATE_LIMIT}${identifier}`;
        return await this.get(key) || 0;
    }
    async incrementRateLimit(identifier, ttl) {
        const key = `${cache_keys_enum_1.CacheKeys.RATE_LIMIT}${identifier}`;
        const current = await this.get(key) || 0;
        const newCount = current + 1;
        await this.set(key, newCount, ttl);
        return newCount;
    }
    async getKeys(pattern) {
        try {
            const allKeys = [];
            const keyPrefixes = [
                cache_keys_enum_1.CacheKeys.SMS_CODE,
                cache_keys_enum_1.CacheKeys.CANDIDATES_BY_POSITION,
                cache_keys_enum_1.CacheKeys.CANDIDATE_DETAILS,
                cache_keys_enum_1.CacheKeys.VOTING_SESSION,
                cache_keys_enum_1.CacheKeys.VOTER_STATUS,
                cache_keys_enum_1.CacheKeys.VOTING_STATS_BY_POSITION,
                cache_keys_enum_1.CacheKeys.SYSTEM_CONFIG,
                cache_keys_enum_1.CacheKeys.JWT_BLACKLIST,
                cache_keys_enum_1.CacheKeys.LOGIN_ATTEMPTS,
                cache_keys_enum_1.CacheKeys.RATE_LIMIT,
            ];
            const staticKeys = [
                cache_keys_enum_1.CacheKeys.CANDIDATES_ALL,
                cache_keys_enum_1.CacheKeys.VOTING_STATS_LIVE,
                cache_keys_enum_1.CacheKeys.BALLOT_STRUCTURE,
                cache_keys_enum_1.CacheKeys.BALLOT_POSITIONS,
                cache_keys_enum_1.CacheKeys.ELECTION_TIMELINE,
            ];
            allKeys.push(...staticKeys);
            if (pattern) {
                const regex = new RegExp(pattern.replace('*', '.*'));
                return allKeys.filter(key => regex.test(key));
            }
            return allKeys;
        }
        catch (error) {
            this.logger.error('Failed to get cache keys:', error);
            return [];
        }
    }
    async getTtl(key) {
        try {
            const ttlKey = `${key}:ttl`;
            const ttlData = await this.cacheManager.get(ttlKey);
            if (ttlData) {
                const now = Date.now();
                return Math.max(0, Math.floor((ttlData.expiresAt - now) / 1000));
            }
            return -1;
        }
        catch (error) {
            this.logger.error(`Failed to get TTL for key ${key}:`, error);
            return -1;
        }
    }
    async setWithTtlTracking(key, value, ttl) {
        try {
            await this.cacheManager.set(key, value, ttl);
            if (ttl) {
                const ttlKey = `${key}:ttl`;
                const expiresAt = Date.now() + (ttl * 1000);
                await this.cacheManager.set(ttlKey, { expiresAt }, ttl);
            }
            this.logger.debug(`Cache set with TTL tracking: ${key}`);
        }
        catch (error) {
            this.logger.error(`Failed to set cache with TTL tracking for key ${key}:`, error);
        }
    }
    async exists(key) {
        try {
            const value = await this.cacheManager.get(key);
            return value !== undefined && value !== null;
        }
        catch (error) {
            this.logger.error(`Failed to check existence for key ${key}:`, error);
            return false;
        }
    }
    async mget(keys) {
        try {
            const promises = keys.map(key => this.get(key));
            return await Promise.all(promises);
        }
        catch (error) {
            this.logger.error('Failed to get multiple keys:', error);
            return keys.map(() => undefined);
        }
    }
    async mset(keyValuePairs) {
        try {
            const promises = keyValuePairs.map(({ key, value, ttl }) => this.set(key, value, ttl));
            await Promise.all(promises);
            this.logger.debug(`Multiple cache set completed: ${keyValuePairs.length} items`);
        }
        catch (error) {
            this.logger.error('Failed to set multiple keys:', error);
        }
    }
    async mdel(keys) {
        try {
            const promises = keys.map(key => this.del(key));
            await Promise.all(promises);
            this.logger.debug(`Multiple cache delete completed: ${keys.length} items`);
        }
        catch (error) {
            this.logger.error('Failed to delete multiple keys:', error);
        }
    }
    async clearByPattern(pattern) {
        try {
            const keys = await this.getKeys(pattern);
            if (keys.length > 0) {
                await this.mdel(keys);
                this.logger.debug(`Cleared ${keys.length} keys matching pattern: ${pattern}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to clear keys by pattern ${pattern}:`, error);
        }
    }
    async getCacheSize() {
        try {
            const keys = await this.getKeys();
            return keys.length;
        }
        catch (error) {
            this.logger.error('Failed to get cache size:', error);
            return 0;
        }
    }
    async healthCheck() {
        try {
            const testKey = 'health_check';
            const testValue = Date.now();
            await this.set(testKey, testValue, 10);
            const retrieved = await this.get(testKey);
            await this.del(testKey);
            if (retrieved === testValue) {
                return { status: 'ok' };
            }
            else {
                return { status: 'error', message: 'Cache read/write mismatch' };
            }
        }
        catch (error) {
            return { status: 'error', message: error.message };
        }
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = CacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [cache_manager_1.Cache])
], CacheService);
//# sourceMappingURL=cache.service.js.map