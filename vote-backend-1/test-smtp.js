// test-smtp.js
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '/Users/jessemurah/Desktop/Pax-Voting/Vote/vote-backend-1/prisma/.env' });

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP Verification Error:', error);
    } else {
        console.log('SMTP Server is ready to send emails');
    }
});

transporter.sendMail({
    from: `"Pax Romana KNUST" <${process.env.SMTP_USER}>`,
    to: 'jkhnmurah@gmail.com',
    subject: 'Test Email',
    text: 'This is a test email.',
}).then(info => console.log('Email sent:', info))
    .catch(err => console.error('Error:', err));