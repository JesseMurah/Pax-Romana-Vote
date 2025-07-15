"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExactlyTwoGuarantorsConstraint = void 0;
class ExactlyTwoGuarantorsConstraint {
    validate(guarantors, args) {
        return Array.isArray(guarantors) && guarantors.length === 2;
    }
    defaultMessage(args) {
        return 'Exactly two guarantors are required';
    }
}
exports.ExactlyTwoGuarantorsConstraint = ExactlyTwoGuarantorsConstraint;
//# sourceMappingURL=two-guarantors.validator.js.map