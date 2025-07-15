import { BadRequestException, CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import {DeadlineService} from "../utils/deadline.service";


@Injectable()
export class NominationDeadlineGuard implements CanActivate {
    constructor(private deadlineService: DeadlineService) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const { isOpen, message } = this.deadlineService.getNominationStatus();

        if (!isOpen) {
            throw new BadRequestException(message);
        }

        // Add deadline info to request for controllers to use
        request.deadlineInfo = {
            timeRemaining: this.deadlineService.getTimeRemaining(),
            isGracePeriod: this.deadlineService.isInGracePeriod(),
        };

        return true;
    }
}