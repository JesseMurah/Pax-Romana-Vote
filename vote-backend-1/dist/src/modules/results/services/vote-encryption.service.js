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
var VoteEncryptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteEncryptionService = void 0;
const crypto = require("crypto");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const db_1 = require("../../../../db");
let VoteEncryptionService = VoteEncryptionService_1 = class VoteEncryptionService {
    configService;
    prisma;
    logger = new common_1.Logger(VoteEncryptionService_1.name);
    algorithm = 'aes-256-gcm';
    keyLength = 32;
    ivLength = 16;
    tagLength = 16;
    encryptionKey;
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        this.initializeEncryptionKey();
    }
    initializeEncryptionKey() {
        const keyHex = this.configService.get('VOTE_ENCRYPTION_KEY');
        if (keyHex) {
            this.encryptionKey = Buffer.from(keyHex, 'hex');
            this.logger.log('Loaded encryption key from environment');
        }
        else {
            this.encryptionKey = crypto.randomBytes(this.keyLength);
            this.logger.warn('Generated new encryption key - THIS SHOULD NOT HAPPEN IN PRODUCTION');
            this.logger.warn(`Add this to your .env: VOTE_ENCRYPTION_KEY=${this.encryptionKey.toString('hex')}`);
        }
    }
    encryptVote(selections) {
        try {
            const voteData = {};
            for (const [position, candidateId] of Object.entries(selections)) {
                if (candidateId && candidateId.trim()) {
                    voteData[position] = candidateId.trim();
                }
            }
            const dataToEncrypt = {
                selections: voteData,
                timestamp: Date.now(),
                version: '1.0'
            };
            const plaintext = JSON.stringify(dataToEncrypt);
            const iv = crypto.randomBytes(this.ivLength);
            const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
            let encrypted = cipher.update(plaintext, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            const authTag = cipher.getAuthTag();
            const encryptedVoteData = {
                encryptedData: encrypted,
                iv: iv.toString('hex'),
                authTag: authTag.toString('hex'),
                timestamp: Date.now()
            };
            return JSON.stringify(encryptedVoteData);
        }
        catch (error) {
            this.logger.error('Failed to encrypt vote:', error);
            throw new Error('Vote encryption failed');
        }
    }
    decryptVote(encryptedVote) {
        try {
            const encryptedData = JSON.parse(encryptedVote);
            if (!encryptedData.encryptedData || !encryptedData.iv || !encryptedData.authTag) {
                throw new Error('Invalid encrypted vote structure');
            }
            const iv = Buffer.from(encryptedData.iv, 'hex');
            const authTag = Buffer.from(encryptedData.authTag, 'hex');
            const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
            decipher.setAuthTag(authTag);
            let decrypted = decipher.update(encryptedData.encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            const voteData = JSON.parse(decrypted);
            if (!voteData.selections || !voteData.timestamp) {
                throw new Error('Invalid decrypted vote structure');
            }
            const selections = {
                PRESIDENT: '',
                VICE_PRESIDENT: '',
                GEN_SECRETARY: '',
                FINANCIAL_SECRETARY: '',
                ORGANIZING_SECRETARY_MAIN: '',
                PRO_MAIN: '',
                WOMEN_COMMISSIONER: ''
            };
            for (const [positionStr, candidateId] of Object.entries(voteData.selections)) {
                if (Object.values(client_1.Candidate_Position).includes(positionStr)) {
                    selections[positionStr] = candidateId;
                }
            }
            return selections;
        }
        catch (error) {
            this.logger.error('Failed to decrypt vote:', error);
            return {};
        }
    }
    async decryptAllVotes() {
        const votes = await this.prisma.vote.findMany({
            where: { isValid: true },
            include: { session: true },
        });
        const decryptedVotes = [];
        let successCount = 0;
        let errorCount = 0;
        this.logger.log(`Starting decryption of ${votes.length} votes`);
        for (const vote of votes) {
            try {
                const decrypted = this.decryptVote(vote.encryptedVote);
                if (Object.keys(decrypted).length > 0) {
                    decryptedVotes.push({
                        sessionId: vote.sessionId,
                        voterHash: vote.voterHash,
                        selections: decrypted,
                        timestamp: vote.createdAt,
                        isValid: vote.isValid,
                    });
                    successCount++;
                }
                else {
                    this.logger.warn(`Vote ${vote.id} decrypted but contains no valid selections`);
                    errorCount++;
                }
            }
            catch (error) {
                this.logger.error(`Failed to decrypt vote ${vote.id}:`, error);
                errorCount++;
                await this.createDecryptionErrorLog(vote.id, error.message);
            }
        }
        this.logger.log(`Vote decryption completed: ${successCount} successful, ${errorCount} errors`);
        return decryptedVotes;
    }
    validateEncryptedVote(encryptedVote) {
        try {
            const encryptedData = JSON.parse(encryptedVote);
            return !!(encryptedData.encryptedData &&
                encryptedData.iv &&
                encryptedData.authTag &&
                encryptedData.timestamp);
        }
        catch {
            return false;
        }
    }
    generateNewEncryptionKey() {
        const newKey = crypto.randomBytes(this.keyLength);
        return newKey.toString('hex');
    }
    async testEncryption() {
        try {
            const testSelections = {
                [client_1.Candidate_Position.PRESIDENT]: 'candidate-123',
                [client_1.Candidate_Position.VICE_PRESIDENT]: 'candidate-456',
                [client_1.Candidate_Position.GEN_SECRETARY]: 'candidate-789',
                [client_1.Candidate_Position.FINANCIAL_SECRETARY]: '',
                [client_1.Candidate_Position.ORGANIZING_SECRETARY_MAIN]: '',
                [client_1.Candidate_Position.PRO_MAIN]: '',
                [client_1.Candidate_Position.WOMEN_COMMISSIONER]: ''
            };
            const encrypted = this.encryptVote(testSelections);
            this.logger.log('Test encryption successful');
            const decrypted = this.decryptVote(encrypted);
            this.logger.log('Test decryption successful');
            const isValid = JSON.stringify(testSelections) === JSON.stringify(decrypted);
            if (isValid) {
                return { success: true, message: 'Encryption/decryption test passed' };
            }
            else {
                return { success: false, message: 'Data integrity check failed' };
            }
        }
        catch (error) {
            this.logger.error('Encryption test failed:', error);
            return { success: false, message: `Test failed: ${error.message}` };
        }
    }
    async createDecryptionErrorLog(voteId, errorMessage) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    action: 'VOTE_DECRYPTION_ERROR',
                    entity: 'VOTE',
                    entityId: voteId,
                    newValues: {
                        error: errorMessage,
                        timestamp: new Date(),
                    },
                },
            });
        }
        catch (error) {
            this.logger.error('Failed to create decryption error audit log:', error);
        }
    }
    async decryptVotesWithProgress(onProgress) {
        const votes = await this.prisma.vote.findMany({
            where: { isValid: true },
            include: { session: true },
        });
        const decryptedVotes = [];
        const batchSize = 100;
        for (let i = 0; i < votes.length; i += batchSize) {
            const batch = votes.slice(i, i + batchSize);
            for (const vote of batch) {
                try {
                    const decrypted = this.decryptVote(vote.encryptedVote);
                    if (Object.keys(decrypted).length > 0) {
                        decryptedVotes.push({
                            sessionId: vote.sessionId,
                            voterHash: vote.voterHash,
                            selections: decrypted,
                            timestamp: vote.createdAt,
                            isValid: vote.isValid,
                        });
                    }
                }
                catch (error) {
                    this.logger.error(`Failed to decrypt vote ${vote.id}:`, error);
                }
                if (onProgress) {
                    onProgress(i + batch.indexOf(vote) + 1, votes.length);
                }
            }
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        return decryptedVotes;
    }
};
exports.VoteEncryptionService = VoteEncryptionService;
exports.VoteEncryptionService = VoteEncryptionService = VoteEncryptionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        db_1.PrismaService])
], VoteEncryptionService);
//# sourceMappingURL=vote-encryption.service.js.map