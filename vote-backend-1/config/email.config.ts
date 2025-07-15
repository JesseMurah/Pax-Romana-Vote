export const emailConfig = {
    smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(<string>process.env.SMTP_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
    },

    // Email settings
    defaults: {
        from: `"PAX ROMANA KNUST" <${process.env.SMTP_USER}>`,
        replyTo: process.env.SMTP_USER || 'jkhnmurah420@gmail.com',
    },

    // Template settings
    templates: {
        path: './src/modules/notifications/templates/email',
        options: {
            extension: 'hbs',
            layoutsDir: './src/modules/notifications/templates/email/layouts',
            partialsDir: './src/modules/notifications/templates/email/partials',
        },
    },

    // Email types
    types: {
        NOMINATION_CONFIRMATION: 'nomination-confirmation',
        GUARANTOR_VERIFICATION: 'guarantor-verification',
        NOMINEE_VERIFICATION: 'nominee-verification',
        NOMINATOR_VERIFICATION: 'nominator-verification',
        STATUS_UPDATE: 'status-update',
        ELECTION_REMINDER: 'election-reminder',
    },

    // Rate limiting
    rateLimit: {
        perMinute: 50,
        perHour: 500,
    },
};