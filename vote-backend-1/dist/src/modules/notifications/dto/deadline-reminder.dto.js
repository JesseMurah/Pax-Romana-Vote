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
exports.DeadlineReminderDto = void 0;
const class_validator_1 = require("class-validator");
class DeadlineReminderDto {
    title;
    message;
    deadline;
    reminderType;
    targetAudience;
}
exports.DeadlineReminderDto = DeadlineReminderDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeadlineReminderDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeadlineReminderDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], DeadlineReminderDto.prototype, "deadline", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['SUBMISSION', 'VERIFICATION', 'REVIEW']),
    __metadata("design:type", String)
], DeadlineReminderDto.prototype, "reminderType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeadlineReminderDto.prototype, "targetAudience", void 0);
//# sourceMappingURL=deadline-reminder.dto.js.map