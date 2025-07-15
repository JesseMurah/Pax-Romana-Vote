import {registerAs} from "@nestjs/config";

export default registerAs('jwt', () => ({
    secret: process.env.JWT_SECRET || 'pax-romana-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'pax-romana-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));