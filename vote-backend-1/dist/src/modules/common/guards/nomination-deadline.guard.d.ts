import { CanActivate, ExecutionContext } from "@nestjs/common";
import { DeadlineService } from "../utils/deadline.service";
export declare class NominationDeadlineGuard implements CanActivate {
    private deadlineService;
    constructor(deadlineService: DeadlineService);
    canActivate(context: ExecutionContext): boolean;
}
