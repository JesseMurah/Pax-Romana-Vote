import { applyDecorators, UseGuards } from "@nestjs/common";
import { NominationDeadlineGuard } from "../guards/nomination-deadline.guard";

export function CheckNominationDeadline() {
    return applyDecorators(
        UseGuards(NominationDeadlineGuard),
    );
}