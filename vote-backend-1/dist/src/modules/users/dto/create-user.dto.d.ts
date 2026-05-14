import { UserRole } from "@prisma/client/index";
export declare class CreateUserDto {
    name: string;
    phone?: string;
    email: string;
    password?: string;
    role?: UserRole;
    programme?: string;
    level?: string;
    subgroup?: string;
    college?: string;
}
