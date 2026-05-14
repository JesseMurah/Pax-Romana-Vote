import { Module } from '@nestjs/common';
import { RealTimeService } from './services/real-time.service';
import {DbModule} from "../../../db";
import {CacheModule} from "../caches/cache.module";
import {RealTimeController} from "./controllers/real-time.controller";
import {RealTimeDataController} from "./controllers/real-time-data.controller";
import {VotingStatsService} from "./services/voting-stats.service";
import {AnomalyDetectionService} from "./services/anomaly-detection.service";
import {DashboardDataService} from "./services/dashboard-data.service";

@Module({
  imports: [
      DbModule,
      CacheModule,
  ],
  controllers: [
      RealTimeController,
      RealTimeDataController,
  ],
  providers: [
      RealTimeService,
      VotingStatsService,
      AnomalyDetectionService,
      DashboardDataService,
  ],
  exports: [
      RealTimeService,
      VotingStatsService,
      AnomalyDetectionService,
      DashboardDataService,
  ]
})
export class RealTimeModule {}
