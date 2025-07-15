import {Global, Module} from "@nestjs/common";
import { DeadlineService } from "./utils/deadline.service";
import { EcConsensusService } from "./utils/ec-consensus.service";
import { PhoneValidationUtil } from "./utils/phone-validation.util";
import { NominationDeadlineGuard } from "./guards/nomination-deadline.guard";
import { EcConsensusGuard } from "./guards/ec-consensus.guard";
import { ExactlyTwoGuarantorsConstraint } from "./validators/exactly-two-guarantors.validator";
import { IsKnustPhoneConstraint } from "./validators/knust-phone.validator";
import { DbModule } from 'db/db.module';

@Global()
@Module({
    imports: [DbModule],
    providers: [
        DeadlineService,
        EcConsensusService,
        PhoneValidationUtil,
        NominationDeadlineGuard,
        EcConsensusGuard,
        ExactlyTwoGuarantorsConstraint,
        IsKnustPhoneConstraint,
    ],
    exports: [
        DeadlineService,
        EcConsensusService,
        PhoneValidationUtil,
        NominationDeadlineGuard,
        EcConsensusGuard,
        ExactlyTwoGuarantorsConstraint,
        IsKnustPhoneConstraint,
    ],
})
export class CommonModule {}