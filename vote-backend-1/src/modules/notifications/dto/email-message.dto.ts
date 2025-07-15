import { IsEmail, IsOptional, IsString } from "class-validator";

export class EmailMessageDto {
    @IsEmail()
    to: string;

    @IsString()
    subject: string;

    @IsString()
    @IsOptional()
    text?: string;

    @IsString()
    @IsOptional()
    html?: string;

    @IsString()
    @IsOptional()
    template?: string;

    @IsOptional()
    templateData?: any;
}

export class BulkEmailDto {
    @IsEmail({}, { each: true })
    recipients: string[];

    @IsString()
    subject: string;

    @IsString()
    @IsOptional()
    template?: string;

    @IsOptional()
    templateData?: any;
}