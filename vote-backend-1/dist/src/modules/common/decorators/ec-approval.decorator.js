"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireEcApproval = RequireEcApproval;
const common_1 = require("@nestjs/common");
const ec_consensus_guard_1 = require("../guards/ec-consensus.guard");
const user_roles_enum_1 = require("../../users/enums/user-roles.enum");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
function RequireEcApproval() {
    return (0, common_1.applyDecorators)((0, roles_decorator_1.Roles)(user_roles_enum_1.UserRoles.EC_MEMBER, user_roles_enum_1.UserRoles.SUPER_ADMIN), (0, common_1.UseGuards)(ec_consensus_guard_1.EcConsensusGuard));
}
//# sourceMappingURL=ec-approval.decorator.js.map