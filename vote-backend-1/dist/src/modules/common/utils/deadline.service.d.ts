export declare class DeadlineService {
    isNominationOpen(): boolean;
    isInGracePeriod(): boolean;
    getNominationStatus(): {
        isOpen: boolean;
        message: string;
        phase: string;
    };
    getTimeRemaining(): {
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    };
    getAllDeadlines(): {
        LAUNCH_DATE: string;
        SUBMISSION_DEADLINE: string;
        GRACE_PERIOD_END: string;
        VETTING_DEADLINE: string;
        VOTING_START: string;
        VOTING_END: string;
        RESULTS_ANNOUNCEMENT: string;
    };
}
