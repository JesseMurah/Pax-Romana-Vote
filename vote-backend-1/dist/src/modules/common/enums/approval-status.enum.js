"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemStatus = exports.NotificationTypes = exports.ApprovalStatus = void 0;
var ApprovalStatus;
(function (ApprovalStatus) {
    ApprovalStatus["PENDING"] = "PENDING";
    ApprovalStatus["APPROVED"] = "APPROVED";
    ApprovalStatus["REJECTED"] = "REJECTED";
    ApprovalStatus["ABSTAIN"] = "ABSTAIN";
})(ApprovalStatus || (exports.ApprovalStatus = ApprovalStatus = {}));
var NotificationTypes;
(function (NotificationTypes) {
    NotificationTypes["SMS"] = "SMS";
    NotificationTypes["EMAIL"] = "EMAIL";
    NotificationTypes["IN_APP"] = "IN_APP";
})(NotificationTypes || (exports.NotificationTypes = NotificationTypes = {}));
var SystemStatus;
(function (SystemStatus) {
    SystemStatus["ACTIVE"] = "ACTIVE";
    SystemStatus["MAINTENANCE"] = "MAINTENANCE";
    SystemStatus["SUSPENDED"] = "SUSPENDED";
})(SystemStatus || (exports.SystemStatus = SystemStatus = {}));
//# sourceMappingURL=approval-status.enum.js.map