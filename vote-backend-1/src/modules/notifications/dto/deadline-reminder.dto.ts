import {IsDate, IsEnum, IsString} from "class-validator";

export class DeadlineReminderDto {
    @IsString()
    title: string;

    @IsString()
    message: string;

    @IsDate()
    deadline: Date;

    @IsEnum(['SUBMISSION', 'VERIFICATION', 'REVIEW'])
    reminderType: 'SUBMISSION' | 'VERIFICATION' | 'REVIEW';

    @IsString()
    targetAudience: 'ASPIRANTS' | 'EC_MEMBERS' | 'ALL';
}