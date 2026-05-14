import { Controller } from '@nestjs/common';
import { CacheService } from './cache.service';

@Controller('s')
export class CacheController {
  constructor(private readonly sService: CacheService) {}
}
