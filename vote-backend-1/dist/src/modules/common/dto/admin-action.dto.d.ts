import { AdminActions } from "../enums/nomination-status.enum";
export declare class AdminActionDto {
    nominationId: string;
    action: AdminActions;
    reason?: string;
    comment?: string;
}
export declare class BulkAdminActionDto {
    nominationIds: string[];
    action: AdminActions;
    reason?: string;
}
