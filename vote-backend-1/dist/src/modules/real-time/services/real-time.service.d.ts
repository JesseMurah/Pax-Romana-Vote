import { SseConnectionInfo } from "../interfaces/sse-client.interface";
import { Response } from "express";
import { SseEventDto } from "../dto/sse-event.dto";
import { UserRole } from "@prisma/client/index";
export declare class RealTimeService {
    private readonly logger;
    private clients;
    private heartbeatInterval;
    constructor();
    addClient(connectionInfo: SseConnectionInfo, response: Response): string;
    removeClient(clientId: string): void;
    sendToClient(clientId: string, event: SseEventDto): boolean;
    broadcast(event: SseEventDto): number;
    broadcastToRole(event: SseEventDto, role: UserRole): number;
    broadcastToAdmins(event: SseEventDto): number;
    getConnectionStats(): {
        totalConnections: number;
        roleBreakdown: Record<UserRole, number>;
        activeConnections: number;
    };
    private formatSseEvent;
    private startHeartbeat;
    onModuleDestroy(): void;
}
