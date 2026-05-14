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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var VotingController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VotingController = void 0;
const common_1 = require("@nestjs/common");
const voting_service_1 = require("./voting.service");
const generate_otp_dto_1 = require("./dto/generate-otp.dto");
const verify_otp_dto_1 = require("./dto/verify-otp.dto");
const submit_vote_dto_1 = require("./dto/submit-vote.dto");
const index_1 = require("@prisma/client/index");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const sse_event_types_enum_1 = require("../real-time/enums/sse-event-types.enum");
let VotingController = VotingController_1 = class VotingController {
    votingService;
    logger = new common_1.Logger(VotingController_1.name);
    constructor(votingService) {
        this.votingService = votingService;
    }
    async generateOtp(dto) {
        try {
            this.logger.log(`OTP generation requested for: ${dto.email}`);
            this.logger.debug(`Request payload:`, {
                name: dto.name,
                email: dto.email,
                phoneNumber: dto.phoneNumber?.slice(-4),
            });
            if (!dto.name || !dto.email || !dto.phoneNumber) {
                throw new common_1.HttpException({
                    message: 'Missing required fields: name, email, and phoneNumber are required',
                    error: 'Bad Request',
                    statusCode: 400,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.votingService.generateOtp(dto);
            this.logger.log(`OTP generated successfully for: ${dto.email}`);
            return {
                success: true,
                ...result
            };
        }
        catch (error) {
            this.logger.error(`OTP generation failed for ${dto.email}:`, error.message);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                message: error.message || 'Failed to generate OTP',
                error: 'Internal Server Error',
                statusCode: 500,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyOtp(dto) {
        try {
            this.logger.log(`OTP verification requested for: ${dto.email}`);
            this.logger.debug(`Verification payload:`, {
                email: dto.email,
                phoneNumber: dto.phoneNumber?.slice(-4),
                otpLength: dto.otp?.length,
            });
            if (!dto.phoneNumber || !dto.otp || !dto.email) {
                throw new common_1.HttpException({
                    message: 'Missing required fields: phoneNumber, otp, and email are required',
                    error: 'Validation Error',
                    statusCode: 422,
                }, common_1.HttpStatus.UNPROCESSABLE_ENTITY);
            }
            if (dto.otp.length !== 6 || !/^\d{6}$/.test(dto.otp)) {
                throw new common_1.HttpException({
                    message: 'OTP must be exactly 6 digits',
                    error: 'Validation Error',
                    statusCode: 422,
                }, common_1.HttpStatus.UNPROCESSABLE_ENTITY);
            }
            const result = await this.votingService.verifyOtp(dto);
            this.logger.log(`OTP verified successfully for: ${dto.email}`);
            return result;
        }
        catch (error) {
            this.logger.error(`OTP verification failed for ${dto.email}:`, error.message);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            if (error.message.includes('Invalid or expired OTP')) {
                throw new common_1.HttpException({
                    message: 'Invalid or expired OTP. Please request a new code.',
                    error: 'OTP Verification Failed',
                    statusCode: 422,
                }, common_1.HttpStatus.UNPROCESSABLE_ENTITY);
            }
            if (error.message.includes('Email mismatch')) {
                throw new common_1.HttpException({
                    message: 'Email does not match the OTP request.',
                    error: 'Email Mismatch',
                    statusCode: 422,
                }, common_1.HttpStatus.UNPROCESSABLE_ENTITY);
            }
            if (error.message.includes('already voted')) {
                throw new common_1.HttpException({
                    message: 'You have already voted in this election.',
                    error: 'Already Voted',
                    statusCode: 409,
                }, common_1.HttpStatus.CONFLICT);
            }
            throw new common_1.HttpException({
                message: error.message || 'OTP verification failed',
                error: 'Internal Server Error',
                statusCode: 500,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getBallot() {
        this.logger.debug('Ballot requested');
        return this.votingService.getBallot();
    }
    async submitVote(dto) {
        if (!dto.sessionId || !dto.votes) {
            throw new common_1.BadRequestException('Session ID and votes are required');
        }
        this.logger.log(`Vote submission for session: ${dto.sessionId.slice(0, 8)}***`);
        const result = await this.votingService.submitVote(dto);
        this.logger.log(`Vote successfully submitted - ID: ${result.voteId}`);
        return result;
    }
    async validateSession(sessionId) {
        this.logger.debug(`Session validation requested: ${sessionId.slice(0, 8)}***`);
        return this.votingService.validateSession(sessionId);
    }
    async getVotingStats() {
        this.logger.debug('Voting statistics requested');
        return this.votingService.getVotingStats();
    }
    async getVotingProgress() {
        this.logger.debug('Real-time voting progress requested');
        return this.votingService.getVotingStats();
    }
    async getPositionStats(position) {
        if (!Object.values(index_1.Candidate_Position).includes(position)) {
            throw new common_1.BadRequestException('Invalid position');
        }
        this.logger.debug(`Position stats requested for: ${position}`);
        return this.votingService.getPositionStats(position);
    }
    async getRealtimeConnections(user) {
        this.logger.log(`Real-time connection info requested by: ${user.email}`);
        return this.votingService.getRealtimeConnectionInfo();
    }
    async refreshStats(user) {
        this.logger.log(`Manual stats refresh triggered by: ${user.email}`);
        await this.votingService.refreshAndBroadcastStats();
        return {
            message: 'Statistics refreshed and broadcasted successfully',
            triggeredBy: user.email,
            timestamp: new Date(),
        };
    }
    async broadcastMessage(body, user) {
        const { message, role, eventType = sse_event_types_enum_1.SseEventType.SYSTEM_STATUS } = body;
        if (!message || !role) {
            throw new common_1.BadRequestException('Message and role are required');
        }
        if (!Object.values(index_1.UserRole).includes(role)) {
            throw new common_1.BadRequestException('Invalid role specified');
        }
        this.logger.log(`Broadcasting message to ${role} by: ${user.email}`);
        await this.votingService.broadcastMessage(message, role, eventType);
        return {
            message: 'Message broadcasted successfully',
            targetRole: role,
            broadcastedBy: user.email,
            timestamp: new Date(),
        };
    }
    async getVotingVelocity(user) {
        this.logger.debug(`Voting velocity requested by: ${user.email}`);
        return this.votingService.getVotingVelocity();
    }
    async getVotingAnalytics(user, timeframe, position) {
        this.logger.log(`Voting analytics requested by: ${user.email}`);
        return this.votingService.getVotingAnalytics({
            timeframe: timeframe || 'all',
            position: position,
            requestedBy: user.email,
        });
    }
    async getSystemHealth(user) {
        this.logger.debug(`System health check by: ${user.email}`);
        return this.votingService.getSystemHealth();
    }
    async getAnomalies(user) {
        this.logger.log(`Anomaly detection results requested by: ${user.email}`);
        return this.votingService.getAnomalies();
    }
    async pauseVoting(body, user) {
        const { reason } = body;
        if (!reason) {
            throw new common_1.BadRequestException('Reason for pausing is required');
        }
        this.logger.warn(`EMERGENCY: Voting paused by ${user.email}. Reason: ${reason}`);
        await this.votingService.pauseVoting(reason, user.email);
        return {
            message: 'Voting has been paused',
            reason,
            pausedBy: user.email,
            timestamp: new Date(),
        };
    }
    async resumeVoting(body, user) {
        const { reason } = body;
        if (!reason) {
            throw new common_1.BadRequestException('Reason for resuming is required');
        }
        this.logger.log(`Voting resumed by ${user.email}. Reason: ${reason}`);
        await this.votingService.resumeVoting(reason, user.email);
        return {
            message: 'Voting has been resumed',
            reason,
            resumedBy: user.email,
            timestamp: new Date(),
        };
    }
    async getActiveSessions(user) {
        this.logger.debug(`Active sessions requested by: ${user.email}`);
        return this.votingService.getActiveSessions();
    }
    async exportVotingData(user, format = 'json', includePersonalData = 'false') {
        this.logger.log(`Voting data export requested by: ${user.email}, format: ${format}`);
        return this.votingService.exportVotingData({
            format,
            includePersonalData: includePersonalData === 'true',
            exportedBy: user.email,
        });
    }
    async testRealtimeConnection(user) {
        this.logger.log(`Real-time connection test by: ${user.email}`);
        await this.votingService.broadcastMessage(`Real-time connectivity test by ${user.name} (${user.email})`, index_1.UserRole.SUPER_ADMIN, sse_event_types_enum_1.SseEventType.SYSTEM_STATUS);
        return {
            message: 'Test message sent to admin channels',
            testBy: user.email,
            timestamp: new Date(),
        };
    }
    async getVotingTimeline() {
        this.logger.debug('Voting timeline requested');
        return this.votingService.getVotingTimeline();
    }
    async getPublicDashboard() {
        this.logger.debug('Public dashboard data requested');
        return this.votingService.getPublicDashboardData();
    }
};
exports.VotingController = VotingController;
__decorate([
    (0, common_1.Post)('generate-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_otp_dto_1.GenerateOtpDto]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "generateOtp", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_otp_dto_1.VerifyOtpDto]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Get)('ballot'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "getBallot", null);
__decorate([
    (0, common_1.Post)('submit'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [submit_vote_dto_1.SubmitVoteDto]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "submitVote", null);
__decorate([
    (0, common_1.Get)('session/:sessionId/validate'),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "validateSession", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "getVotingStats", null);
__decorate([
    (0, common_1.Get)('progress'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "getVotingProgress", null);
__decorate([
    (0, common_1.Get)('position/:position/stats'),
    __param(0, (0, common_1.Param)('position')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "getPositionStats", null);
__decorate([
    (0, common_1.Get)('realtime/connections'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN, index_1.UserRole.EC_MEMBER),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "getRealtimeConnections", null);
__decorate([
    (0, common_1.Post)('stats/refresh'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN, index_1.UserRole.EC_MEMBER),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "refreshStats", null);
__decorate([
    (0, common_1.Post)('broadcast'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "broadcastMessage", null);
__decorate([
    (0, common_1.Get)('velocity'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN, index_1.UserRole.EC_MEMBER),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "getVotingVelocity", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN, index_1.UserRole.EC_MEMBER),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('timeframe')),
    __param(2, (0, common_1.Query)('position')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "getVotingAnalytics", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN, index_1.UserRole.EC_MEMBER),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "getSystemHealth", null);
__decorate([
    (0, common_1.Get)('anomalies'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "getAnomalies", null);
__decorate([
    (0, common_1.Put)('emergency/pause'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "pauseVoting", null);
__decorate([
    (0, common_1.Put)('emergency/resume'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "resumeVoting", null);
__decorate([
    (0, common_1.Get)('sessions/active'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN, index_1.UserRole.EC_MEMBER),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "getActiveSessions", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('format')),
    __param(2, (0, common_1.Query)('includePersonalData')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "exportVotingData", null);
__decorate([
    (0, common_1.Post)('test/realtime'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN, index_1.UserRole.EC_MEMBER),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "testRealtimeConnection", null);
__decorate([
    (0, common_1.Get)('timeline'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "getVotingTimeline", null);
__decorate([
    (0, common_1.Get)('dashboard/public'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "getPublicDashboard", null);
exports.VotingController = VotingController = VotingController_1 = __decorate([
    (0, common_1.Controller)('voting'),
    __metadata("design:paramtypes", [voting_service_1.VotingService])
], VotingController);
//# sourceMappingURL=voting.controller.js.map