import {BadRequestException, Body, Controller, Get, Logger, Param, Post} from '@nestjs/common';
import {NominationService} from './services/nomination.service';
import {CreateNominationDto} from './dto/create-nomination.dto';
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
      return await this.nominationService.createNomination(createNominationDto);
    } catch (error) {
      this.logger.error(`Failed to create nomination: ${error.message}`, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  @Get('verify/:token')
  async getVerificationData(@Param('token') token: string) {
    const verificationToken = await this.nominationService.prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken || verificationToken.used || new Date() > verificationToken.expiresAt) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    let nomination: { nomineeName: string; nomineePosition: any } | null = null;
    if (verificationToken.verificationType === 'NOMINATOR') {
      const nv = await this.nominationService.prisma.nominatorVerification.findUnique({
        where: { id: verificationToken.verificationId },
        include: { nomination: true },
      });
      nomination = nv?.nomination ?? null;
    } else {
      const gv = await this.nominationService.prisma.guarantorVerification.findUnique({
        where: { id: verificationToken.verificationId },
        include: { nomination: true },
      });
      nomination = gv?.nomination ?? null;
    }

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
    });

    if (!verificationToken || verificationToken.used || new Date() > verificationToken.expiresAt) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    const updateData = { status: 'APPROVED', comments, verifiedAt: new Date() };
    let nominationId: string | undefined;

    if (verificationToken.verificationType === 'NOMINATOR') {
      const nv = await this.nominationService.prisma.nominatorVerification.findUnique({
        where: { id: verificationToken.verificationId },
      });
      if (nv) {
        await this.nominationService.prisma.nominatorVerification.update({
          where: { id: nv.id },
          data: updateData,
        });
        nominationId = nv.nominationId;
      }
    } else {
      const gv = await this.nominationService.prisma.guarantorVerification.findUnique({
        where: { id: verificationToken.verificationId },
      });
      if (gv) {
        await this.nominationService.prisma.guarantorVerification.update({
          where: { id: gv.id },
          data: updateData,
        });
        nominationId = gv.nominationId;
      }
    }

    await this.nominationService.prisma.verificationToken.update({
      where: { token },
      data: { used: true },
    });

    // Check if all verifications are complete
    const nomination = await this.nominationService.prisma.nomination.findUnique({
      where: { id: nominationId },
      include: { nominatorVerification: true, guarantorVerifications: true },
    });

    // EMAIL SENDING REMOVED - Log completion for manual notification
    if (
        nomination?.nominatorVerification?.status === 'APPROVED' &&
        nomination?.guarantorVerifications.every((g) => g.status === 'APPROVED')
    ) {
      this.logger.warn('Nomination verification complete — manual notification required', {
        nomineeName: nomination.nomineeName,
        nomineeEmail: nomination.nomineeEmail,
        nomineeContact: nomination.nomineeContact,
        position: nomination.nomineePosition,
        createdAt: nomination.createdAt,
      });

      // You can also update nomination status to indicate verification is complete
      await this.nominationService.prisma.nomination.update({
        where: { id: nomination.id },
        data: {
          // Add a field to track verification completion if needed
          // verificationCompleted: true,
          // verificationCompletedAt: new Date(),
        },
      });
    }

    return { message: 'Verification successful' };
  }

  @Post('verify/:token/decline')
  async declineVerification(@Param('token') token: string, @Body('comments') comments?: string) {
    const verificationToken = await this.nominationService.prisma.verificationToken.findUnique({
      where: {token},
    });

    if (!verificationToken || verificationToken.used || new Date() > verificationToken.expiresAt) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    const updateData = {status: 'REJECTED', comments, declinedAt: new Date()};
    let nominationId: string | undefined;

    if (verificationToken.verificationType === 'NOMINATOR') {
      const nv = await this.nominationService.prisma.nominatorVerification.findUnique({
        where: { id: verificationToken.verificationId },
      });
      if (nv) {
        await this.nominationService.prisma.nominatorVerification.update({
          where: {id: nv.id},
          data: updateData,
        });
        nominationId = nv.nominationId;
      }
    } else {
      const gv = await this.nominationService.prisma.guarantorVerification.findUnique({
        where: { id: verificationToken.verificationId },
      });
      if (gv) {
        await this.nominationService.prisma.guarantorVerification.update({
          where: {id: gv.id},
          data: updateData,
        });
        nominationId = gv.nominationId;
      }
    }

    await this.nominationService.prisma.verificationToken.update({
      where: {token},
      data: {used: true},
    });

    // Log declined verification for manual follow-up
    if (nominationId) {
      const nomination = await this.nominationService.prisma.nomination.findUnique({
        where: { id: nominationId },
        select: {
          nomineeName: true,
          nomineeEmail: true,
          nomineeContact: true,
          nomineePosition: true,
        },
      });

      this.logger.warn('Verification declined — manual notification required', {
        nomineeName: nomination?.nomineeName,
        nomineeEmail: nomination?.nomineeEmail,
        position: nomination?.nomineePosition,
        declinedComments: comments,
      });
    }

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

  // Helper endpoint to get all completed nominations that need manual notification
  @Get('completed-verifications')
  async getCompletedVerifications() {
    const completedNominations = await this.nominationService.prisma.nomination.findMany({
      where: {
        nominatorVerification: {
          status: 'APPROVED',
        },
        guarantorVerifications: {
          every: {
            status: 'APPROVED',
          },
        },
      },
      include: {
        nominatorVerification: true,
        guarantorVerifications: true,
      },
    });

    return completedNominations.map(nomination => ({
      id: nomination.id,
      nomineeName: nomination.nomineeName,
      nomineeEmail: nomination.nomineeEmail,
      nomineeContact: nomination.nomineeContact,
      position: nomination.nomineePosition,
      createdAt: nomination.createdAt,
      verificationStatus: 'COMPLETED',
    }));
  }

  // Helper endpoint to get all pending verifications for manual email sending
  @Get('pending-verifications')
  async getPendingVerifications() {
    return await this.nominationService.getPendingVerifications();
  }
}