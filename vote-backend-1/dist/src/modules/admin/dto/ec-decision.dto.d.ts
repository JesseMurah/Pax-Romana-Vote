import { AdminActions } from "../../common/enums/nomination-status.enum";
export declare class EcDecisionDto {
    nominationId: string;
    decision: AdminActions;
    reason?: string;
    notes?: string;
}
export declare class EcConsensusStatusDto {
    nominationId: string;
    approvals: number;
    rejections: number;
    pending: number;
    isConsensusReached: boolean;
    finalDecision?: AdminActions;
}
