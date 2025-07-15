import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private userService;
    constructor(configService: ConfigService, userService: UsersService);
    validate(payload: any): Promise<{
        id: string;
        phone: string;
        email: string | undefined;
        name: string;
        role: import("../../users/enums/user-roles.enum").UserRoles;
        phoneVerified: boolean;
        emailVerified: boolean;
    }>;
}
export {};
