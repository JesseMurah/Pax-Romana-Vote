import {Injectable, OnModuleInit, OnModuleDestroy, Logger} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {PrismaClient} from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor(private configService: ConfigService) {
        super({
            datasources: {
                db: {
                    url: configService.get('DATABASE_URL'),
                },
            },
            log: ['query', 'info', 'warn', 'error'],
        });
        this.logger.log('Instantiating PrismaService');
    }

    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('Successfully connected to database');
        } catch (error) {
            this.logger.error('Failed to connect to database', error);
            throw error;
        }
    }

    async onModuleDestroy() {
        try {
            await this.$disconnect();
            this.logger.log('Database connection closed');
        } catch (error) {
            this.logger.error('Error closing database connection', error);
        }
    }

    // Helper methods
    async cleanDb() {
        if (process.env.NODE_ENV === 'production') {
            this.logger.warn('Cannot clean database in production environment');
            return;
        }

        this.logger.log('Cleaning database...');

        // Define the order of deletion to respect foreign key constraints
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
            // Delete it to respect foreign key constraints
            for (const table of tablesToClean) {
                if (this[table]) {
                    await this[table].deleteMany();
                    this.logger.log(`Cleaned ${table} table`);
                }
            }
            this.logger.log('Database cleaned successfully');
        } catch (error) {
            this.logger.error('Error cleaning database', error);
            throw error;
        }
    }

    // Health check method
    async isHealthy(): Promise<boolean> {
        try {
            await this.$queryRaw`SELECT 1`;
            return true;
        } catch (error) {
            this.logger.error('Database health check failed', error);
            return false;
        }
    }
}