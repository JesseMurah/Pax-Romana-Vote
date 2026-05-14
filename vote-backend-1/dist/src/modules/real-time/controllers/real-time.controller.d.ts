import { Request, Response } from 'express';
import { RealTimeService } from "../services/real-time.service";
export declare class RealTimeController {
    private realtimeService;
    private readonly logger;
    constructor(realtimeService: RealTimeService);
    votingProgressStream(req: Request, res: Response): void;
    adminDashboardStream(req: Request, res: Response, user: any): void;
    resultsStream(req: Request, res: Response, user: any, position?: string): void;
    systemMonitorStream(req: Request, res: Response, user: any): void;
}
