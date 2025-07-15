import { AdminActions } from "../../common/enums/nomination-status.enum";
export declare class NominationReviewDto {
    nominationId: string;
    action: AdminActions;
    reason?: string;
    comments?: string;
}
export declare class BulkNominationReviewDto {
    nominationIds: string[];
    action: AdminActions;
    reason?: string;
    comments?: string;
}
