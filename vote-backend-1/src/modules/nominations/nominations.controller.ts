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

    // EMAIL SENDING REMOVED - Log completion for manual notification
    if (
        nomination?.nominatorVerification?.status === 'APPROVED' &&
        nomination?.guarantorVerifications.every((g) => g.status === 'APPROVED')
    ) {
      console.log('=== NOMINATION VERIFICATION COMPLETE - MANUAL NOTIFICATION NEEDED ===');
      console.log('Nominee Name:', nomination.nomineeName);
      console.log('Nominee Email:', nomination.nomineeEmail);
      console.log('Nominee Phone:', nomination.nomineeContact);
      console.log('Position:', nomination.nomineePosition);
      console.log('Created At:', nomination.createdAt);
      console.log('================================================================');

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
      include: {
        nominatorVerification: true,
        guarantorVerification: true,
      },
    });

    if (!verificationToken || verificationToken.used || new Date() > verificationToken.expiresAt) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    const updateData = {status: 'REJECTED', comments, declinedAt: new Date()};
    let nominationId: string | undefined;

    if (verificationToken.nominatorVerification) {
      await this.nominationService.prisma.nominatorVerification.update({
        where: {id: verificationToken.nominatorVerification.id},
        data: updateData,
      });
      nominationId = verificationToken.nominatorVerification.nominationId;
    } else if (verificationToken.guarantorVerification) {
      await this.nominationService.prisma.guarantorVerification.update({
        where: {id: verificationToken.guarantorVerification.id},
        data: updateData,
      });
      nominationId = verificationToken.guarantorVerification.nominationId;
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

      console.log('=== VERIFICATION DECLINED - MANUAL NOTIFICATION NEEDED ===');
      console.log('Nominee Name:', nomination?.nomineeName);
      console.log('Nominee Email:', nomination?.nomineeEmail);
      console.log('Position:', nomination?.nomineePosition);
      console.log('Declined Comments:', comments);
      console.log('========================================================');
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