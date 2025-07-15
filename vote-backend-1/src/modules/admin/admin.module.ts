import { Module } from '@nestjs/common';
import { AdminService } from './services/admin.service';
import {NominationModule} from "../nominations/nomination.module";
import {UsersModule} from "../users/users.module";
import {NotificationsModule} from "../notifications/notifications.module";
import {SuperAdminController} from "./controllers/super-admin.controller";
import {EcNominationsController} from "./controllers/ec-nominations.controller";
import {AdminDashboardController} from "./controllers/admin-dashboard.controller";
import {NominationReviewService} from "./services/nomination-review.service";
import {EcConsensusService} from "./services/ec-consensus.service";
import {AdminDashboardService} from "./services/admin-dashboard.service";
import {NominationStatisticsService} from "./services/nomination-statistics.service";

@Module({
  imports: [
      UsersModule,
      NominationModule,
      NotificationsModule,
  ],
  controllers: [
      SuperAdminController,
      EcNominationsController,
      AdminDashboardController,
  ],
  providers: [
      AdminService,
      NominationReviewService,
      EcConsensusService,
      AdminDashboardService,
      NominationStatisticsService,
  ],
  exports: [
      AdminService,
      NominationReviewService,
      EcConsensusService,
      AdminDashboardService,
  ]
})
export class AdminModule {}
