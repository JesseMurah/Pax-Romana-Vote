"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExactlyTwoGuarantorsConstraint = void 0;
const class_validator_1 = require("class-validator");
let ExactlyTwoGuarantorsConstraint = class ExactlyTwoGuarantorsConstraint {
    validate(guarantors, args) {
        if (!Array.isArray(guarantors))
            return false;
        if (guarantors.length !== 2)
            return false;
        return guarantors.every(guarantor => guarantor.name &&
            guarantor.phoneNumber &&
            guarantor.email &&
            guarantor.name.length >= 2 &&
            this.isValidPhoneNumber(guarantor.phoneNumber) &&
            this.isValidEmail(guarantor.email));
    }
    isValidPhoneNumber(phone) {
        const ghanaPhoneRegex = /^(\+233|0)(2[0-9]|5[0-9]|2[4-9]|3[0-9])[0-9]{7}$/;
        return ghanaPhoneRegex.test(phone);
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    defaultMessage(args) {
        return 'Exactly two guarantors with valid name, phone number, and email are required';
    }
};
exports.ExactlyTwoGuarantorsConstraint = ExactlyTwoGuarantorsConstraint;
exports.ExactlyTwoGuarantorsConstraint = ExactlyTwoGuarantorsConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'exactlyTwoGuarantors', async: false })
], ExactlyTwoGuarantorsConstraint);
//# sourceMappingURL=exactly-two-guarantors.validator.js.map