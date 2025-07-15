import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../db';
import { UserRoles } from './enums/user-roles.enum';
import { IUser, IUserProfile } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateAdminDTO } from './dto/create-admin.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserStatsDto } from './dto/user-profile.dto';
import { User } from './entities/user.entity';
import { UserRole } from '@prisma/client/index';

@Injectable()
export class UsersService {
    private logger = new Logger(UsersService.name);

    constructor(private prisma: PrismaService) {
        console.log('Instantiating UsersService');
    }

    async create(createUserDto: CreateUserDto): Promise<{
        college: string | null;
        createdAt: Date;
        email: string;
        emailVerified: boolean;
        hasVoted: boolean;
        id: string;
        inkVerified: boolean;
        isActive: boolean;
        lastLoginAt: Date | null;
        level: string | null;
        name: string;
        password: string | null;
        phone: string | null;
        phoneVerified: boolean;
        programme: string | null;
        role: UserRole;
        subgroup: string | null;
        subgroupId: string | null;
        updatedAt: Date
    }> {
        return await this.prisma.$transaction(async (tx) => {
            // Check phone number uniqueness
            if (createUserDto.phone) {
                const existingUser = await tx.user.findUnique({
                    //@ts-ignore
                    where: { phone: createUserDto.phone },
                });
                if (existingUser) {
                    throw new ConflictException('User with this phone number already exists');
                }
            }

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
                : undefined;

            // Map UserRoles enum to Prisma UserRole enum
            const mapRoleToUserRole = (role: UserRoles): UserRole => {
                switch (role) {
                    case UserRoles.VOTER:
                        return UserRole.VOTER;
                    case UserRoles.ASPIRANT:
                        return UserRole.ASPIRANT;
                    case UserRoles.EC_MEMBER:
                        return UserRole.EC_MEMBER;
                    case UserRoles.SUPER_ADMIN:
                        return UserRole.SUPER_ADMIN;
                    case UserRoles.ADMIN:
                        return UserRole.ADMIN;
                    default:
                        return UserRole.VOTER;
                }
            };

            // Prepare user data
            const userData = {
                name: createUserDto.name,
                phone: createUserDto.phone,
                email: createUserDto.email,
                password: hashedPassword,
                role: mapRoleToUserRole(createUserDto.role || UserRoles.VOTER),
                programme: createUserDto.programme,
                level: createUserDto.level,
                subgroup: createUserDto.subgroup,
                college: createUserDto.college,
                phoneVerified: false,
                emailVerified: false,
                isActive: true,
                hasVoted: false,
                inkVerified: false,
            };

            // Create user
            const user = await tx.user.create({
                data: userData,
            });

            return user;
        });
    }

    async createAdmin(createAdminDto: CreateAdminDTO): Promise<IUser> {
        return await this.prisma.$transaction(async (tx) => {
            // Check email uniqueness
            const existingEmail = await tx.user.findUnique({
                where: { email: createAdminDto.email },
            });
            if (existingEmail) {
                throw new ConflictException('Email already exists');
            }

            // Check phone number uniqueness
            if (createAdminDto.phone) {
                const existingPhone = await tx.user.findUnique({
                    //@ts-ignore
                    where: { phone: createAdminDto.phone },
                });
                if (existingPhone) {
                    throw new ConflictException('Phone number already exists');
                }
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);

            // Map UserRoles enum to Prisma UserRole enum
            const mapRoleToUserRole = (role: UserRoles): UserRole => {
                switch (role) {
                    case UserRoles.EC_MEMBER:
                        return UserRole.EC_MEMBER;
                    case UserRoles.SUPER_ADMIN:
                        return UserRole.SUPER_ADMIN;
                    case UserRoles.ADMIN:
                        return UserRole.ADMIN;
                    default:
                        return UserRole.ADMIN;
                }
            };

            // Prepare admin data
            const adminData = {
                name: createAdminDto.name,
                phone: createAdminDto.phone,
                email: createAdminDto.email,
                password: hashedPassword,
                role: mapRoleToUserRole(createAdminDto.role),
                programme: createAdminDto.programme,
                level: createAdminDto.level,
                subgroup: createAdminDto.subgroup,
                college: createAdminDto.college,
                phoneVerified: true,
                emailVerified: true,
                isActive: true,
                hasVoted: false,
                inkVerified: false,
            };

            // Create admin
            const admin = await tx.user.create({
                data: adminData,
            });

            return new User(admin);
        });
    }

    async findByPhone(phone: string): Promise<IUser | null> {
        const user = await this.prisma.user.findUnique({
            //@ts-ignore
            where: { phone },
        });

        return user ? new User(user) : null;
    }

    async findByEmail(email: string): Promise<IUser | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        return user ? new User(user) : null;
    }

    async findById(id: string): Promise<IUser | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        return user ? new User(user) : null;
    }

    async update(id: string, updateUserDto: UpdateUserDTO): Promise<IUser> {
        return await this.prisma.$transaction(async (tx) => {
            const existingUser = await tx.user.findUnique({
                where: { id },
            });

            if (!existingUser) {
                throw new NotFoundException('User not found');
            }

            if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
                const emailExists = await tx.user.findUnique({
                    where: { email: updateUserDto.email },
                });
                if (emailExists) {
                    throw new ConflictException('Email already exists');
                }
            }

            if (updateUserDto.phone && updateUserDto.phone !== existingUser.phone) {
                const phoneExists = await tx.user.findUnique({
                    //@ts-ignore
                    where: { phone: updateUserDto.phone },
                });
                if (phoneExists) {
                    throw new ConflictException('Phone number already exists');
                }
            }

            const updateData: any = { ...updateUserDto };

            if (updateUserDto.password) {
                updateData.password = await bcrypt.hash(updateUserDto.password, 10);
            }

            if (updateUserDto.role) {
                const mapRoleToUserRole = (role: UserRoles): UserRole => {
                    switch (role) {
                        case UserRoles.VOTER:
                            return UserRole.VOTER;
                        case UserRoles.ASPIRANT:
                            return UserRole.ASPIRANT;
                        case UserRoles.EC_MEMBER:
                            return UserRole.EC_MEMBER;
                        case UserRoles.SUPER_ADMIN:
                            return UserRole.SUPER_ADMIN;
                        case UserRoles.ADMIN:
                            return UserRole.ADMIN;
                        default:
                            return existingUser.role;
                    }
                };
                updateData.role = mapRoleToUserRole(updateUserDto.role);
            }

            const updatedUser = await tx.user.update({
                where: { id },
                data: updateData,
            });

            return new User(updatedUser);
        });
    }

    async updatePhoneVerificationStatus(id: string, phoneVerified?: boolean, emailVerified?: boolean): Promise<IUser> {
        return await this.prisma.$transaction(async (tx) => {
            const existingUser = await tx.user.findUnique({
                where: { id },
            });

            if (!existingUser) {
                throw new NotFoundException('User not found');
            }

            const updateData: any = {};

            if (phoneVerified !== undefined) {
                updateData.phoneVerified = phoneVerified;
                updateData.phoneVerifiedAt = phoneVerified ? new Date() : null;
                if (phoneVerified) {
                    updateData.isActive = true;
                }
            }

            if (emailVerified !== undefined) {
                updateData.emailVerified = emailVerified;
                updateData.emailVerifiedAt = emailVerified ? new Date() : null;
            }

            const updatedUser = await tx.user.update({
                where: { id },
                data: updateData,
            });

            return new User(updatedUser);
        });
    }

    async updateLastLogin(id: string): Promise<void> {
        if (!id) {
            throw new Error('Invalid user ID provided');
        }

        await this.prisma.$transaction(async (tx) => {
            const existingUser = await tx.user.findUnique({
                where: { id },
            });

            if (!existingUser) {
                throw new NotFoundException('User not found');
            }

            await tx.user.update({
                where: { id },
                data: {
                    //@ts-ignore
                    lastLoginAt: new Date(),
                },
            });
        });
    }

    async getUserProfile(id: string): Promise<IUserProfile> {
        if (!id) {
            throw new Error('Invalid user ID provided');
        }

        return await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    role: true,
                    phoneVerified: true,
                    isActive: true,
                    createdAt: true,
                    //@ts-ignore
                    lastLoginAt: true,
                },
            });

            if (!user) {
                throw new NotFoundException('User not found');
            }

            const convertPrismaRoleToUserRole = (prismaRole: UserRole): UserRoles => {
                switch (prismaRole) {
                    case UserRole.VOTER:
                        return UserRoles.VOTER;
                    case UserRole.ASPIRANT:
                        return UserRoles.ASPIRANT;
                    case UserRole.EC_MEMBER:
                        return UserRoles.EC_MEMBER;
                    case UserRole.SUPER_ADMIN:
                        return UserRoles.SUPER_ADMIN;
                    case UserRole.ADMIN:
                        return UserRoles.ADMIN;
                    default:
                        return UserRoles.VOTER;
                }
            };

            return {
                id: user.id,
                name: user.name,
                phone: user.phone ?? '', // Handle null phone
                role: convertPrismaRoleToUserRole(user.role),
                phoneVerified: user.phoneVerified,
                isActive: user.isActive,
                createdAt: user.createdAt,
                //@ts-ignore
                lastLoginAt: user.lastLoginAt,
            };
        });
    }

    async findAll(page: number = 1, limit: number = 10, role?: UserRoles): Promise<{
        users: IUser[];
        total: number;
        page: number;
        limit: number;
    }> {
        const skip = (page - 1) * limit;
        const where = role ? { role } : {};

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            users: users.map((user) => new User(user)),
            total,
            page,
            limit,
        };
    }

    async getECMembers(): Promise<IUser[]> {
        const ecMembers = await this.prisma.user.findMany({
            where: { role: UserRole.EC_MEMBER },
            orderBy: { createdAt: 'asc' },
        });

        return ecMembers.map((user) => new User(user));
    }

    async getAdmins(): Promise<IUser[]> {
        const admins = await this.prisma.user.findMany({
            where: {
                role: {
                    in: [UserRole.SUPER_ADMIN, UserRole.EC_MEMBER],
                },
            },
            orderBy: { createdAt: 'asc' },
        });

        return admins.map((user) => new User(user));
    }

    async updateUserStatus(userId: string, isActive: boolean) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.prisma.user.update({
            where: { id: userId },
            data: { isActive },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                isActive: true,
                updatedAt: true,
            },
        });
    }

    async getUserStats(): Promise<UserStatsDto> {
        const [
            totalUsers,
            totalAdmins,
            totalAspirants,
            totalVoters,
            verifiedUsers,
            activeUsers,
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({
                where: { role: { in: [UserRole.SUPER_ADMIN, UserRole.EC_MEMBER] } },
            }),
            this.prisma.user.count({ where: { role: UserRole.ASPIRANT } }),
            this.prisma.user.count({ where: { role: UserRole.VOTER } }),
            this.prisma.user.count({ where: { phoneVerified: true } }),
            this.prisma.user.count({ where: { isActive: true } }),
        ]);

        return {
            totalUsers,
            totalAdmins,
            totalAspirants,
            totalVoters,
            verifiedUsers,
            activeUsers,
        };
    }

    async validateAdminCredentials(phone: string, password: string): Promise<IUser | null> {
        const user = await this.findByPhone(phone);
        if (!user || !user.password) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return null;
        }

        if (
            user.role !== UserRole.ADMIN &&
            user.role !== UserRole.SUPER_ADMIN &&
            user.role !== UserRole.EC_MEMBER
        ) {
            return null;
        }

        return user;
    }

    async softDelete(id: string): Promise<IUser> {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                isActive: false,
            },
        });

        return new User(updatedUser);
    }

    async suspendUser(id: string): Promise<IUser> {
        return this.softDelete(id);
    }

    async reactivateUser(id: string): Promise<IUser> {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                isActive: true,
            },
        });

        return new User(updatedUser);
    }

    async createOrUpdateUser(data: { phone: string; name: string; email: string; role: UserRole }) {
        return this.prisma.user.upsert({
            //@ts-ignore
            where: { phone: data.phone },
            update: {
                name: data.name,
                email: data.email,
            },
            create: {
                phone: data.phone,
                name: data.name,
                email: data.email,
                role: data.role,
                phoneVerified: false,
                emailVerified: false,
                isActive: true,
            },
        });
    }
}