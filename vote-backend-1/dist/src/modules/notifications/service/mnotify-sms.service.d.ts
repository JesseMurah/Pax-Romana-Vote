import { ConfigService } from '@nestjs/config';
import { SmsMessageDto } from '../dto/sms-message.dto';
export declare class MnotifySmsService {
    private configService;
    private readonly logger;
    private readonly apiKey;
    private readonly apiUrl;
    private readonly senderName;
    private readonly axiosInstance;
    constructor(configService: ConfigService);
    sendSms(smsDto: SmsMessageDto): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    sendVerificationCode(phoneNumber: string, code: string): Promise<boolean>;
    sendNominationStatusUpdate(phoneNumber: string, status: string, reason?: string): Promise<boolean>;
}
