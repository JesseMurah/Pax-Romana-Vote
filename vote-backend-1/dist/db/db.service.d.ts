import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from "@prisma/client";
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    safeTransaction<T>(callback: (prisma: PrismaClient) => Promise<T>, retries?: number, options?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
    }): Promise<T>;
    private isRetryableError;
    batchOperation<T>(operations: (() => Promise<T>)[], batchSize?: number): Promise<T[]>;
    cleanDb(): Promise<void>;
    isHealthy(): Promise<boolean>;
    getConnectionInfo(): Promise<{
        activeConnections: number;
        maxConnections: number;
        waitingConnections: number;
    }>;
}
