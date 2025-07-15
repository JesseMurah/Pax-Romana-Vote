import { CanActivate, ExecutionContext } from "@nestjs/common";
export declare class EcMemberAccessGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
