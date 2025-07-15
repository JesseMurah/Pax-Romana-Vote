export const deploymentConfig = {
    // Deployment modes
    modes: {
        DEVELOPMENT: 'development',
        NOMINATIONS: 'nominations',
        VOTING: 'voting',
        PRODUCTION: 'production',
    },

    // Current mode
    currentMode: process.env.DEPLOYMENT_MODE || 'development',

    // Feature flags based on deployment mode
    features: {
        development: {
            allowExternalVoting: true,
            enableDebugLogging: true,
            allowTestData: true,
            skipSmsVerification: true,
        },
        nominations: {
            allowExternalVoting: true,
            enableDebugLogging: false,
            allowTestData: false,
            skipSmsVerification: false,
            disableVotingEndpoints: true,
        },
        voting: {
            allowExternalVoting: false,
            enableDebugLogging: false,
            allowTestData: false,
            skipSmsVerification: false,
            disableNominationEndpoints: true,
            enableLocalNetworkOnly: true,
        },
        production: {
            allowExternalVoting: false,
            enableDebugLogging: false,
            allowTestData: false,
            skipSmsVerification: false,
        },
    },

    // Service endpoints
    endpoints: {
        nominations: process.env.NOMINATIONS_API_URL || 'https://your-nominations-api.vercel.app',
        voting: process.env.VOTING_API_URL || 'http://localhost:3001',
    },

    // Database settings per mode
    database: {
        nominations: {
            url: process.env.NOMINATIONS_DATABASE_URL,
            ssl: true,
        },
        voting: {
            url: process.env.VOTING_DATABASE_URL,
            ssl: false,
        },
    },
};