import {Module} from "@nestjs/common";
import {CandidatesController} from "./candidates.controller";
import {CandidatesService} from "./candidates.service";
import {PrismaService} from "../../../db";
import {SupabaseService} from "../supabase";
import {CacheModule} from "../caches/cache.module";

@Module({
    imports: [
        CacheModule,
    ],
    controllers: [
        CandidatesController
    ],
    providers: [
        CandidatesService,
        PrismaService,
        SupabaseService
    ],
    exports: [
        CandidatesService
    ],
})
export class CandidatesModule {}