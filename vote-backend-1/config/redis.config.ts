import { registerAs } from "@nestjs/config";

export default registerAs('redis', () => ({
    host: process.env.REDIS_HOST || 'localhost',
    //@ts-ignore
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    //@ts-ignore
    db: parseInt(process.env.REDIS_DB, 10) || 0,
}));