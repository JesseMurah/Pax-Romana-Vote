import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getStatus(): {
        message: string;
        version: string;
        environment: any;
        timestamp: string;
        status: string;
        election: {
            nominationOpen: boolean;
            timeRemaining: number;
            hoursRemaining: number;
            phase: string;
        };
    };
    getHealthCheck(): {
        status: string;
        timestamp: string;
        uptime: number;
        memory: NodeJS.MemoryUsage;
        database: string;
    };
    getElectionTimeline(): {
        currentTime: string;
        phase: string;
        deadlines: {
            nominationLaunch: {
                date: string;
                description: string;
                status: "upcoming" | "active" | "passed";
            };
            nominationDeadline: {
                date: string;
                description: string;
                status: "upcoming" | "active" | "passed";
            };
            gracePeriodEnd: {
                date: string;
                description: string;
                status: "upcoming" | "active" | "passed";
            };
            vettingComplete: {
                date: string;
                description: string;
                status: "upcoming" | "active" | "passed";
            };
        };
        timeRemaining: {
            hours: number;
            minutes: number;
            seconds: number;
        };
    };
}
