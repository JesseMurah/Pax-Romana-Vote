// import { UserRoles } from "../../users/enums/user-roles.enum";
import { UserRole } from "@prisma/client/index";
import { SetMetadata } from "@nestjs/common";


export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);