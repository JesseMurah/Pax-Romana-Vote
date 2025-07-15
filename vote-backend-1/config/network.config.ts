export const networkConfig = {
    // Local network settings
    local: {
        allowedRanges: [
            '192.168.0.0/24',
            '192.168.1.0/24',
            '10.0.0.0/8',
            '172.16.0.0/12',
            '127.0.0.1/32', // localhost
        ],
        votingPort: 3001,
        frontendPort: 3000,
    },

    // CORS settings
    cors: {
        development: [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
        ],
        production: [
            'http://192.168.0.0:3000/24', // Local network range
            'http://192.168.1.0:3000/24',
        ],
    },

    // Security settings
    security: {
        enableIpWhitelist: process.env.NODE_ENV === 'production',
        enableDeviceFingerprinting: true,
        maxSessionDuration: 3600, // 1 hour
        maxConcurrentSessions: 1,
    },

    // Rate limiting
    rateLimit: {
        voting: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
        },
        sms: {
            windowMs: 60 * 1000, // 1 minute
            max: 5, // limit each IP to 5 SMS requests per minute
        },
    },
};