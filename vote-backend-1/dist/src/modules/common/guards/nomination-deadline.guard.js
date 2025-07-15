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
exports.NominationDeadlineGuard = void 0;
const common_1 = require("@nestjs/common");
const deadline_service_1 = require("../utils/deadline.service");
let NominationDeadlineGuard = class NominationDeadlineGuard {
    deadlineService;
    constructor(deadlineService) {
        this.deadlineService = deadlineService;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const { isOpen, message } = this.deadlineService.getNominationStatus();
        if (!isOpen) {
            throw new common_1.BadRequestException(message);
        }
        request.deadlineInfo = {
            timeRemaining: this.deadlineService.getTimeRemaining(),
            isGracePeriod: this.deadlineService.isInGracePeriod(),
        };
        return true;
    }
};
exports.NominationDeadlineGuard = NominationDeadlineGuard;
exports.NominationDeadlineGuard = NominationDeadlineGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [deadline_service_1.DeadlineService])
], NominationDeadlineGuard);
//# sourceMappingURL=nomination-deadline.guard.js.map