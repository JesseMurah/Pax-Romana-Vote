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
const user_roles_enum_1 = require("./enums/user-roles.enum");
const bcrypt = require("bcrypt");
const user_entity_1 = require("./entities/user.entity");
const index_1 = require("@prisma/client/index");
let UsersService = UsersService_1 = class UsersService {
    prisma;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
        console.log('Instantiating UsersService');
    }
    async create(createUserDto) {
        return await this.prisma.$transaction(async (tx) => {
            if (createUserDto.phone) {
                const existingUser = await tx.user.findUnique({
                    where: { phone: createUserDto.phone },
                });
                if (existingUser) {
                    throw new common_1.ConflictException('User with this phone number already exists');
                }
            }
            const existingEmail = await tx.user.findUnique({
                where: { email: createUserDto.email },
            });
            if (existingEmail) {
                throw new common_1.ConflictException('User with this email already exists');
            }
            const hashedPassword = createUserDto.password
                ? await bcrypt.hash(createUserDto.password, 10)
                : undefined;
            const mapRoleToUserRole = (role) => {
                switch (role) {
                    case user_roles_enum_1.UserRoles.VOTER:
                        return index_1.UserRole.VOTER;
                    case user_roles_enum_1.UserRoles.ASPIRANT:
                        return index_1.UserRole.ASPIRANT;
                    case user_roles_enum_1.UserRoles.EC_MEMBER:
                        return index_1.UserRole.EC_MEMBER;
                    case user_roles_enum_1.UserRoles.SUPER_ADMIN:
                        return index_1.UserRole.SUPER_ADMIN;
                    case user_roles_enum_1.UserRoles.ADMIN:
                        return index_1.UserRole.ADMIN;
                    default:
                        return index_1.UserRole.VOTER;
                }
            };
            const userData = {
                name: createUserDto.name,
                phone: createUserDto.phone,
                email: createUserDto.email,
                password: hashedPassword,
                role: mapRoleToUserRole(createUserDto.role || user_roles_enum_1.UserRoles.VOTER),
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
            const user = await tx.user.create({
                data: userData,
            });
            return user;
        });
    }
    async createAdmin(createAdminDto) {
        return await this.prisma.$transaction(async (tx) => {
            const existingEmail = await tx.user.findUnique({
                where: { email: createAdminDto.email },
            });
            if (existingEmail) {
                throw new common_1.ConflictException('Email already exists');
            }
            if (createAdminDto.phone) {
                const existingPhone = await tx.user.findUnique({
                    where: { phone: createAdminDto.phone },
                });
                if (existingPhone) {
                    throw new common_1.ConflictException('Phone number already exists');
                }
            }
            const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);
            const mapRoleToUserRole = (role) => {
                switch (role) {
                    case user_roles_enum_1.UserRoles.EC_MEMBER:
                        return index_1.UserRole.EC_MEMBER;
                    case user_roles_enum_1.UserRoles.SUPER_ADMIN:
                        return index_1.UserRole.SUPER_ADMIN;
                    case user_roles_enum_1.UserRoles.ADMIN:
                        return index_1.UserRole.ADMIN;
                    default:
                        return index_1.UserRole.ADMIN;
                }
            };
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
            const admin = await tx.user.create({
                data: adminData,
            });
            return new user_entity_1.User(admin);
        });
    }
    async findByPhone(phone) {
        const user = await this.prisma.user.findUnique({
            where: { phone },
        });
        return user ? new user_entity_1.User(user) : null;
    }
    async findByEmail(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        return user ? new user_entity_1.User(user) : null;
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        return user ? new user_entity_1.User(user) : null;
    }
    async update(id, updateUserDto) {
        return await this.prisma.$transaction(async (tx) => {
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
            if (updateUserDto.phone && updateUserDto.phone !== existingUser.phone) {
                const phoneExists = await tx.user.findUnique({
                    where: { phone: updateUserDto.phone },
                });
                if (phoneExists) {
                    throw new common_1.ConflictException('Phone number already exists');
                }
            }
            const updateData = { ...updateUserDto };
            if (updateUserDto.password) {
                updateData.password = await bcrypt.hash(updateUserDto.password, 10);
            }
            if (updateUserDto.role) {
                const mapRoleToUserRole = (role) => {
                    switch (role) {
                        case user_roles_enum_1.UserRoles.VOTER:
                            return index_1.UserRole.VOTER;
                        case user_roles_enum_1.UserRoles.ASPIRANT:
                            return index_1.UserRole.ASPIRANT;
                        case user_roles_enum_1.UserRoles.EC_MEMBER:
                            return index_1.UserRole.EC_MEMBER;
                        case user_roles_enum_1.UserRoles.SUPER_ADMIN:
                            return index_1.UserRole.SUPER_ADMIN;
                        case user_roles_enum_1.UserRoles.ADMIN:
                            return index_1.UserRole.ADMIN;
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
            return new user_entity_1.User(updatedUser);
        });
    }
    async updatePhoneVerificationStatus(id, phoneVerified, emailVerified) {
        return await this.prisma.$transaction(async (tx) => {
            const existingUser = await tx.user.findUnique({
                where: { id },
            });
            if (!existingUser) {
                throw new common_1.NotFoundException('User not found');
            }
            const updateData = {};
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
            return new user_entity_1.User(updatedUser);
        });
    }
    async updateLastLogin(id) {
        if (!id) {
            throw new Error('Invalid user ID provided');
        }
        await this.prisma.$transaction(async (tx) => {
            const existingUser = await tx.user.findUnique({
                where: { id },
            });
            if (!existingUser) {
                throw new common_1.NotFoundException('User not found');
            }
            await tx.user.update({
                where: { id },
                data: {
                    lastLoginAt: new Date(),
                },
            });
        });
    }
    async getUserProfile(id) {
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
                    lastLoginAt: true,
                },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const convertPrismaRoleToUserRole = (prismaRole) => {
                switch (prismaRole) {
                    case index_1.UserRole.VOTER:
                        return user_roles_enum_1.UserRoles.VOTER;
                    case index_1.UserRole.ASPIRANT:
                        return user_roles_enum_1.UserRoles.ASPIRANT;
                    case index_1.UserRole.EC_MEMBER:
                        return user_roles_enum_1.UserRoles.EC_MEMBER;
                    case index_1.UserRole.SUPER_ADMIN:
                        return user_roles_enum_1.UserRoles.SUPER_ADMIN;
                    case index_1.UserRole.ADMIN:
                        return user_roles_enum_1.UserRoles.ADMIN;
                    default:
                        return user_roles_enum_1.UserRoles.VOTER;
                }
            };
            return {
                id: user.id,
                name: user.name,
                phone: user.phone ?? '',
                role: convertPrismaRoleToUserRole(user.role),
                phoneVerified: user.phoneVerified,
                isActive: user.isActive,
                createdAt: user.createdAt,
                lastLoginAt: user.lastLoginAt,
            };
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
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            users: users.map((user) => new user_entity_1.User(user)),
            total,
            page,
            limit,
        };
    }
    async getECMembers() {
        const ecMembers = await this.prisma.user.findMany({
            where: { role: index_1.UserRole.EC_MEMBER },
            orderBy: { createdAt: 'asc' },
        });
        return ecMembers.map((user) => new user_entity_1.User(user));
    }
    async getAdmins() {
        const admins = await this.prisma.user.findMany({
            where: {
                role: {
                    in: [index_1.UserRole.SUPER_ADMIN, index_1.UserRole.EC_MEMBER],
                },
            },
            orderBy: { createdAt: 'asc' },
        });
        return admins.map((user) => new user_entity_1.User(user));
    }
    async updateUserStatus(userId, isActive) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
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
    async getUserStats() {
        const [totalUsers, totalAdmins, totalAspirants, totalVoters, verifiedUsers, activeUsers,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({
                where: { role: { in: [index_1.UserRole.SUPER_ADMIN, index_1.UserRole.EC_MEMBER] } },
            }),
            this.prisma.user.count({ where: { role: index_1.UserRole.ASPIRANT } }),
            this.prisma.user.count({ where: { role: index_1.UserRole.VOTER } }),
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
    async validateAdminCredentials(phone, password) {
        const user = await this.findByPhone(phone);
        if (!user || !user.password) {
            return null;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return null;
        }
        if (user.role !== index_1.UserRole.ADMIN &&
            user.role !== index_1.UserRole.SUPER_ADMIN &&
            user.role !== index_1.UserRole.EC_MEMBER) {
            return null;
        }
        return user;
    }
    async softDelete(id) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                isActive: false,
            },
        });
        return new user_entity_1.User(updatedUser);
    }
    async suspendUser(id) {
        return this.softDelete(id);
    }
    async reactivateUser(id) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                isActive: true,
            },
        });
        return new user_entity_1.User(updatedUser);
    }
    async createOrUpdateUser(data) {
        return this.prisma.user.upsert({
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map