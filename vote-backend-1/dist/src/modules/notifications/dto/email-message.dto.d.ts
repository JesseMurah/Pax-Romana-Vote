export declare class EmailMessageDto {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    template?: string;
    templateData?: any;
}
export declare class BulkEmailDto {
    recipients: string[];
    subject: string;
    template?: string;
    templateData?: any;
}
