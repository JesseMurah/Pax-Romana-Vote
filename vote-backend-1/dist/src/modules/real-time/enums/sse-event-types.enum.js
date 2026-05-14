"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SseEventType = void 0;
var SseEventType;
(function (SseEventType) {
    SseEventType["VOTING_PROGRESS"] = "voting-progress";
    SseEventType["POSITION_UPDATE"] = "position-update";
    SseEventType["ANOMALY_ALERT"] = "anomaly-alert";
    SseEventType["RESULT_UPDATE"] = "result-update";
    SseEventType["SYSTEM_STATUS"] = "system-status";
    SseEventType["NOMINATION_UPDATE"] = "nomination-update";
    SseEventType["EC_NOTIFICATION"] = "ec-notification";
    SseEventType["DEADLINE_WARNING"] = "deadline-warning";
    SseEventType["HEARTBEAT"] = "heartbeat";
})(SseEventType || (exports.SseEventType = SseEventType = {}));
//# sourceMappingURL=sse-event-types.enum.js.map