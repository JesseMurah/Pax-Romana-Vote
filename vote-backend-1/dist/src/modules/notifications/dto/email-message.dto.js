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
exports.BulkEmailDto = exports.EmailMessageDto = void 0;
const class_validator_1 = require("class-validator");
class EmailMessageDto {
    to;
    subject;
    text;
    html;
    template;
    templateData;
}
exports.EmailMessageDto = EmailMessageDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], EmailMessageDto.prototype, "to", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmailMessageDto.prototype, "subject", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EmailMessageDto.prototype, "text", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EmailMessageDto.prototype, "html", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EmailMessageDto.prototype, "template", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], EmailMessageDto.prototype, "templateData", void 0);
class BulkEmailDto {
    recipients;
    subject;
    template;
    templateData;
}
exports.BulkEmailDto = BulkEmailDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { each: true }),
    __metadata("design:type", Array)
], BulkEmailDto.prototype, "recipients", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkEmailDto.prototype, "subject", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BulkEmailDto.prototype, "template", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], BulkEmailDto.prototype, "templateData", void 0);
//# sourceMappingURL=email-message.dto.js.map