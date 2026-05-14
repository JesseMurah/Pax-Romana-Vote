import {ConflictException, Injectable, Logger, NotFoundException} from '@nestjs/common';
import {PrismaService} from '../../../db';
import { UserRole } from '@prisma/client';
import {CreateUserDto} from './dto/create-user.dto';
import {CreateAdminDTO} from './dto/create-admin.dto';
import {UpdateUserDTO} from './dto/update-user.dto';
import {UserStatsDto} from './dto/user-profile.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(private prisma: PrismaService) {
        this.logger.log('UsersService initialized');
    }

    // ========== CREATE OPERATIONS ==========

    async create(createUserDto: CreateUserDto) {
        return this.prisma.$transaction(async (tx) => {
            // Check email uniqueness
            const existingEmail = await tx.user.findUnique({
                where: { email: createUserDto.email },
            });
            if (existingEmail) {
                throw new ConflictException('User with this email already exists');
            }

            // Hash password if provided
            const hashedPassword = createUserDto.password
                ? await bcrypt.hash(createUserDto.password, 10)
                : null;

            // Create user
            const user = await tx.user.create({
                data: {
                    name: createUserDto.name,
                    email: createUserDto.email,
                    password: hashedPassword,
                    role: createUserDto.role || UserRole.VOTER,
                    programme: createUserDto.programme,
                    level: createUserDto.level,
                    subgroup: createUserDto.subgroup,
                    college: createUserDto.college,
                    emailVerified: false,
                    isActive: true,
                    phoneVerified: false, // Keep for schema compatibility
                    hasVoted: false,
                    inkVerified: false,
                },
            });

            this.logger.log(`User created: ${user.email}`);
            return user;
        });
    }

    async createAdmin(createAdminDto: CreateAdminDTO) {
        return this.prisma.$transaction(async (tx) => {
            // Check email uniqueness
            const existingEmail = await tx.user.findUnique({
                where: { email: createAdminDto.email },
            });
            if (existingEmail) {
                throw new ConflictException('Admin with this email already exists');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);

            // Create admin
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
                    emailVerified: true, // Admins are pre-verified
                    phoneVerified: true, // Keep for schema compatibility
                    isActive: true,
                    hasVoted: false,
                    inkVerified: false,
                },
            });

            this.logger.log(`Admin created: ${admin.email} with role ${admin.role}`);
            return admin;
        });
    }

    // ========== FIND OPERATIONS ==========

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: {email},
        });
    }

    async findById(id: string) {
        return this.prisma.user.findUnique({
            where: {id},
        });
    }

    async findAll(page: number = 1, limit: number = 10, role?: UserRole) {
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
                role: {in: [UserRole.EC_MEMBER, UserRole.SUPER_ADMIN]}
            },
            orderBy: {createdAt: 'asc'},
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
                    in: [UserRole.SUPER_ADMIN, UserRole.EC_MEMBER, UserRole.ADMIN],
                },
            },
            orderBy: {createdAt: 'asc'},
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

    // ========== UPDATE OPERATIONS ==========

    async update(id: string, updateUserDto: UpdateUserDTO) {
        return this.prisma.$transaction(async (tx) => {
            const existingUser = await tx.user.findUnique({
                where: { id },
            });

            if (!existingUser) {
                throw new NotFoundException('User not found');
            }

            // Check email uniqueness if email is being updated
            if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
                const emailExists = await tx.user.findUnique({
                    where: { email: updateUserDto.email },
                });
                if (emailExists) {
                    throw new ConflictException('Email already exists');
                }
            }

            const updateData: any = { ...updateUserDto };

            // Hash password if provided
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

    // Added missing updateUserStatus method
    async updateUserStatus(id: string, isActive: boolean) {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
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

    async updateEmailVerificationStatus(id: string, emailVerified: boolean) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('User not found');
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

    async updateLastLogin(id: string) {
        await this.prisma.user.update({
            where: { id },
            data: {
                lastLoginAt: new Date(),
            },
        });
    }

    async suspendUser(id: string) {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
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

    async reactivateUser(id: string) {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
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

    async softDelete(id: string) {
        return this.suspendUser(id); // Same as suspend for now
    }

    // ========== PROFILE & STATS ==========

    async getUserProfile(id: string) {
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
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async getUserStats(): Promise<{
        totalUsers: number;
        totalAdmins: number;
        totalAspirants: number;
        totalVoters: number;
        totalECMembers: number;
        verifiedUsers: number;
        activeUsers: number
    }> {
        const [
            totalUsers,
            totalAdmins,
            totalAspirants,
            totalVoters,
            totalECMembers,
            verifiedUsers,
            activeUsers,
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({
                where: {
                    role: { in: [UserRole.SUPER_ADMIN, UserRole.EC_MEMBER, UserRole.ADMIN] }
                },
            }),
            this.prisma.user.count({ where: { role: UserRole.ASPIRANT } }),
            this.prisma.user.count({ where: { role: UserRole.VOTER } }),
            this.prisma.user.count({ where: { role: UserRole.EC_MEMBER } }),
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

    // ========== AUTHENTICATION HELPERS ==========

    async validateAdminCredentials(email: string, password: string) {
        const user = await this.findByEmail(email);
        if (!user || !user.password) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return null;
        }

        // Check if a user has admin privileges - fix the type issue
        const adminRoles: UserRole[] = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EC_MEMBER];
        if (!adminRoles.includes(user.role)) {
            return null;
        }

        return user;
    }

    async createOrUpdateUser(data: {
        email: string;
        name: string;
        role: UserRole;
        password?: string;
    }) {
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
                phoneVerified: false, // Keep for schema compatibility
                isActive: true,
                hasVoted: false,
                inkVerified: false,
            },
        });
    }

    // ========== UTILITY METHODS ==========

    // Fixed method name and made it more robust
    private mapUserRoleStringToPrisma(role: string): UserRole {
        // Handle both string and enum cases
        const normalizedRole = typeof role === 'string' ? role.toUpperCase() : role;

        switch (normalizedRole) {
            case 'SUPER_ADMIN':
            case UserRole.SUPER_ADMIN:
                return UserRole.SUPER_ADMIN;
            case 'EC_MEMBER':
            case UserRole.EC_MEMBER:
                return UserRole.EC_MEMBER;
            case 'ADMIN':
            case UserRole.ADMIN:
                return UserRole.ADMIN;
            case 'ASPIRANT':
            case UserRole.ASPIRANT:
                return UserRole.ASPIRANT;
            case 'VOTER':
            case UserRole.VOTER:
                return UserRole.VOTER;
            default:
                this.logger.warn(`Unknown role '${role}', defaulting to VOTER`);
                return UserRole.VOTER;
        }
    }

    // ========== CLEANUP METHODS ==========

    async cleanupInactiveUsers(daysInactive: number = 365) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

        const result = await this.prisma.user.updateMany({
            where: {
                AND: [
                    { lastLoginAt: { lt: cutoffDate } },
                    { role: UserRole.VOTER },
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
}