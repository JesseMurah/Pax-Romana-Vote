import { Injectable, Logger } from '@nestjs/common';
import { SseClient, SseConnectionInfo } from "../interfaces/sse-client.interface";
import { Response } from "express";
import {SseEventType} from "../enums/sse-event-types.enum";
import {SseEventDto} from "../dto/sse-event.dto";
import {UserRole} from "@prisma/client/index";

@Injectable()
export class RealTimeService {
    private readonly logger = new Logger(RealTimeService.name);
    private clients = new Map<string, SseClient>();
    private heartbeatInterval: NodeJS.Timeout;

    constructor() {
        // Start heartbeat to keep connections alive
        this.startHeartbeat();
    }

    /**
     * Add new SSE client connection
     */
    addClient(connectionInfo: SseConnectionInfo, response: Response): string {
        const client: SseClient = {
            id: connectionInfo.clientId,
            userId: connectionInfo.userId,
            role: connectionInfo.role,
            response,
            connectedAt: new Date(),
            lastHeartbeat: new Date(),
            isActive: true,
        };

        // Set SSE headers
        response.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control, Content-Type',
        });

        // Handle client disconnect
        response.on('close', () => {
            this.removeClient(connectionInfo.clientId);
        });

        response.on('error', (error) => {
            this.logger.error(`SSE connection error for client ${connectionInfo.clientId}:`, error);
            this.removeClient(connectionInfo.clientId);
        });

        this.clients.set(connectionInfo.clientId, client);

        // Send a welcome message
        this.sendToClient(connectionInfo.clientId, {
            type: SseEventType.SYSTEM_STATUS,
            data: { status: 'connected', clientId: connectionInfo.clientId },
            timestamp: new Date(),
        });

        this.logger.log(`SSE client connected: ${connectionInfo.clientId} (Role: ${connectionInfo.role})`);
        return connectionInfo.clientId;
    }

    /**
     * Remove client connection
     */
    removeClient(clientId: string): void {
        const client = this.clients.get(clientId);
        if (client) {
            client.isActive = false;
            if (!client.response.destroyed) {
                client.response.end();
            }
            this.clients.delete(clientId);
            this.logger.log(`SSE client disconnected: ${clientId}`);
        }
    }

    /**
     * Send event to a specific client
     */
    sendToClient(clientId: string, event: SseEventDto): boolean {
        const client = this.clients.get(clientId);
        if (!client || !client.isActive || client.response.destroyed) {
            this.removeClient(clientId);
            return false;
        }

        try {
            const eventData = this.formatSseEvent(event);
            client.response.write(eventData);
            client.lastHeartbeat = new Date();
            return true;
        } catch (error) {
            this.logger.error(`Failed to send event to client ${clientId}:`, error);
            this.removeClient(clientId);
            return false;
        }
    }

    /**
     * Broadcast event to all connected clients
     */
    broadcast(event: SseEventDto): number {
        let sentCount = 0;
        const clientIds = Array.from(this.clients.keys());

        for (const clientId of clientIds) {
            if (this.sendToClient(clientId, event)) {
                sentCount++;
            }
        }

        this.logger.debug(`Broadcasted event ${event.type} to ${sentCount}/${clientIds.length} clients`);
        return sentCount;
    }

    /**
     * Broadcast to clients with a specific role
     */
    broadcastToRole(event: SseEventDto, role: UserRole): number {
        let sentCount = 0;

        for (const [clientId, client] of this.clients) {
            if (client.role === role && this.sendToClient(clientId, event)) {
                sentCount++;
            }
        }

        this.logger.debug(`Broadcasted event ${event.type} to ${sentCount} clients with role ${role}`);
        return sentCount;
    }

    /**
     * Broadcast to admin roles (SUPER_ADMIN, ADMIN, EC_MEMBER)
     */
    broadcastToAdmins(event: SseEventDto): number {
        const adminRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EC_MEMBER];
        let sentCount = 0;

        for (const [clientId, client] of this.clients) {
            //@ts-ignore
            if (adminRoles.includes(client.role) && this.sendToClient(clientId, event)) {
                sentCount++;
            }
        }

        this.logger.debug(`Broadcasted event ${event.type} to ${sentCount} admin clients`);
        return sentCount;
    }

    /**
     * Get connection statistics
     */
    getConnectionStats() {
        const stats = {
            totalConnections: this.clients.size,
            roleBreakdown: {} as Record<UserRole, number>,
            activeConnections: 0,
        };

        for (const client of this.clients.values()) {
            if (client.isActive) {
                stats.activeConnections++;
                stats.roleBreakdown[client.role] = (stats.roleBreakdown[client.role] || 0) + 1;
            }
        }

        return stats;
    }

    /**
     * Format event for SSE protocol
     */
    private formatSseEvent(event: SseEventDto): string {
        let formatted = '';

        if (event.id) {
            formatted += `id: ${event.id}\n`;
        }

        formatted += `event: ${event.type}\n`;
        formatted += `data: ${JSON.stringify(event.data)}\n`;

        if (event.retry) {
            formatted += `retry: ${event.retry}\n`;
        }

        formatted += '\n'; // End with empty line

        return formatted;
    }

    /**
     * Start heartbeat to maintain connections
     */
    private startHeartbeat(): void {
        this.heartbeatInterval = setInterval(() => {
            const heartbeatEvent: SseEventDto = {
                type: SseEventType.HEARTBEAT,
                data: { timestamp: new Date() },
                timestamp: new Date(),
            };

            // Send heartbeat and remove dead connections
            const clientIds = Array.from(this.clients.keys());
            for (const clientId of clientIds) {
                if (!this.sendToClient(clientId, heartbeatEvent)) {
                    this.removeClient(clientId);
                }
            }
        }, 30000); // 30 seconds
    }

    /**
     * Cleanup on module destruction
     */
    onModuleDestroy(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }

        // Close all connections
        for (const clientId of this.clients.keys()) {
            this.removeClient(clientId);
        }
    }
}
