import { SmsMessageDto } from "../dto/sms-message.dto";
import {EmailMessageDto} from "../dto/email-message.dto";
import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";


@Injectable()
export class NotificationQueueService {
    constructor(
        @InjectQueue('sms-queue') private smsQueue: Queue,
        @InjectQueue('email-queue') private emailQueue: Queue,
    ) {}


    async queueSms(smsDto: SmsMessageDto, delay = 0): Promise<void> {
        // @ts-ignore
        await this.smsQueue.add('send-sms', smsDto, {
            delay,
            attempts: 3,
            // @ts-ignore
            backoff: 'exponential',
        });
    }
    async queueEmail(emailDto: EmailMessageDto, delay = 0): Promise<void> {
        await this.emailQueue.add('send-email', emailDto, {
            delay,
            attempts: 3,
            //@ts-ignore
            backoff: 'exponential',
        });
    }

    async queueBulkEmails(emails: EmailMessageDto[], delay = 0): Promise<void> {
        const jobs = emails.map(email => ({
            name: 'send-email',
            data: email,
            opts: { delay, attempts: 3, backoff: 'exponential' },
        }));

        // @ts-ignore
        await this.emailQueue.addBulk(jobs);
    }
}