import { CanActivate, ExecutionContext } from "@nestjs/common";
export declare class EcMemberGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
