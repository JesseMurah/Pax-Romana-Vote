import { NominationStatus } from "@prisma/client";
export declare class NominationStatusDto {
    id: string;
    status: NominationStatus;
    aspirantName: string;
    position: string;
    verificationStatus?: {
        nominator: boolean;
        guarantor1: boolean;
        guarantor2: boolean;
    };
    ecVotes?: {
        memberId: string;
        memberName: string;
        vote: 'APPROVE' | 'REJECT' | 'PENDING';
        reason?: string;
    }[];
    submittedAt?: string;
    reviewedAt?: string;
}
