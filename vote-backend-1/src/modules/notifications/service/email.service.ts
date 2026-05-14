import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import * as handlebars from 'handlebars';
import { ConfigService } from "@nestjs/config";
import { EmailMessageDto } from "../dto/email-message.dto";
import * as path from "node:path";
import * as fs from "node:fs";

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        const smtpPort = parseInt(this.configService.get('SMTP_PORT', '587'));

        this.transporter = nodemailer.createTransport({
            service: 'gmail', // Use Gmail service instead of manual config
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASS'),
            },
            // Alternative manual configuration if service doesn't work
            // host: 'smtp.gmail.com',
            // port: 587,
            // secure: false, // true for 465, false for other ports like 587
            // auth: {
            //     user: this.configService.get('SMTP_USER'),
            //     pass: this.configService.get('SMTP_PASS'),
            // },
            // tls: {
            //     ciphers: 'SSLv3',
            //     rejectUnauthorized: false,
            // },

            // Connection settings
            connectionTimeout: 60000,
            greetingTimeout: 30000,
            socketTimeout: 60000,

            // Pool settings
            pool: true,
            maxConnections: 5,
            maxMessages: 100,

            // Rate limiting
            rateDelta: 20000,
            rateLimit: 5,
        });

        // Verify the connection configuration with delay
        this.delayedVerifyConnection();
    }

    private async delayedVerifyConnection(): Promise<void> {
        // Add a small delay to ensure the service is ready
        setTimeout(async () => {
            try {
                await this.transporter.verify();
                this.logger.log('SMTP connection verified successfully');
            } catch (error) {
                this.logger.error('SMTP connection verification failed:', error);
                this.logger.error('Please check your email configuration');

                // Log helpful debugging info
                this.logger.error('Debugging info:');
                this.logger.error(`SMTP_HOST: ${this.configService.get('SMTP_HOST')}`);
                this.logger.error(`SMTP_PORT: ${this.configService.get('SMTP_PORT')}`);
                this.logger.error(`SMTP_USER: ${this.configService.get('SMTP_USER')}`);
                this.logger.error('Make sure you are using an App Password, not your regular Gmail password!');
            }
        }, 2000);
    }

    async sendEmail(emailDto: EmailMessageDto): Promise<{ success: boolean; messageId?: string; error?: string }> {
        try {
            let html = emailDto.html;

            if (emailDto.template) {
                html = await this.renderTemplate(emailDto.template, emailDto.templateData);
            }

            const mailOptions = {
                from: `"Pax Romana KNUST" <${this.configService.get('SMTP_USER')}>`,
                to: emailDto.to,
                subject: emailDto.subject,
                text: emailDto.text,
                html,
            };

            const info = await this.transporter.sendMail(mailOptions);

            this.logger.log(`Email sent successfully to ${emailDto.to}`);
            return {
                success: true,
                messageId: info.messageId,
            };
        } catch (error) {
            this.logger.error(`Failed to send email to ${emailDto.to}:`, error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    private async renderTemplate(templateName: string, data: any): Promise<string> {
        try {
            const templatePath = this.getTemplatePath(templateName);
            const templateContent = await fs.promises.readFile(templatePath, 'utf8');

            this.logger.debug(`Template ${templateName} compiled and cached`);

            const template = handlebars.compile(templateContent);
            const html = template(data);

            this.logger.debug(`Template ${templateName} rendered successfully`);
            return html;
        } catch (error) {
            this.logger.error(`Error rendering template ${templateName}:`, error);
            throw error;
        }
    }

    private getTemplatePath(templateName: string): string {
        const templateFileName = templateName.endsWith('.hbs') ? templateName : `${templateName}.hbs`;

        const possiblePaths = [
            path.join(process.cwd(), 'src', 'modules', 'notifications', 'templates', 'email', templateFileName),
            path.join(process.cwd(), 'dist', 'src', 'modules', 'notifications', 'templates', 'email', templateFileName),
            path.join(process.cwd(), 'dist', 'modules', 'notifications', 'templates', 'email', templateFileName),
        ];

        for (const templatePath of possiblePaths) {
            if (fs.existsSync(templatePath)) {
                this.logger.debug(`Found template at: ${templatePath}`);
                return templatePath;
            }
        }

        this.logger.error(`Template not found in any of these locations:`);
        possiblePaths.forEach(p => this.logger.error(`  - ${p}`));
        throw new Error(`Template file not found: ${templateFileName}`);
    }

    async sendNominatorVerificationEmail(to: string, data: any): Promise<void> {
        const result = await this.sendEmail({
            to,
            subject: 'Nomination Verification Required - Pax Romana KNUST',
            template: 'nominator-verification',
            templateData: data,
        });

        if (!result.success) {
            throw new Error(`Failed to send nominator verification email to ${to}: ${result.error}`);
        }
    }

    async sendGuarantorVerificationEmail(to: string, data: any): Promise<void> {
        const result = await this.sendEmail({
            to,
            subject: 'Guarantor Verification Required - Pax Romana KNUST',
            template: 'guarantor-verification',
            templateData: data,
        });

        if (!result.success) {
            throw new Error(`Failed to send guarantor verification email to ${to}: ${result.error}`);
        }
    }

    async sendNominationStatusEmail(email: string, nomineeName: string, status: string, reason?: string): Promise<boolean> {
        const result = await this.sendEmail({
            to: email,
            subject: `Pax Romana KNUST - Nomination ${status}`,
            template: status === 'APPROVED' ? 'nomination-approved' : 'nomination-rejected',
            templateData: {
                nomineeName,
                status,
                reason,
                timestamp: new Date().toISOString()
            },
        });

        return result.success;
    }

    async sendNominationConfirmationEmail(email: string, nominationData: any): Promise<boolean> {
        const result = await this.sendEmail({
            to: email,
            subject: 'Pax Romana KNUST - Nomination Submitted Successfully',
            template: 'nomination-confirmation',
            templateData: {
                ...nominationData,
                submissionDate: new Date().toISOString(),
            },
        });

        return result.success;
    }

    async sendVerificationCompleteEmail(email: string, nominationData: any): Promise<boolean> {
        const result = await this.sendEmail({
            to: email,
            subject: 'Pax Romana KNUST - Nomination Verification Complete',
            template: 'nomination-verification-complete',
            templateData: {
                ...nominationData,
                completionDate: new Date().toISOString(),
            },
        });

        return result.success;
    }

    async sendDeadlineReminderEmail(email: string, hoursLeft: number): Promise<boolean> {
        const result = await this.sendEmail({
            to: email,
            subject: 'Pax Romana KNUST - Nomination Deadline Reminder',
            template: 'deadline-reminder',
            templateData: {
                hoursLeft,
                deadlineDate: new Date(Date.now() + hoursLeft * 60 * 60 * 1000).toISOString(),
            },
        });

        return result.success;
    }

    async sendAdminNotificationEmail(emails: string[], subject: string, data: any): Promise<boolean> {
        try {
            const promises = emails.map(email =>
                this.sendEmail({
                    to: email,
                    subject: `Pax Romana KNUST Admin - ${subject}`,
                    template: 'admin-notification',
                    templateData: data,
                })
            );

            const results = await Promise.all(promises);
            return results.every(result => result.success);
        } catch (error) {
            this.logger.error('Failed to send admin notification emails:', error);
            return false;
        }
    }
}