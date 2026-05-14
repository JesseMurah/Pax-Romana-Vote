import { Module } from '@nestjs/common';
import { ResultsService } from './services/results.service';
import { ResultsController } from './results.controller';
import {VoteCountingService} from "./services/vote-counting.service";
import {CertificationService} from "./services/certification.service";
import {VoteEncryptionService} from "./services/vote-encryption.service";
import {ExportService} from "./services/export.service";
import {DbModule} from "../../../db";
import {CacheModule} from "../caches/cache.module";
import {RealTimeModule} from "../real-time/real-time.module";

@Module({
  imports: [
      DbModule,
      CacheModule,
      RealTimeModule,
  ],
  controllers: [ResultsController],
  providers: [
      ResultsService,
      VoteCountingService,
      CertificationService,
      VoteEncryptionService,
      ExportService,
  ],
  exports: [
      ResultsService,
      VoteCountingService,
      CertificationService,
  ],
})
export class ResultsModule {}
