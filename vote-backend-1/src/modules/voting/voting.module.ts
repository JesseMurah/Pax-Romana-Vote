import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { CacheModule } from "../caches/cache.module";
import { DbModule } from "../../../db";
import { VotingController } from "./voting.controller";
import { VotingService } from "./voting.service";
import { RealTimeModule } from "../real-time/real-time.module";
import {ResultsModule} from "../results/results.module";

@Module({
    imports: [
        HttpModule,
        DbModule,
        CacheModule,
        RealTimeModule,
        ResultsModule
    ],
    controllers: [VotingController],
    providers: [VotingService],
    exports: [VotingService],
})
export class VotingModule {}