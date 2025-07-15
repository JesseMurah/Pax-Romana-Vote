import { UserRoles } from '../enums/user-roles.enum';
export declare class UpdateUserDTO {
    name?: string;
    phone?: string;
    email?: string;
    password?: string;
    role?: UserRoles;
    programme?: string;
    level?: string;
    subgroup?: string;
    college?: string;
    phoneVerified?: boolean;
    emailVerified?: boolean;
    isActive?: boolean;
    inkVerified?: boolean;
}
