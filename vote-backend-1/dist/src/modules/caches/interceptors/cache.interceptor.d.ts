import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { CacheService } from "../cache.service";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
export declare class CacheInterceptor implements NestInterceptor {
    private cacheService;
    private reflector;
    constructor(cacheService: CacheService, reflector: Reflector);
    intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>>;
}
