"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsKnustPhoneConstraint = void 0;
exports.IsKnustPhone = IsKnustPhone;
const class_validator_1 = require("class-validator");
let IsKnustPhoneConstraint = class IsKnustPhoneConstraint {
    validate(phoneNumber, args) {
        if (!phoneNumber)
            return false;
        const ghanaPhoneRegex = /^(\+233|0)(2[0-9]|5[0-9]|2[4-9]|3[0-9])[0-9]{7}$/;
        return ghanaPhoneRegex.test(phoneNumber);
    }
    defaultMessage(args) {
        return 'Phone number must be a valid Ghana phone number (e.g., +233241234567 or 0241234567)';
    }
};
exports.IsKnustPhoneConstraint = IsKnustPhoneConstraint;
exports.IsKnustPhoneConstraint = IsKnustPhoneConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isKnustPhone', async: false })
], IsKnustPhoneConstraint);
function IsKnustPhone(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsKnustPhoneConstraint,
        });
    };
}
//# sourceMappingURL=knust-phone.validator.js.map