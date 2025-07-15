import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { UserRoles } from "../../users/enums/user-roles.enum";


@Injectable()
export class EcMemberAccessGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        const allowedRoles = [UserRoles.SUPER_ADMIN, UserRoles.EC_MEMBER];

        if (!user || !allowedRoles.includes(user.role)) {
            throw new ForbiddenException('EC Member access required');
        }

        return true;

    }
}