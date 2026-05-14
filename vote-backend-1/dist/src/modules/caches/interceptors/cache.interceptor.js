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
exports.CacheInterceptor = void 0;
const common_1 = require("@nestjs/common");
const cache_service_1 = require("../cache.service");
const core_1 = require("@nestjs/core");
const rxjs_1 = require("rxjs");
const cache_1 = require("@nestjs/common/cache");
let CacheInterceptor = class CacheInterceptor {
    cacheService;
    reflector;
    constructor(cacheService, reflector) {
        this.cacheService = cacheService;
        this.reflector = reflector;
    }
    async intercept(context, next) {
        const cacheKey = this.reflector.get(cache_1.CACHE_KEY_METADATA, context.getHandler());
        const cacheTtl = this.reflector.get(cache_1.CACHE_TTL_METADATA, context.getHandler());
        if (!cacheKey) {
            return next.handle();
        }
        const cachedResult = await this.cacheService.get(cacheKey);
        if (cachedResult !== undefined) {
            return (0, rxjs_1.of)(cachedResult);
        }
        return next.handle().pipe((0, rxjs_1.tap)(async (result) => {
            await this.cacheService.set(cacheKey, result, cacheTtl);
        }));
    }
};
exports.CacheInterceptor = CacheInterceptor;
exports.CacheInterceptor = CacheInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cache_service_1.CacheService,
        core_1.Reflector])
], CacheInterceptor);
//# sourceMappingURL=cache.interceptor.js.map