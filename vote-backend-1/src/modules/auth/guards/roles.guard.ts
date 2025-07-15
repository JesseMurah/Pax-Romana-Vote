import { Reflector } from "@nestjs/core";
import {CanActivate, ExecutionContext, ForbiddenException, Injectable} from "@nestjs/common";
import {UserRoles} from "../../users/enums/user-roles.enum";


@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {
        console.log('Instantiating RolesGuard');
    }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRoles[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        const hasRole = requiredRoles.some((role) => user.role === role);

        if (!hasRole) {
            throw new ForbiddenException('Insufficient permissions');
        }

        return true;
    }
}