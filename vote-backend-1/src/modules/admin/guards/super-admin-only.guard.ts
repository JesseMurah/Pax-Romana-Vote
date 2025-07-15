import {CanActivate, ExecutionContext, ForbiddenException, Injectable} from "@nestjs/common";
import {UserRoles} from "../../users/enums/user-roles.enum";


@Injectable()
export class SuperAdminOnlyGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || user.role !== UserRoles.SUPER_ADMIN) {
            throw new ForbiddenException('Super Admin access required');
        }

        return true;
    }
}