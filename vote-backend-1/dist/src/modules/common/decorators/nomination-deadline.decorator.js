"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckNominationDeadline = CheckNominationDeadline;
const common_1 = require("@nestjs/common");
const nomination_deadline_guard_1 = require("../guards/nomination-deadline.guard");
function CheckNominationDeadline() {
    return (0, common_1.applyDecorators)((0, common_1.UseGuards)(nomination_deadline_guard_1.NominationDeadlineGuard));
}
//# sourceMappingURL=nomination-deadline.decorator.js.map