import { applyDecorators, UseGuards } from "@nestjs/common";
import { EcConsensusGuard } from "../guards/ec-consensus.guard";
import { UserRoles } from "../../users/enums/user-roles.enum";
import { Roles } from "../../auth/decorators/roles.decorator";

export function RequireEcApproval() {
    return applyDecorators(
        Roles(UserRoles.EC_MEMBER, UserRoles.SUPER_ADMIN),
        UseGuards(EcConsensusGuard),
    );
}