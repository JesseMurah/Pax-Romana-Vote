import { DashboardDataService } from "../services/dashboard-data.service";
import { VotingStatsService } from "../services/voting-stats.service";
import { AnomalyDetectionService } from "../services/anomaly-detection.service";
import { RealTimeService } from "../services/real-time.service";
import {Controller, Get, Param, UseGuards} from "@nestjs/common";
import { Candidate_Position, UserRole } from "@prisma/client/index";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { Roles } from "../../auth/decorators/roles.decorator";

@Controller('real-time-data')
export class RealTimeDataController {
    constructor(
        private votingStatsService: VotingStatsService,
        private anomalyDetectionService: AnomalyDetectionService,
        private dashboardDataService: DashboardDataService,
        private realtimeService: RealTimeService,
    ) {}

    /**
     * Get current voting progress (public endpoint)
     */
    @Get('voting-progress')
    async getVotingProgress() {
        return this.votingStatsService.getVotingProgress();
    }

    /**
     * Get position-specific statistics
     */
    @Get('position/:position')
    async getPositionStats(@Param('position') position: Candidate_Position) {
        return this.votingStatsService.getPositionStats(position);
    }

    /**
     * Get public dashboard data
     */
    @Get('public-dashboard')
    async getPublicDashboard() {
        return this.dashboardDataService.getPublicDashboardData();
    }

    /**
     * Get admin dashboard data (admin only)
     */
    @Get('admin-dashboard')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EC_MEMBER)
    async getAdminDashboard() {
        return this.dashboardDataService.getAdminDashboardData();
    }

    /**
     * Get voting velocity data (admin only)
     */
    @Get('voting-velocity')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EC_MEMBER)
    async getVotingVelocity() {
        return this.votingStatsService.getVotingVelocity();
    }

    /**
     * Get anomaly detection results (admin only)
     */
    @Get('anomalies')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EC_MEMBER)
    async getAnomalies() {
        return this.anomalyDetectionService.detectAnomalies();
    }

    /**
     * Get SSE connection statistics (super admin only)
     */
    @Get('connection-stats')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async getConnectionStats() {
        return this.realtimeService.getConnectionStats();
    }

    /**
     * Trigger cache refresh (admin only)
     */
    @Get('refresh-cache')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    async refreshCache() {
        await this.votingStatsService.clearStatsCache();
        return { message: 'Cache refreshed successfully' };
    }
}