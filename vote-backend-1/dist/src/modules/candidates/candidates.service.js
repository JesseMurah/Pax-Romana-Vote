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
exports.CandidatesService = void 0;
const common_1 = require("@nestjs/common");
const db_1 = require("../../../db");
const cache_service_1 = require("../caches/cache.service");
const supabase_1 = require("../supabase");
let CandidatesService = class CandidatesService {
    prisma;
    cacheService;
    supabaseService;
    constructor(prisma, cacheService, supabaseService) {
        this.prisma = prisma;
        this.cacheService = cacheService;
        this.supabaseService = supabaseService;
    }
    async createCandidate(createCandidateDto, nominationId) {
        await this.validateCandidateNumber(createCandidateDto.candidateNumber);
        const nomination = await this.prisma.nomination.findUnique({
            where: { id: nominationId, status: 'APPROVED' }
        });
        if (!nomination) {
            throw new common_1.NotFoundException('Approved nomination not found');
        }
        const existingCandidate = await this.prisma.candidate.findUnique({
            where: { nominationId }
        });
        if (existingCandidate) {
            throw new common_1.ConflictException('Candidate already exists for this nomination');
        }
        const candidate = await this.prisma.candidate.create({
            data: {
                ...createCandidateDto,
                nominationId,
                displayOrder: createCandidateDto.displayOrder || 0,
            },
        });
        await this.clearCandidatesCache();
        return this.mapToResponseDto(candidate);
    }
    async getAllCandidates() {
        const cached = await this.cacheService.getCandidates();
        if (cached) {
            return cached;
        }
        const candidates = await this.prisma.candidate.findMany({
            orderBy: [
                { position: 'asc' },
                { displayOrder: 'asc' },
                { candidateNumber: 'asc' }
            ],
            include: {
                nomination: {
                    select: {
                        nomineeName: true,
                        nomineeEmail: true,
                    }
                }
            }
        });
        const mappedCandidates = candidates.map(this.mapToResponseDto);
        await this.cacheService.setCandidates(mappedCandidates);
        return mappedCandidates;
    }
    async getCandidateById(id) {
        const candidate = await this.prisma.candidate.findUnique({
            where: { id },
            include: {
                nomination: {
                    select: {
                        nomineeName: true,
                        nomineeEmail: true,
                    }
                }
            }
        });
        if (!candidate) {
            throw new common_1.NotFoundException('Candidate not found');
        }
        return this.mapToResponseDto(candidate);
    }
    async getCandidatesByPosition(position) {
        const candidates = await this.prisma.candidate.findMany({
            where: {
                position,
                isActive: true
            },
            orderBy: [
                { displayOrder: 'asc' },
                { candidateNumber: 'asc' }
            ],
        });
        return candidates.map(this.mapToResponseDto);
    }
    async updateCandidate(id, updateCandidateDto) {
        await this.getCandidateById(id);
        if (updateCandidateDto.candidateNumber) {
            await this.validateCandidateNumber(updateCandidateDto.candidateNumber, id);
        }
        const updatedCandidate = await this.prisma.candidate.update({
            where: { id },
            data: updateCandidateDto,
        });
        await this.clearCandidatesCache();
        return this.mapToResponseDto(updatedCandidate);
    }
    async deleteCandidate(id) {
        await this.getCandidateById(id);
        const candidate = await this.prisma.candidate.findUnique({
            where: { id },
            select: { photoPublicId: true }
        });
        if (candidate?.photoPublicId) {
            await this.supabaseService.deleteFile(candidate.photoPublicId);
        }
        await this.prisma.candidate.delete({
            where: { id }
        });
        await this.clearCandidatesCache();
    }
    async getCandidatesForBallot() {
        const candidates = await this.prisma.candidate.findMany({
            where: { isActive: true },
            orderBy: [
                { position: 'asc' },
                { displayOrder: 'asc' },
                { candidateNumber: 'asc' }
            ],
            select: {
                id: true,
                name: true,
                position: true,
                photoUrl: true,
                candidateNumber: true,
                displayOrder: true,
            }
        });
        const ballot = {};
        candidates.forEach(candidate => {
            if (!ballot[candidate.position]) {
                ballot[candidate.position] = [];
            }
            ballot[candidate.position].push(candidate);
        });
        return ballot;
    }
    async getUnapposedPositions() {
        const positionCounts = await this.prisma.candidate.groupBy({
            by: ['position'],
            where: { isActive: true },
            _count: { position: true }
        });
        return positionCounts
            .filter(item => item._count.position === 1)
            .map(item => item.position);
    }
    async uploadCandidatePhoto(candidateId, file) {
        this.validatePhotoFile(file);
        const candidate = await this.getCandidateById(candidateId);
        if (candidate.photoPublicId) {
            await this.supabaseService.deleteFile(String(candidate.photoPublicId));
        }
        const fileName = `candidate-${candidateId}-${Date.now()}`;
        const { publicUrl } = await this.supabaseService.uploadFile(file.buffer, fileName, 'candidate-photos');
        await this.prisma.candidate.update({
            where: { id: candidateId },
            data: {
                photoUrl: publicUrl,
                photoPublicId: fileName,
            }
        });
        await this.clearCandidatesCache();
        return publicUrl;
    }
    async validateCandidateNumber(candidateNumber, excludeId) {
        const existing = await this.prisma.candidate.findFirst({
            where: {
                candidateNumber,
                ...(excludeId && { NOT: { id: excludeId } })
            }
        });
        if (existing) {
            throw new common_1.ConflictException(`Candidate number ${candidateNumber} already exists`);
        }
    }
    validatePhotoFile(file) {
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 2 * 1024 * 1024;
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Only JPEG and PNG files are allowed');
        }
        if (file.size > maxSize) {
            throw new common_1.BadRequestException('File size must be less than 2MB');
        }
    }
    mapToResponseDto(candidate) {
        return {
            id: candidate.id,
            name: candidate.name,
            position: candidate.position,
            photoUrl: candidate.photoUrl,
            biography: candidate.biography,
            candidateNumber: candidate.candidateNumber,
            displayOrder: candidate.displayOrder,
            isActive: candidate.isActive,
            voteCount: candidate.voteCount,
            createdAt: candidate.createdAt,
            updatedAt: candidate.updatedAt,
            photoPublicId: 0
        };
    }
    async clearCandidatesCache() {
        await this.cacheService.clearCandidatesCache();
    }
};
exports.CandidatesService = CandidatesService;
exports.CandidatesService = CandidatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_1.PrismaService,
        cache_service_1.CacheService,
        supabase_1.SupabaseService])
], CandidatesService);
//# sourceMappingURL=candidates.service.js.map