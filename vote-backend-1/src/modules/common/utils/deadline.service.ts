import { DEADLINE_MESSAGES, NOMINATION_DEADLINES } from "../constants/nomination-deadlines.constant";
import { Injectable } from "@nestjs/common";


@Injectable()
export class DeadlineService {
    isNominationOpen(): boolean {
        const now = new Date();
        const launchDate = new Date(NOMINATION_DEADLINES.LAUNCH_DATE);
        const graceEnd = new Date(NOMINATION_DEADLINES.GRACE_PERIOD_END);

        return now >= launchDate && now <= graceEnd;
    }

    isInGracePeriod(): boolean {
        const now = new Date();
        const deadline = new Date(NOMINATION_DEADLINES.SUBMISSION_DEADLINE);
        const graceEnd = new Date(NOMINATION_DEADLINES.GRACE_PERIOD_END);

        return now > deadline && now <= graceEnd;
    }

    getNominationStatus(): { isOpen: boolean; message: string; phase: string } {
        const now = new Date();
        const launchDate = new Date(NOMINATION_DEADLINES.LAUNCH_DATE);
        const deadline = new Date(NOMINATION_DEADLINES.SUBMISSION_DEADLINE);
        const graceEnd = new Date(NOMINATION_DEADLINES.GRACE_PERIOD_END);

        if (now < launchDate) {
            return { isOpen: false, message: DEADLINE_MESSAGES.BEFORE_LAUNCH, phase: 'BEFORE_LAUNCH' };
        }

        if (now <= deadline) {
            return { isOpen: true, message: DEADLINE_MESSAGES.ACTIVE, phase: 'ACTIVE' };
        }

        if (now <= graceEnd) {
            return { isOpen: true, message: DEADLINE_MESSAGES.GRACE_PERIOD, phase: 'GRACE_PERIOD' };
        }

        return { isOpen: false, message: DEADLINE_MESSAGES.CLOSED, phase: 'CLOSED' };
    }

    getTimeRemaining(): { days: number; hours: number; minutes: number; seconds: number } {
        const now = new Date();
        const deadline = new Date(NOMINATION_DEADLINES.SUBMISSION_DEADLINE);
        const graceEnd = new Date(NOMINATION_DEADLINES.GRACE_PERIOD_END);

        // If in grace period, show time to grace end
        const targetDate = now > deadline ? graceEnd : deadline;
        const diff = targetDate.getTime() - now.getTime();

        if (diff <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return { days, hours, minutes, seconds };
    }

    getAllDeadlines() {
        return NOMINATION_DEADLINES;
    }
}