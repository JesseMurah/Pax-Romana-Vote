import {Module} from "@nestjs/common";
import {CacheService} from "./cache.service";
import { CacheModule as NestCacheModule} from "@nestjs/cache-manager";

@Module({
  imports: [
    NestCacheModule.register({
      isGlobal: true,
      ttl: 300, // 5-minute default
      max: 1000, // Maximum number of items in cache
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}