import { ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";


export const databaseConfig = {
    development: {
        url: process.env.DATABASE_URL,
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'password',
        database: 'pax_romana_dev',
    },
    production: {
        url: process.env.DATABASE_URL,
        host: 'db', // Local deployment
        port: 5433,
        username: 'postgres',
        password: process.env.DB_PASSWORD,
        database: 'voting-app',
    },
    // Connection pool settings
    pool: {
        min: 2,
        max: 10,
        acquireTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
    },
    // Migration settings
    migrations: {
        directory: './prisma/migrations',
        autoMigrate: process.env.NODE_ENV === 'development',
    }
};