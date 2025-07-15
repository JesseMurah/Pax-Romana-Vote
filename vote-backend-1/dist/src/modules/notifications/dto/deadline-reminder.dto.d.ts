export declare class DeadlineReminderDto {
    title: string;
    message: string;
    deadline: Date;
    reminderType: 'SUBMISSION' | 'VERIFICATION' | 'REVIEW';
    targetAudience: 'ASPIRANTS' | 'EC_MEMBERS' | 'ALL';
}
