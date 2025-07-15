import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private userService: UsersService,
    ) {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
        console.log('JWT_SECRET:', secret); // Debug log
    }

    async validate(payload: any) {
        const user = await this.userService.findById(payload.sub);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return {
            id: user.id,
            phone: user.phone,
            email: user.email,
            name: user.name,
            role: user.role,
            phoneVerified: user.phoneVerified,
            emailVerified: user.emailVerified,
        };
    }
}