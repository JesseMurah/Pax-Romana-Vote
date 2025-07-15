"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateTwoGuarantors = ValidateTwoGuarantors;
const class_validator_1 = require("class-validator");
function ValidateTwoGuarantors(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'validateTwoGuarantors',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value, args) {
                    if (!Array.isArray(value))
                        return false;
                    if (value.length !== 2)
                        return false;
                    return value.every(guarantor => guarantor.name &&
                        guarantor.phoneNumber &&
                        guarantor.email);
                },
                defaultMessage(args) {
                    return 'Exactly two guarantors with complete information are required';
                },
            },
        });
    };
}
//# sourceMappingURL=validate-guarantors.decorator.js.map