import { UserRoles } from "../../users/enums/user-roles.enum";
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: UserRoles[]) => import("@nestjs/common").CustomDecorator<string>;
