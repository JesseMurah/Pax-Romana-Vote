import { CanActivate, ExecutionContext } from "@nestjs/common";
export declare class SuperAdminOnlyGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
