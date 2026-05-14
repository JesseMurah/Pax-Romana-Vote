"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const config_1 = require("@nestjs/config");
const path = require("node:path");
const fs = require("node:fs");
let EmailService = EmailService_1 = class EmailService {
    configService;
    logger = new common_1.Logger(EmailService_1.name);
    transporter;
    constructor(configService) {
        this.configService = configService;
        const smtpPort = parseInt(this.configService.get('SMTP_PORT', '587'));
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASS'),
            },
            connectionTimeout: 60000,
            greetingTimeout: 30000,
            socketTimeout: 60000,
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            rateDelta: 20000,
            rateLimit: 5,
        });
        this.delayedVerifyConnection();
    }
    async delayedVerifyConnection() {
        setTimeout(async () => {
            try {
                await this.transporter.verify();
                this.logger.log('SMTP connection verified successfully');
            }
            catch (error) {
                this.logger.error('SMTP connection verification failed:', error);
                this.logger.error('Please check your email configuration');
                this.logger.error('Debugging info:');
                this.logger.error(`SMTP_HOST: ${this.configService.get('SMTP_HOST')}`);
                this.logger.error(`SMTP_PORT: ${this.configService.get('SMTP_PORT')}`);
                this.logger.error(`SMTP_USER: ${this.configService.get('SMTP_USER')}`);
                this.logger.error('Make sure you are using an App Password, not your regular Gmail password!');
            }
        }, 2000);
    }
    async sendEmail(emailDto) {
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
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${emailDto.to}:`, error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async renderTemplate(templateName, data) {
        try {
            const templatePath = this.getTemplatePath(templateName);
            const templateContent = await fs.promises.readFile(templatePath, 'utf8');
            this.logger.debug(`Template ${templateName} compiled and cached`);
            const template = handlebars.compile(templateContent);
            const html = template(data);
            this.logger.debug(`Template ${templateName} rendered successfully`);
            return html;
        }
        catch (error) {
            this.logger.error(`Error rendering template ${templateName}:`, error);
            throw error;
        }
    }
    getTemplatePath(templateName) {
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
    async sendNominatorVerificationEmail(to, data) {
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
    async sendGuarantorVerificationEmail(to, data) {
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
    async sendNominationStatusEmail(email, nomineeName, status, reason) {
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
    async sendNominationConfirmationEmail(email, nominationData) {
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
    async sendVerificationCompleteEmail(email, nominationData) {
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
    async sendDeadlineReminderEmail(email, hoursLeft) {
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
    async sendAdminNotificationEmail(emails, subject, data) {
        try {
            const promises = emails.map(email => this.sendEmail({
                to: email,
                subject: `Pax Romana KNUST Admin - ${subject}`,
                template: 'admin-notification',
                templateData: data,
            }));
            const results = await Promise.all(promises);
            return results.every(result => result.success);
        }
        catch (error) {
            this.logger.error('Failed to send admin notification emails:', error);
            return false;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map