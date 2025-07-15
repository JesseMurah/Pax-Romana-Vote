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
var MnotifySmsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MnotifySmsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let MnotifySmsService = MnotifySmsService_1 = class MnotifySmsService {
    configService;
    logger = new common_1.Logger(MnotifySmsService_1.name);
    apiKey;
    apiUrl;
    senderName;
    axiosInstance;
    constructor(configService) {
        this.configService = configService;
        this.apiKey = this.configService.get('MNOTIFY_API_KEY') || 'OSVTWtsIHfgpzjvNgRsk63zMX';
        this.apiUrl = 'https://api.mnotify.com/api/sms/quick';
        this.senderName = this.configService.get('MNOTIFY_SENDER_ID') || 'PAX_ROMANA';
        if (!this.apiKey) {
            this.logger.error('MNOTIFY_API_KEY is not configured');
            throw new Error('MNOTIFY_API_KEY is not configured');
        }
        this.axiosInstance = axios_1.default.create({
            baseURL: this.apiUrl,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`
            },
        });
        this.logger.log(`MnotifySmsService initialized with API URL: ${this.apiUrl}, Sender ID: ${this.senderName}`);
    }
    async sendSms(smsDto) {
        try {
            const response = await this.axiosInstance.post('', {
                recipient: [smsDto.to],
                sender: smsDto.senderName || this.senderName,
                message: smsDto.message,
                is_schedule: false,
                schedule_date: '',
            });
            this.logger.log(`SMS sent successfully to ${smsDto.to}: ${JSON.stringify(response.data)}`);
            return {
                success: response.data.status === 'success',
                messageId: response.data.id || response.data.message_id,
            };
        }
        catch (error) {
            this.logger.error(`Failed to send SMS to ${smsDto.to}: ${error.message}`, error.stack);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async sendVerificationCode(phoneNumber, code) {
        const message = `Your Pax Romana KNUST verification code is: ${code}. Valid for 10 minutes.`;
        const result = await this.sendSms({
            to: phoneNumber,
            message,
        });
        return result.success;
    }
    async sendNominationStatusUpdate(phoneNumber, status, reason) {
        let message = `Pax Romana KNUST: Your nomination status has been updated to ${status}.`;
        if (reason) {
            message += ` Reason: ${reason}`;
        }
        message += ' Visit the portal for more details.';
        const result = await this.sendSms({
            to: phoneNumber,
            message,
        });
        return result.success;
    }
};
exports.MnotifySmsService = MnotifySmsService;
exports.MnotifySmsService = MnotifySmsService = MnotifySmsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MnotifySmsService);
//# sourceMappingURL=mnotify-sms.service.js.map