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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const db_1 = require("../../../db");
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
let UsersService = UsersService_1 = class UsersService {
    prisma;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
        this.logger.log('UsersService initialized');
    }
    async create(createUserDto) {
        return this.prisma.$transaction(async (tx) => {
            const existingEmail = await tx.user.findUnique({
                where: { email: createUserDto.email },
            });
            if (existingEmail) {
                throw new common_1.ConflictException('User with this email already exists');
            }
            const hashedPassword = createUserDto.password
                ? await bcrypt.hash(createUserDto.password, 10)
                : null;
            const user = await tx.user.create({
                data: {
                    name: createUserDto.name,
                    email: createUserDto.email,
                    password: hashedPassword,
                    role: createUserDto.role || client_1.UserRole.VOTER,
                    programme: createUserDto.programme,
                    level: createUserDto.level,
                    subgroup: createUserDto.subgroup,
                    college: createUserDto.college,
                    emailVerified: false,
                    isActive: true,
                    phoneVerified: false,
                    hasVoted: false,
                    inkVerified: false,
                },
            });
            this.logger.log(`User created: ${user.email}`);
            return user;
        });
    }
    async createAdmin(createAdminDto) {
        return this.prisma.$transaction(async (tx) => {
            const existingEmail = await tx.user.findUnique({
                where: { email: createAdminDto.email },
            });
            if (existingEmail) {
                throw new common_1.ConflictException('Admin with this email already exists');
            }
            const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);
            const admin = await tx.user.create({
                data: {
                    name: createAdminDto.name,
                    email: createAdminDto.email,
                    password: hashedPassword,
                    role: this.mapUserRoleStringToPrisma(createAdminDto.role),
                    programme: createAdminDto.programme,
                    level: createAdminDto.level,
                    subgroup: createAdminDto.subgroup,
                    college: createAdminDto.college,
                    emailVerified: true,
                    phoneVerified: true,
                    isActive: true,
                    hasVoted: false,
                    inkVerified: false,
                },
            });
            this.logger.log(`Admin created: ${admin.email} with role ${admin.role}`);
            return admin;
        });
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    async findById(id) {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }
    async findAll(page = 1, limit = 10, role) {
        const skip = (page - 1) * limit;
        const where = role ? { role } : {};
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    emailVerified: true,
                    isActive: true,
                    createdAt: true,
                    lastLoginAt: true,
                    programme: true,
                    level: true,
                    college: true,
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getECMembers() {
        return this.prisma.user.findMany({
            where: {
                role: { in: [client_1.UserRole.EC_MEMBER, client_1.UserRole.SUPER_ADMIN] }
            },
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                emailVerified: true,
                isActive: true,
                createdAt: true,
                lastLoginAt: true,
            },
        });
    }
    async getAdmins() {
        return this.prisma.user.findMany({
            where: {
                role: {
                    in: [client_1.UserRole.SUPER_ADMIN, client_1.UserRole.EC_MEMBER, client_1.UserRole.ADMIN],
                },
            },
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                emailVerified: true,
                isActive: true,
                createdAt: true,
                lastLoginAt: true,
            },
        });
    }
    async update(id, updateUserDto) {
        return this.prisma.$transaction(async (tx) => {
            const existingUser = await tx.user.findUnique({
                where: { id },
            });
            if (!existingUser) {
                throw new common_1.NotFoundException('User not found');
            }
            if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
                const emailExists = await tx.user.findUnique({
                    where: { email: updateUserDto.email },
                });
                if (emailExists) {
                    throw new common_1.ConflictException('Email already exists');
                }
            }
            const updateData = { ...updateUserDto };
            if (updateUserDto.password) {
                updateData.password = await bcrypt.hash(updateUserDto.password, 10);
            }
            const updatedUser = await tx.user.update({
                where: { id },
                data: updateData,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    emailVerified: true,
                    isActive: true,
                    updatedAt: true,
                },
            });
            this.logger.log(`User updated: ${updatedUser.email}`);
            return updatedUser;
        });
    }
    async updateUserStatus(id, isActive) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: { isActive },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                updatedAt: true,
            },
        });
        this.logger.log(`User status updated: ${updatedUser.email} - Active: ${isActive}`);
        return updatedUser;
    }
    async updateEmailVerificationStatus(id, emailVerified) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                emailVerified,
                emailVerifiedAt: emailVerified ? new Date() : null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                emailVerified: true,
                emailVerifiedAt: true,
            },
        });
        this.logger.log(`Email verification status updated for user: ${updatedUser.email}`);
        return updatedUser;
    }
    async updateLastLogin(id) {
        await this.prisma.user.update({
            where: { id },
            data: {
                lastLoginAt: new Date(),
            },
        });
    }
    async suspendUser(id) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: { isActive: false },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                updatedAt: true,
            },
        });
        this.logger.log(`User suspended: ${updatedUser.email}`);
        return updatedUser;
    }
    async reactivateUser(id) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: { isActive: true },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                updatedAt: true,
            },
        });
        this.logger.log(`User reactivated: ${updatedUser.email}`);
        return updatedUser;
    }
    async softDelete(id) {
        return this.suspendUser(id);
    }
    async getUserProfile(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                emailVerified: true,
                isActive: true,
                createdAt: true,
                lastLoginAt: true,
                programme: true,
                level: true,
                college: true,
                subgroup: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async getUserStats() {
        const [totalUsers, totalAdmins, totalAspirants, totalVoters, totalECMembers, verifiedUsers, activeUsers,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({
                where: {
                    role: { in: [client_1.UserRole.SUPER_ADMIN, client_1.UserRole.EC_MEMBER, client_1.UserRole.ADMIN] }
                },
            }),
            this.prisma.user.count({ where: { role: client_1.UserRole.ASPIRANT } }),
            this.prisma.user.count({ where: { role: client_1.UserRole.VOTER } }),
            this.prisma.user.count({ where: { role: client_1.UserRole.EC_MEMBER } }),
            this.prisma.user.count({ where: { emailVerified: true } }),
            this.prisma.user.count({ where: { isActive: true } }),
        ]);
        return {
            totalUsers,
            totalAdmins,
            totalAspirants,
            totalVoters,
            totalECMembers,
            verifiedUsers,
            activeUsers,
        };
    }
    async validateAdminCredentials(email, password) {
        const user = await this.findByEmail(email);
        if (!user || !user.password) {
            return null;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return null;
        }
        const adminRoles = [client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.EC_MEMBER];
        if (!adminRoles.includes(user.role)) {
            return null;
        }
        return user;
    }
    async createOrUpdateUser(data) {
        return this.prisma.user.upsert({
            where: { email: data.email },
            update: {
                name: data.name,
                lastLoginAt: new Date(),
            },
            create: {
                email: data.email,
                name: data.name,
                role: data.role,
                password: data.password ? await bcrypt.hash(data.password, 10) : null,
                emailVerified: false,
                phoneVerified: false,
                isActive: true,
                hasVoted: false,
                inkVerified: false,
            },
        });
    }
    mapUserRoleStringToPrisma(role) {
        const normalizedRole = typeof role === 'string' ? role.toUpperCase() : role;
        switch (normalizedRole) {
            case 'SUPER_ADMIN':
            case client_1.UserRole.SUPER_ADMIN:
                return client_1.UserRole.SUPER_ADMIN;
            case 'EC_MEMBER':
            case client_1.UserRole.EC_MEMBER:
                return client_1.UserRole.EC_MEMBER;
            case 'ADMIN':
            case client_1.UserRole.ADMIN:
                return client_1.UserRole.ADMIN;
            case 'ASPIRANT':
            case client_1.UserRole.ASPIRANT:
                return client_1.UserRole.ASPIRANT;
            case 'VOTER':
            case client_1.UserRole.VOTER:
                return client_1.UserRole.VOTER;
            default:
                this.logger.warn(`Unknown role '${role}', defaulting to VOTER`);
                return client_1.UserRole.VOTER;
        }
    }
    async cleanupInactiveUsers(daysInactive = 365) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysInactive);
        const result = await this.prisma.user.updateMany({
            where: {
                AND: [
                    { lastLoginAt: { lt: cutoffDate } },
                    { role: client_1.UserRole.VOTER },
                    { isActive: true },
                ],
            },
            data: {
                isActive: false,
            },
        });
        this.logger.log(`Cleaned up ${result.count} inactive users`);
        return result;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map