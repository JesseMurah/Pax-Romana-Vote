"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeadlineService = void 0;
const nomination_deadlines_constant_1 = require("../constants/nomination-deadlines.constant");
const common_1 = require("@nestjs/common");
let DeadlineService = class DeadlineService {
    isNominationOpen() {
        const now = new Date();
        const launchDate = new Date(nomination_deadlines_constant_1.NOMINATION_DEADLINES.LAUNCH_DATE);
        const graceEnd = new Date(nomination_deadlines_constant_1.NOMINATION_DEADLINES.GRACE_PERIOD_END);
        return now >= launchDate && now <= graceEnd;
    }
    isInGracePeriod() {
        const now = new Date();
        const deadline = new Date(nomination_deadlines_constant_1.NOMINATION_DEADLINES.SUBMISSION_DEADLINE);
        const graceEnd = new Date(nomination_deadlines_constant_1.NOMINATION_DEADLINES.GRACE_PERIOD_END);
        return now > deadline && now <= graceEnd;
    }
    getNominationStatus() {
        const now = new Date();
        const launchDate = new Date(nomination_deadlines_constant_1.NOMINATION_DEADLINES.LAUNCH_DATE);
        const deadline = new Date(nomination_deadlines_constant_1.NOMINATION_DEADLINES.SUBMISSION_DEADLINE);
        const graceEnd = new Date(nomination_deadlines_constant_1.NOMINATION_DEADLINES.GRACE_PERIOD_END);
        if (now < launchDate) {
            return { isOpen: false, message: nomination_deadlines_constant_1.DEADLINE_MESSAGES.BEFORE_LAUNCH, phase: 'BEFORE_LAUNCH' };
        }
        if (now <= deadline) {
            return { isOpen: true, message: nomination_deadlines_constant_1.DEADLINE_MESSAGES.ACTIVE, phase: 'ACTIVE' };
        }
        if (now <= graceEnd) {
            return { isOpen: true, message: nomination_deadlines_constant_1.DEADLINE_MESSAGES.GRACE_PERIOD, phase: 'GRACE_PERIOD' };
        }
        return { isOpen: false, message: nomination_deadlines_constant_1.DEADLINE_MESSAGES.CLOSED, phase: 'CLOSED' };
    }
    getTimeRemaining() {
        const now = new Date();
        const deadline = new Date(nomination_deadlines_constant_1.NOMINATION_DEADLINES.SUBMISSION_DEADLINE);
        const graceEnd = new Date(nomination_deadlines_constant_1.NOMINATION_DEADLINES.GRACE_PERIOD_END);
        const targetDate = now > deadline ? graceEnd : deadline;
        const diff = targetDate.getTime() - now.getTime();
        if (diff <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        return { days, hours, minutes, seconds };
    }
    getAllDeadlines() {
        return nomination_deadlines_constant_1.NOMINATION_DEADLINES;
    }
};
exports.DeadlineService = DeadlineService;
exports.DeadlineService = DeadlineService = __decorate([
    (0, common_1.Injectable)()
], DeadlineService);
//# sourceMappingURL=deadline.service.js.map