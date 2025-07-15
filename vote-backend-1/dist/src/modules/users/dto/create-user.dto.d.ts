import { UserRoles } from '../enums/user-roles.enum';
export declare class CreateUserDto {
    name: string;
    phone?: string;
    email: string;
    password?: string;
    role?: UserRoles;
    programme?: string;
    level?: string;
    subgroup?: string;
    college?: string;
}
