export const mnotifyConfig = {
    apiKey: process.env.MNOTIFY_API_KEY,
    apiUrl: 'https://api.mnotify.com/api/sms/quick',

    // SMS settings
    sms: {
        sender: 'PAX ROMANA', // Your sender ID
        defaultCountryCode: '+233', // Ghana
        timeout: 30000, // 30 seconds
        retries: 3,
    },

    // Message templates
    templates: {
        verification: 'Your PAX ROMANA verification code is: {code}. Valid for 15 minutes.',
        nomination: 'You have been nominated for {position} in PAX ROMANA elections. Please verify: {link}',
        guarantor: 'You are requested to guarantee {nominee} for {position}. Verify: {link}',
        status: 'Your nomination for {position} has been {status}. Details: {message}',
    },

    // Rate limiting
    rateLimit: {
        perMinute: 100,
        perHour: 1000,
        perDay: 5000,
    },
};