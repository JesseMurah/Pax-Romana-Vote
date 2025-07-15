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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationQueueService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
let NotificationQueueService = class NotificationQueueService {
    smsQueue;
    emailQueue;
    constructor(smsQueue, emailQueue) {
        this.smsQueue = smsQueue;
        this.emailQueue = emailQueue;
    }
    async queueSms(smsDto, delay = 0) {
        await this.smsQueue.add('send-sms', smsDto, {
            delay,
            attempts: 3,
            backoff: 'exponential',
        });
    }
    async queueEmail(emailDto, delay = 0) {
        await this.emailQueue.add('send-email', emailDto, {
            delay,
            attempts: 3,
            backoff: 'exponential',
        });
    }
    async queueBulkEmails(emails, delay = 0) {
        const jobs = emails.map(email => ({
            name: 'send-email',
            data: email,
            opts: { delay, attempts: 3, backoff: 'exponential' },
        }));
        await this.emailQueue.addBulk(jobs);
    }
};
exports.NotificationQueueService = NotificationQueueService;
exports.NotificationQueueService = NotificationQueueService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bull_1.InjectQueue)('sms-queue')),
    __param(1, (0, bull_1.InjectQueue)('email-queue')),
    __metadata("design:paramtypes", [Object, Object])
], NotificationQueueService);
//# sourceMappingURL=notification-queue.service.js.map