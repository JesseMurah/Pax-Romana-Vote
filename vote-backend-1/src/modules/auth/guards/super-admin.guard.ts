import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { UserRoles } from "../../users/enums/user-roles.enum";


@Injectable()
export class SuperAdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const { user } = context.switchToHttp().getRequest();

        if (!user || user.role !== UserRoles.SUPER_ADMIN) {
            throw new ForbiddenException('Super Admin access required');
        }

        return true;
    }
}