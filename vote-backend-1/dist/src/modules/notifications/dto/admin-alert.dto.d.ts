import { AdminActions } from "../../common/enums/nomination-status.enum";
export declare class AdminAlertDto {
    title: string;
    message: string;
    actionType?: AdminActions;
    nominationId?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}
