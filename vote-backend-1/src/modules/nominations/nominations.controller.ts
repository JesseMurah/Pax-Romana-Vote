import {Controller, Get, Post, Body, Param, BadRequestException, Logger} from '@nestjs/common';
import { NominationService } from './services/nomination.service';
import { CreateNominationDto } from './dto/create-nomination.dto';
import {NominatorVerificationService} from "./services/nominator-verification.service";
import {GuarantorVerificationService} from "./services/guarantor-verification.service";
import {VerificationResponseDto} from "../auth/dto/auth-response.dto";

@Controller('nominations')
export class NominationController {
  private readonly logger = new Logger(NominationController.name);
  constructor(
      private readonly nominationService: NominationService,
      private nominatorVerificationService: NominatorVerificationService,
      private guarantorVerificationService: GuarantorVerificationService,
  ) {}

  async create(
      @Body() createNominationDto: CreateNominationDto,
  ) {
    this.logger.log('Received nomination request');
    try {
      const nomination = await this.nominationService.createNomination(createNominationDto);
      return nomination;
    } catch (error) {
      this.logger.error(`Failed to create nomination: ${error.message}`, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  @Get('verify/:token')
  async getVerificationData(@Param('token') token: string) {
    const verificationToken = await this.nominationService.prisma.verificationToken.findUnique({
      where: { token },
      include: {
        nominatorVerification: { include: { nomination: true } },
        guarantorVerification: { include: { nomination: true } },
      },
    });

    if (!verificationToken || verificationToken.used || new Date() > verificationToken.expiresAt) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    const nomination = verificationToken.nominatorVerification?.nomination || verificationToken.guarantorVerification?.nomination;
    if (!nomination) {
      throw new BadRequestException('No associated nomination found');
    }

    return {
      nomineeName: nomination.nomineeName,
      position: nomination.nomineePosition,
      expiresAt: verificationToken.expiresAt,
    };
  }

  @Post('verify/:token/confirm')
  async confirmVerification(@Param('token') token: string, @Body('comments') comments?: string) {
    const verificationToken = await this.nominationService.prisma.verificationToken.findUnique({
      where: { token },
      include: {
        nominatorVerification: true,
        guarantorVerification: true,
      },
    });

    if (!verificationToken || verificationToken.used || new Date() > verificationToken.expiresAt) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    const updateData = { status: 'APPROVED', comments, verifiedAt: new Date() };
    if (verificationToken.nominatorVerification) {
      await this.nominationService.prisma.nominatorVerification.update({
        where: { id: verificationToken.nominatorVerification.id },
        data: updateData,
      });
    } else if (verificationToken.guarantorVerification) {
      await this.nominationService.prisma.guarantorVerification.update({
        where: { id: verificationToken.guarantorVerification.id },
        data: updateData,
      });
    }

    await this.nominationService.prisma.verificationToken.update({
      where: { token },
      data: { used: true },
    });

    // Check if all verifications are complete
    const nomination = await this.nominationService.prisma.nomination.findUnique({
      where: { id: verificationToken.nominatorVerification?.nominationId || verificationToken.guarantorVerification?.nominationId },
      include: { nominatorVerification: true, guarantorVerifications: true },
    });

    if (
        nomination?.nominatorVerification?.status === 'APPROVED' &&
        nomination?.guarantorVerifications.every((g) => g.status === 'APPROVED')
    ) {
      await this.nominationService.notificationService.notifyNominationVerificationComplete({
        nominee: {
          name: nomination.nomineeName,
          email: nomination.nomineeEmail,
          phoneNumber: nomination.nomineeContact,
        },
        position: nomination.nomineePosition,
        createdAt: nomination.createdAt,
      });
    }

    return { message: 'Verification successful' };
  }

  @Post('verify/:token/decline')
  async declineVerification(@Param('token') token: string, @Body('comments') comments?: string) {
    const verificationToken = await this.nominationService.prisma.verificationToken.findUnique({
      where: {token},
      include: {
        nominatorVerification: true,
        guarantorVerification: true,
      },
    });

    if (!verificationToken || verificationToken.used || new Date() > verificationToken.expiresAt) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    const updateData = {status: 'REJECTED', comments, declinedAt: new Date()};
    if (verificationToken.nominatorVerification) {
      await this.nominationService.prisma.nominatorVerification.update({
        where: {id: verificationToken.nominatorVerification.id},
        data: updateData,
      });
    } else if (verificationToken.guarantorVerification) {
      await this.nominationService.prisma.guarantorVerification.update({
        where: {id: verificationToken.guarantorVerification.id},
        data: updateData,
      });
    }

    await this.nominationService.prisma.verificationToken.update({
      where: {token},
      data: {used: true},
    });

    return {message: 'Verification declined'};
  }
  @Get('verify/nominator/:token')
  async getNominatorVerificationDetails(@Param('token') token: string) {
    return this.nominatorVerificationService.getVerificationDetails(token);
  }

  @Post('verify/nominator')
  async verifyNominator(@Body() verificationDto: VerificationResponseDto) {
    //@ts-ignore
    return this.nominatorVerificationService.verifyNominator(verificationDto);
  }

  // Guarantor verification endpoints
  @Get('verify/guarantor/:token')
  async getGuarantorVerificationDetails(@Param('token') token: string) {
    return this.guarantorVerificationService.getVerificationDetails(token);
  }

  @Post('verify/guarantor')
  async verifyGuarantor(@Body() verificationDto: VerificationResponseDto) {
    return this.guarantorVerificationService.verifyGuarantor(verificationDto);
  }
}