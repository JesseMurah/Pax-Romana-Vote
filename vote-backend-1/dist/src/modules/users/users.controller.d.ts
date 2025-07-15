import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateAdminDTO } from "./dto/create-admin.dto";
import { UpdateUserDTO } from "./dto/update-user.dto";
import { UserRoles } from "./enums/user-roles.enum";
import { UserStatsDto } from "./dto/user-profile.dto";
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
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
        role: import(".prisma/client").UserRole;
        subgroup: string | null;
        subgroupId: string | null;
        updatedAt: Date;
    }>;
    createAdmin(createAdminDto: CreateAdminDTO): Promise<import("./interfaces/user.interface").IUser>;
    getProfile(req: any): Promise<import("./interfaces/user.interface").IUserProfile>;
    findAll(page?: number, limit?: number, role?: UserRoles): Promise<{
        users: import("./interfaces/user.interface").IUser[];
        total: number;
        page: number;
        limit: number;
    }>;
    getUserStats(): Promise<UserStatsDto>;
    getECMembers(): Promise<import("./interfaces/user.interface").IUser[]>;
    getAdmins(): Promise<import("./interfaces/user.interface").IUser[]>;
    findById(id: string): Promise<import("./interfaces/user.interface").IUser | null>;
    update(id: string, updateUserDto: UpdateUserDTO): Promise<import("./interfaces/user.interface").IUser>;
    updateVerificationStatus(id: string, isVerified: boolean): Promise<import("./interfaces/user.interface").IUser>;
    suspendUser(id: string): Promise<import("./interfaces/user.interface").IUser>;
    reactivateUser(id: string): Promise<import("./interfaces/user.interface").IUser>;
    softDelete(id: string): Promise<import("./interfaces/user.interface").IUser>;
}
