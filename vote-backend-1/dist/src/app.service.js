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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AppService = class AppService {
    configService;
    constructor(configService) {
        this.configService = configService;
        console.log('Instantiating AppService');
    }
    getApplicationStatus() {
        const now = new Date();
        const nominationDeadline = new Date('2024-07-22T23:59:59Z');
        const timeRemaining = nominationDeadline.getTime() - now.getTime();
        const isNominationOpen = timeRemaining > 0;
        return {
            message: 'Pax Romana KNUST Voting System API',
            version: '1.0.0',
            environment: this.configService.get('NODE_ENV', 'dev'),
            timestamp: now.toISOString(),
            status: 'operational',
            election: {
                nominationOpen: isNominationOpen,
                timeRemaining: Math.max(0, timeRemaining),
                hoursRemaining: Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60))),
                phase: this.getCurrentElectionPhase(),
            },
        };
    }
    getHealthCheck() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            database: 'connected',
        };
    }
    getElectionTimeline() {
        const now = new Date();
        return {
            currentTime: now.toISOString(),
            phase: this.getCurrentElectionPhase(),
            deadlines: {
                nominationLaunch: {
                    date: '2024-07-13T00:00:00Z',
                    description: 'Nominations open',
                    status: this.getDeadlineStatus('2024-07-13T00:00:00Z'),
                },
                nominationDeadline: {
                    date: '2024-07-22T23:59:59Z',
                    description: 'Nomination deadline',
                    status: this.getDeadlineStatus('2024-07-22T23:59:59Z'),
                },
                gracePeriodEnd: {
                    date: '2024-07-23T23:59:59Z',
                    description: 'Final deadline (grace period)',
                    status: this.getDeadlineStatus('2024-07-23T23:59:59Z'),
                },
                vettingComplete: {
                    date: '2024-07-27T23:59:59Z',
                    description: 'Vetting completed',
                    status: this.getDeadlineStatus('2024-07-27T23:59:59Z'),
                },
            },
            timeRemaining: this.getTimeRemaining(),
        };
    }
    getCurrentElectionPhase() {
        const now = new Date();
        if (now < new Date('2024-07-13T00:00:00Z')) {
            return 'PRE_NOMINATION';
        }
        else if (now <= new Date('2024-07-22T23:59:59Z')) {
            return 'NOMINATION_ACTIVE';
        }
        else if (now <= new Date('2024-07-23T23:59:59Z')) {
            return 'GRACE_PERIOD';
        }
        else if (now <= new Date('2024-07-27T23:59:59Z')) {
            return 'VETTING_PERIOD';
        }
        else {
            return 'VOTING_PREPARATION';
        }
    }
    getDeadlineStatus(deadline) {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        if (now < deadlineDate) {
            return 'upcoming';
        }
        else if (now.getTime() - deadlineDate.getTime() < 24 * 60 * 60 * 1000) {
            return 'active';
        }
        else {
            return 'passed';
        }
    }
    getTimeRemaining() {
        const now = new Date();
        const deadline = new Date('2024-07-22T23:59:59Z');
        const remaining = Math.max(0, deadline.getTime() - now.getTime());
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        return { hours, minutes, seconds };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AppService);
//# sourceMappingURL=app.service.js.map