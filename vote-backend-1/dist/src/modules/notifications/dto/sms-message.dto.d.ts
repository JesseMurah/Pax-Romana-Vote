export declare class SmsMessageDto {
    to: string;
    message: string;
    senderName?: string;
}
export declare class BulkSmsDto {
    recipients: string[];
    message: string;
    senderName?: string;
}
