import { UserRoles } from '../enums/user-roles.enum';
export declare class CreateAdminDTO {
    name: string;
    phone: string;
    email: string;
    password: string;
    role: UserRoles.SUPER_ADMIN | UserRoles.EC_MEMBER | UserRoles.ADMIN;
    programme?: string;
    level?: string;
    subgroup?: string;
    college?: string;
}
