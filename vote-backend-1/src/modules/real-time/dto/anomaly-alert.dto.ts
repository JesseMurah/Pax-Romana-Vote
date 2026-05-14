export class AnomalyAlertDto {
    type: 'VOTING_SPIKE' | 'SUSPICIOUS_PATTERN' | 'SYSTEM_OVERLOAD' | 'DUPLICATE_ATTEMPT';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    details: any;
    timestamp: Date;
    requiresAction: boolean;
}