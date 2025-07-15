import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { UserRoles } from "../../users/enums/user-roles.enum";


@Injectable()
export class EcMemberGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const { user } = context.switchToHttp().getRequest();

        if (!user || (user.role !== UserRoles.SUPER_ADMIN && user.role !== UserRoles.EC_MEMBER)) {
            throw new ForbiddenException('EC Member access required');
        }

        return true;
    }
}