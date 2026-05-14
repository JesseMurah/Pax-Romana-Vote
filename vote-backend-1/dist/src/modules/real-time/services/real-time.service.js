"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RealTimeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeService = void 0;
const common_1 = require("@nestjs/common");
const sse_event_types_enum_1 = require("../enums/sse-event-types.enum");
const index_1 = require("@prisma/client/index");
let RealTimeService = RealTimeService_1 = class RealTimeService {
    logger = new common_1.Logger(RealTimeService_1.name);
    clients = new Map();
    heartbeatInterval;
    constructor() {
        this.startHeartbeat();
    }
    addClient(connectionInfo, response) {
        const client = {
            id: connectionInfo.clientId,
            userId: connectionInfo.userId,
            role: connectionInfo.role,
            response,
            connectedAt: new Date(),
            lastHeartbeat: new Date(),
            isActive: true,
        };
        response.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control, Content-Type',
        });
        response.on('close', () => {
            this.removeClient(connectionInfo.clientId);
        });
        response.on('error', (error) => {
            this.logger.error(`SSE connection error for client ${connectionInfo.clientId}:`, error);
            this.removeClient(connectionInfo.clientId);
        });
        this.clients.set(connectionInfo.clientId, client);
        this.sendToClient(connectionInfo.clientId, {
            type: sse_event_types_enum_1.SseEventType.SYSTEM_STATUS,
            data: { status: 'connected', clientId: connectionInfo.clientId },
            timestamp: new Date(),
        });
        this.logger.log(`SSE client connected: ${connectionInfo.clientId} (Role: ${connectionInfo.role})`);
        return connectionInfo.clientId;
    }
    removeClient(clientId) {
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
    sendToClient(clientId, event) {
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
        }
        catch (error) {
            this.logger.error(`Failed to send event to client ${clientId}:`, error);
            this.removeClient(clientId);
            return false;
        }
    }
    broadcast(event) {
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
    broadcastToRole(event, role) {
        let sentCount = 0;
        for (const [clientId, client] of this.clients) {
            if (client.role === role && this.sendToClient(clientId, event)) {
                sentCount++;
            }
        }
        this.logger.debug(`Broadcasted event ${event.type} to ${sentCount} clients with role ${role}`);
        return sentCount;
    }
    broadcastToAdmins(event) {
        const adminRoles = [index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN, index_1.UserRole.EC_MEMBER];
        let sentCount = 0;
        for (const [clientId, client] of this.clients) {
            if (adminRoles.includes(client.role) && this.sendToClient(clientId, event)) {
                sentCount++;
            }
        }
        this.logger.debug(`Broadcasted event ${event.type} to ${sentCount} admin clients`);
        return sentCount;
    }
    getConnectionStats() {
        const stats = {
            totalConnections: this.clients.size,
            roleBreakdown: {},
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
    formatSseEvent(event) {
        let formatted = '';
        if (event.id) {
            formatted += `id: ${event.id}\n`;
        }
        formatted += `event: ${event.type}\n`;
        formatted += `data: ${JSON.stringify(event.data)}\n`;
        if (event.retry) {
            formatted += `retry: ${event.retry}\n`;
        }
        formatted += '\n';
        return formatted;
    }
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            const heartbeatEvent = {
                type: sse_event_types_enum_1.SseEventType.HEARTBEAT,
                data: { timestamp: new Date() },
                timestamp: new Date(),
            };
            const clientIds = Array.from(this.clients.keys());
            for (const clientId of clientIds) {
                if (!this.sendToClient(clientId, heartbeatEvent)) {
                    this.removeClient(clientId);
                }
            }
        }, 30000);
    }
    onModuleDestroy() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        for (const clientId of this.clients.keys()) {
            this.removeClient(clientId);
        }
    }
};
exports.RealTimeService = RealTimeService;
exports.RealTimeService = RealTimeService = RealTimeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RealTimeService);
//# sourceMappingURL=real-time.service.js.map