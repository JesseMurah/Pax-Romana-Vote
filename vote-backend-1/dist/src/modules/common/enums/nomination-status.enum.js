"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminActions = exports.VerificationStatus = exports.NominationStatus = void 0;
var NominationStatus;
(function (NominationStatus) {
    NominationStatus["DRAFT"] = "DRAFT";
    NominationStatus["SUBMITTED"] = "SUBMITTED";
    NominationStatus["PENDING_VERIFICATION"] = "PENDING_VERIFICATION";
    NominationStatus["NOMINATOR_VERIFIED"] = "NOMINATOR_VERIFIED";
    NominationStatus["GUARANTOR_VERIFIED"] = "GUARANTOR_VERIFIED";
    NominationStatus["FULLY_VERIFIED"] = "FULLY_VERIFIED";
    NominationStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    NominationStatus["APPROVED"] = "APPROVED";
    NominationStatus["REJECTED"] = "REJECTED";
    NominationStatus["INCOMPLETE"] = "INCOMPLETE";
})(NominationStatus || (exports.NominationStatus = NominationStatus = {}));
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["PENDING"] = "PENDING";
    VerificationStatus["APPROVED"] = "APPROVED";
    VerificationStatus["REJECTED"] = "REJECTED";
    VerificationStatus["EXPIRED"] = "EXPIRED";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
var AdminActions;
(function (AdminActions) {
    AdminActions["APPROVE"] = "APPROVE";
    AdminActions["REJECT"] = "REJECT";
    AdminActions["REQUEST_CHANGES"] = "REQUEST_CHANGES";
    AdminActions["COMMENT"] = "COMMENT";
})(AdminActions || (exports.AdminActions = AdminActions = {}));
//# sourceMappingURL=nomination-status.enum.js.map