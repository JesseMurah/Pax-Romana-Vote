import { UserRole } from "@prisma/client/index";
import { Response } from "express";
export interface SseClient {
    id: string;
    userId?: string;
    role: UserRole;
    response: Response;
    lastEventId?: string;
    connectedAt: Date;
    lastHeartbeat: Date;
    isActive: boolean;
}
export interface SseConnectionInfo {
    clientId: string;
    userId?: string;
    role: UserRole;
    userAgent?: string;
    ipAddress?: string;
}
