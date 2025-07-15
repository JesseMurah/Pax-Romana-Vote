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
            log: ['query', 'info', 'warn', 'error'],
        });
        this.configService = configService;
        this.logger.log('Instantiating PrismaService');
    }
    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('Successfully connected to database');
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
            for (const table of tablesToClean) {
                if (this[table]) {
                    await this[table].deleteMany();
                    this.logger.log(`Cleaned ${table} table`);
                }
            }
            this.logger.log('Database cleaned successfully');
        }
        catch (error) {
            this.logger.error('Error cleaning database', error);
            throw error;
        }
    }
    async isHealthy() {
        try {
            await this.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            this.logger.error('Database health check failed', error);
            return false;
        }
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PrismaService);
//# sourceMappingURL=db.service.js.map