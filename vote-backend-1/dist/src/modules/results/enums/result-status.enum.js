"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportFormat = exports.CertificationStatus = exports.ResultStatus = void 0;
var ResultStatus;
(function (ResultStatus) {
    ResultStatus["PENDING"] = "PENDING";
    ResultStatus["COUNTING"] = "COUNTING";
    ResultStatus["PROVISIONAL"] = "PROVISIONAL";
    ResultStatus["CERTIFIED"] = "CERTIFIED";
    ResultStatus["DISPUTED"] = "DISPUTED";
})(ResultStatus || (exports.ResultStatus = ResultStatus = {}));
var CertificationStatus;
(function (CertificationStatus) {
    CertificationStatus["NOT_CERTIFIED"] = "NOT_CERTIFIED";
    CertificationStatus["PENDING_REVIEW"] = "PENDING_REVIEW";
    CertificationStatus["CERTIFIED_PROVISIONAL"] = "CERTIFIED_PROVISIONAL";
    CertificationStatus["CERTIFIED_FINAL"] = "CERTIFIED_FINAL";
})(CertificationStatus || (exports.CertificationStatus = CertificationStatus = {}));
var ExportFormat;
(function (ExportFormat) {
    ExportFormat["PDF"] = "PDF";
    ExportFormat["EXCEL"] = "EXCEL";
    ExportFormat["JSON"] = "JSON";
    ExportFormat["CSV"] = "CSV";
})(ExportFormat || (exports.ExportFormat = ExportFormat = {}));
//# sourceMappingURL=result-status.enum.js.map