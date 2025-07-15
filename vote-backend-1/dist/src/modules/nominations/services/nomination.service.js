"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NominationService = void 0;
const common_1 = require("@nestjs/common");
const db_1 = require("../../../../db");
const deadline_service_1 = require("../../common/utils/deadline.service");
const index_1 = require("@prisma/client/index");
const uuid_1 = require("uuid");
const users_service_1 = require("../../users/users.service");
const cloudinary_service_1 = require("../../file-upload/services/cloudinary.service");
function mapPositionToEnum(position) {
    const positionMap = {
        'President': index_1.Candidate_Position.PRESIDENT,
        'Vice President': index_1.Candidate_Position.VICE_PRESIDENT,
        'General Secretary': index_1.Candidate_Position.GEN_SECRETARY,
        'Financial Secretary': index_1.Candidate_Position.FINANCIAL_SECRETARY,
        'Organizing Secretary Main': index_1.Candidate_Position.ORGANIZING_SECRETARY_MAIN,
        'Organizing Secretary Assistant': index_1.Candidate_Position.ORGANIZING_SECRETARY_ASST,
        'PRO Main': index_1.Candidate_Position.PRO_MAIN,
        'PRO Assistant': index_1.Candidate_Position.PRO_ASSISTANT,
        'Women Commissioner': index_1.Candidate_Position.WOMEN_COMMISSIONER,
    };
    return positionMap[position] || index_1.Candidate_Position.PRESIDENT;
}
let NominationService = class NominationService {
    prisma;
    deadlineService;
    usersService;
    cloudinaryService;
    constructor(prisma, deadlineService, usersService, cloudinaryService) {
        this.prisma = prisma;
        this.deadlineService = deadlineService;
        this.usersService = usersService;
        this.cloudinaryService = cloudinaryService;
        console.log('Instantiating NominationService');
    }
    async createNomination(createNominationDto, file, userId) {
        if (!this.deadlineService.isNominationOpen()) {
            throw new common_1.BadRequestException('Nomination period has ended');
        }
        let user = await this.usersService.findByEmail(createNominationDto.aspirantEmail);
        if (!user) {
            user = await this.usersService.create({
                name: createNominationDto.aspirantName,
                email: createNominationDto.aspirantEmail,
                phone: createNominationDto.aspirantPhoneNumber,
                role: index_1.UserRole.ASPIRANT,
                programme: createNominationDto.nomineeProgramme,
                level: createNominationDto.nomineeLevel,
                subgroup: createNominationDto.nomineeSubgroups[0] || 'Unknown',
                college: createNominationDto.nomineeCollege,
            });
        }
        if (userId && user.id !== userId) {
            throw new common_1.BadRequestException('Authenticated user does not match aspirant');
        }
        const nomineePosition = mapPositionToEnum(createNominationDto.position);
        const existingNomination = await this.prisma.nomination.findFirst({
            where: {
                aspirantId: user.id,
                nomineePosition: nomineePosition,
                status: {
                    notIn: [index_1.NominationStatus.REJECTED],
                },
            },
        });
        if (existingNomination) {
            throw new common_1.BadRequestException('You already have a nomination for this position');
        }
        let photoUrl;
        if (file) {
            try {
                const uploadResult = await this.cloudinaryService.uploadCandidatePhoto(file, user.id);
                photoUrl = uploadResult.secure_url;
            }
            catch (error) {
                throw new common_1.BadRequestException('Failed to upload candidate photo');
            }
        }
        else if (!createNominationDto.photoUrl) {
            throw new common_1.BadRequestException('Candidate photo is required');
        }
        else {
            photoUrl = createNominationDto.photoUrl;
        }
        const nomination = await this.prisma.nomination.create({
            data: {
                aspirantId: user.id,
                nomineeName: createNominationDto.aspirantName,
                nomineeEmail: createNominationDto.aspirantEmail,
                nomineeContact: createNominationDto.aspirantPhoneNumber,
                nomineePosition: nomineePosition,
                photoUrl,
                status: index_1.NominationStatus.PENDING,
                nomineeCollege: createNominationDto.nomineeCollege,
                nomineeDepartment: createNominationDto.nomineeDepartment,
                nomineeDateOfBirth: new Date(createNominationDto.nomineeDateOfBirth),
                nomineeHostel: createNominationDto.nomineeHostel,
                nomineeRoom: createNominationDto.nomineeRoom,
                nomineeSex: createNominationDto.nomineeSex,
                nomineeCwa: createNominationDto.nomineeCwa,
                nomineeProgramme: createNominationDto.nomineeProgramme,
                nomineeLevel: createNominationDto.nomineeLevel,
                nomineeParish: createNominationDto.nomineeParish,
                nomineeNationality: createNominationDto.nomineeNationality,
                nomineeRegion: createNominationDto.nomineeRegion,
                nomineeSubgroups: createNominationDto.nomineeSubgroups,
                nomineeEducation: createNominationDto.nomineeEducation,
                hasLeadershipPosition: createNominationDto.hasLeadershipPosition,
                leadershipPositions: createNominationDto.leadershipPositions,
                hasServedCommittee: createNominationDto.hasServedCommittee,
                committees: createNominationDto.committees,
                skills: createNominationDto.skills,
                visionForOffice: createNominationDto.visionForOffice,
                knowledgeAboutOffice: createNominationDto.knowledgeAboutOffice,
                nominatorVerification: {
                    create: {
                        name: createNominationDto.nominatorVerification.name,
                        email: createNominationDto.nominatorVerification.email,
                        contact: createNominationDto.nominatorVerification.contact,
                        programme: createNominationDto.nominatorVerification.programme,
                        level: createNominationDto.nominatorVerification.level,
                        subgroup: createNominationDto.nominatorVerification.subgroup,
                        status: 'PENDING',
                    },
                },
                guarantorVerifications: {
                    createMany: {
                        data: createNominationDto.guarantorVerifications.map((guarantor) => ({
                            name: guarantor.name,
                            email: guarantor.email,
                            contact: guarantor.contact,
                            programme: guarantor.programme,
                            subgroup: guarantor.subgroup,
                            status: 'PENDING',
                        })),
                    },
                },
            },
            include: {
                nominatorVerification: true,
                guarantorVerifications: true,
            },
        });
        const nominatorToken = (0, uuid_1.v4)();
        const guarantorTokens = createNominationDto.guarantorVerifications.map(() => (0, uuid_1.v4)());
        await this.prisma.verificationToken.create({
            data: {
                token: nominatorToken,
                type: 'NOMINATOR_VERIFICATION',
                email: nomination.nominatorVerification.email,
                expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
                nominatorVerificationId: nomination.nominatorVerification.id,
            },
        });
        await this.prisma.verificationToken.createMany({
            data: guarantorTokens.map((token, index) => ({
                token,
                type: 'GUARANTOR_VERIFICATION',
                email: nomination.guarantorVerifications[index].email,
                expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
                guarantorVerificationId: nomination.guarantorVerifications[index].id,
            })),
        });
        console.log('=== NOMINATION CREATED - MANUAL EMAIL NEEDED ===');
        console.log('Nominator Email:', nomination.nominatorVerification.email);
        console.log('Nominator Token:', nominatorToken);
        console.log('Guarantor Emails and Tokens:');
        nomination.guarantorVerifications.forEach((guarantor, index) => {
            console.log(`  - ${guarantor.email}: ${guarantorTokens[index]}`);
        });
        console.log('===============================================');
        return nomination;
    }
    async getPendingVerifications() {
        const pendingTokens = await this.prisma.verificationToken.findMany({
            where: {
                expiresAt: {
                    gt: new Date(),
                },
            },
            include: {
                nominatorVerification: {
                    include: {
                        nomination: {
                            select: {
                                nomineeName: true,
                                nomineePosition: true,
                            },
                        },
                    },
                },
                guarantorVerification: {
                    include: {
                        nomination: {
                            select: {
                                nomineeName: true,
                                nomineePosition: true,
                            },
                        },
                    },
                },
            },
        });
        return pendingTokens;
    }
    async findAll(filters) {
        return this.prisma.nomination.findMany({
            where: {
                ...(filters?.status && { status: filters.status }),
                ...(filters?.position && { position: filters.position }),
                ...(filters?.aspirantId && { aspirantId: filters.aspirantId }),
            },
            include: {
                nominator: true,
                guarantors: true,
                ecVotes: {
                    include: {
                        ecMember: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id) {
        const nomination = await this.prisma.nomination.findUnique({
            where: { id },
            include: {
                nominator: true,
                guarantors: true,
                ecVotes: {
                    include: {
                        ecMember: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        if (!nomination) {
            throw new common_1.NotFoundException('Nomination not found');
        }
        return nomination;
    }
    async updateStatus(id, status, reason) {
        return this.prisma.nomination.update({
            where: { id },
            data: {
                status,
                ...(reason && { rejectionReason: reason }),
                ...(status === index_1.NominationStatus.APPROVED && { approvedAt: new Date() }),
                ...(status === index_1.NominationStatus.REJECTED && { rejectedAt: new Date() }),
            },
        });
    }
    async getNominationsByPosition(position) {
        return this.prisma.nomination.findMany({
            where: {
                position,
                status: {
                    in: [index_1.NominationStatus.APPROVED, index_1.NominationStatus.UNDER_REVIEW],
                },
            },
            include: {
                nominator: true,
                guarantors: true,
            },
        });
    }
    async getStatistics() {
        const total = await this.prisma.nomination.count();
        const approved = await this.prisma.nomination.count({
            where: { status: index_1.NominationStatus.APPROVED },
        });
        const pending = await this.prisma.nomination.count({
            where: { status: index_1.NominationStatus.UNDER_REVIEW },
        });
        const rejected = await this.prisma.nomination.count({
            where: { status: index_1.NominationStatus.REJECTED },
        });
        return {
            total,
            approved,
            pending,
            rejected,
            timeRemaining: this.deadlineService.getTimeRemaining(),
        };
    }
};
exports.NominationService = NominationService;
exports.NominationService = NominationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_1.PrismaService,
        deadline_service_1.DeadlineService,
        users_service_1.UsersService,
        cloudinary_service_1.CloudinaryService])
], NominationService);
//# sourceMappingURL=nomination.service.js.map