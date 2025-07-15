import {Body, Controller, Get, Param, Post} from "@nestjs/common";
import { GuarantorVerificationService } from "../services/guarantor-verification.service";
import { VerificationResponseDto } from "../../auth/dto/auth-response.dto";


@Controller('nominations/verify')
export class GuarantorVerificationController {
    constructor(private guarantorVerificationService: GuarantorVerificationService) {
        console.log('Instantiating Nominations Controller')
    }

    @Get(':token')
    async getVerificationDetails(@Param('token') token: string) {
        return this.guarantorVerificationService.getVerificationDetails(token);
    }

    @Post('guarantor')
    async verifyGuarantor(@Body() verificationDto: VerificationResponseDto) {
        return this.guarantorVerificationService.verifyGuarantor(verificationDto);
    }
}