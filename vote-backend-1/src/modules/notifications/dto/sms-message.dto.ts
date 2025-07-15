import { IsOptional, IsPhoneNumber, IsString } from "class-validator";

export class SmsMessageDto {
    @IsPhoneNumber('GH')
    to: string;

    @IsString()
    message: string;

    @IsString()
    @IsOptional()
    senderName?: string;
}

export class BulkSmsDto {
    @IsPhoneNumber('GH', { each: true })
    recipients: string[];

    @IsString()
    message: string;

    @IsString()
    @IsOptional()
    senderName?: string;
}