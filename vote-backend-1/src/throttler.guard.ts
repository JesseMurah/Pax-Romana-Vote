import { Injectable } from '@nestjs/common';
import { ThrottlerGuard as NestThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends NestThrottlerGuard {
    constructor() {
        // @ts-ignore
        super();
        console.log('Instantiating CustomThrottlerGuard');
    }
}