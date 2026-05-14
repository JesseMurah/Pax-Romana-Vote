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
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    configService;
    logger = new common_1.Logger(PrismaService_1.name);
    constructor(configService) {
        super({
            datasources: {
                db: {
                    url: configService.get('DATABASE_URL'),
                },
            },
            transactionOptions: {
                maxWait: 5000,
                timeout: 15000,
                isolationLevel: 'ReadCommitted',
            },
            log: [
                {
                    emit: 'event',
                    level: 'query',
                },
                {
                    emit: 'event',
                    level: 'error',
                },
                {
                    emit: 'event',
                    level: 'info',
                },
                {
                    emit: 'event',
                    level: 'warn',
                },
            ],
        });
        this.configService = configService;
        this.$on('query', (e) => {
            if (e.duration > 1000) {
                this.logger.warn(`Slow query detected: ${e.query} (${e.duration}ms)`);
            }
        });
        this.$on('error', (e) => {
            this.logger.error('Prisma error:', e);
        });
        this.$on('warn', (e) => {
            this.logger.warn('Prisma warning:', e);
        });
        this.$on('info', (e) => {
            this.logger.log('Prisma info:', e);
        });
        this.logger.log('Instantiating PrismaService with enhanced transaction configuration');
    }
    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('Successfully connected to database');
            await this.isHealthy();
        }
        catch (error) {
            this.logger.error('Failed to connect to database', error);
            throw error;
        }
    }
    async onModuleDestroy() {
        try {
            await this.$disconnect();
            this.logger.log('Database connection closed');
        }
        catch (error) {
            this.logger.error('Error closing database connection', error);
        }
    }
    async safeTransaction(callback, retries = 3, options) {
        const transactionOptions = {
            maxWait: options?.maxWait || 5000,
            timeout: options?.timeout || 15000,
            isolationLevel: options?.isolationLevel || 'ReadCommitted',
        };
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                this.logger.debug(`Transaction attempt ${attempt}/${retries}`);
                const result = await this.$transaction(callback, transactionOptions);
                if (attempt > 1) {
                    this.logger.log(`Transaction succeeded on attempt ${attempt}`);
                }
                return result;
            }
            catch (error) {
                const isLastAttempt = attempt === retries;
                const isRetryableError = this.isRetryableError(error);
                this.logger.warn(`Transaction attempt ${attempt}/${retries} failed: ${error.message}`, { code: error.code, retryable: isRetryableError });
                if (isLastAttempt || !isRetryableError) {
                    this.logger.error(`Transaction failed after ${attempt} attempts:`, error);
                    throw error;
                }
                const baseDelay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                const jitter = Math.random() * 500;
                const delay = baseDelay + jitter;
                this.logger.debug(`Retrying transaction in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw new Error('This should never be reached');
    }
    isRetryableError(error) {
        const retryableCodes = [
            'P2028',
            'P2034',
            'P1017',
            'P1001',
        ];
        return retryableCodes.includes(error.code) ||
            error.message?.includes('timeout') ||
            error.message?.includes('connection') ||
            error.message?.includes('deadlock');
    }
    async batchOperation(operations, batchSize = 10) {
        const results = [];
        for (let i = 0; i < operations.length; i += batchSize) {
            const batch = operations.slice(i, i + batchSize);
            this.logger.debug(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(operations.length / batchSize)}`);
            try {
                const batchResults = await Promise.all(batch.map(op => op()));
                results.push(...batchResults);
            }
            catch (error) {
                this.logger.error(`Batch operation failed at batch ${Math.floor(i / batchSize) + 1}:`, error);
                throw error;
            }
            if (i + batchSize < operations.length) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
        return results;
    }
    async cleanDb() {
        if (process.env.NODE_ENV === 'production') {
            this.logger.warn('Cannot clean database in production environment');
            return;
        }
        this.logger.log('Cleaning database...');
        const tablesToClean = [
            'votes',
            'votingSessions',
            'candidates',
            'ecReviews',
            'guarantorVerifications',
            'nominatorVerifications',
            'nominations',
            'verificationTokens',
            'auditLogs',
            'users',
            'subgroups',
            'programmes',
            'systemConfig',
            'electionTimeline',
        ];
        try {
            await this.safeTransaction(async (prisma) => {
                for (const table of tablesToClean) {
                    if (prisma[table]) {
                        let deletedCount = 0;
                        let batchCount = 0;
                        do {
                            const batch = await prisma[table].deleteMany({
                                take: 1000,
                            });
                            deletedCount = batch.count;
                            batchCount++;
                            if (deletedCount > 0) {
                                this.logger.debug(`Cleaned ${deletedCount} records from ${table} (batch ${batchCount})`);
                            }
                        } while (deletedCount > 0);
                        this.logger.log(`Cleaned ${table} table`);
                    }
                }
                return true;
            }, 1, { timeout: 30000 });
            this.logger.log('Database cleaned successfully');
        }
        catch (error) {
            this.logger.error('Error cleaning database', error);
            throw error;
        }
    }
    async isHealthy() {
        try {
            const start = Date.now();
            await this.$queryRaw `SELECT 1 as health_check`;
            const duration = Date.now() - start;
            if (duration > 1000) {
                this.logger.warn(`Database health check slow: ${duration}ms`);
            }
            return true;
        }
        catch (error) {
            this.logger.error('Database health check failed', error);
            return false;
        }
    }
    async getConnectionInfo() {
        try {
            const result = await this.$queryRaw `
                SELECT 
                    (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
                    (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections,
                    0 as waiting_connections
            `;
            const info = {
                activeConnections: result[0]?.active_connections || 0,
                maxConnections: result[0]?.max_connections || 0,
                waitingConnections: result[0]?.waiting_connections || 0,
            };
            this.logger.debug('Connection info:', info);
            return info;
        }
        catch (error) {
            this.logger.error('Failed to get connection info:', error);
            return {
                activeConnections: -1,
                maxConnections: -1,
                waitingConnections: -1,
            };
        }
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PrismaService);
//# sourceMappingURL=db.service.js.map