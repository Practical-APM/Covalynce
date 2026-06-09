import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class GatewayRateLimitService {
  private readonly defaultRpm: number;

  constructor(
    private readonly cache: CacheService,
    config: ConfigService,
  ) {
    this.defaultRpm = Number(config.get('GATEWAY_DEFAULT_RPM') ?? 120);
  }

  async check(keyId: string, limitRpm?: number): Promise<void> {
    const limit = limitRpm ?? this.defaultRpm;
    const minute = Math.floor(Date.now() / 60_000);
    const cacheKey = `covalynce:gw-rate:${keyId}:${minute}`;
    const count = await this.cache.increment(cacheKey, 90);

    if (count > limit) {
      throw new HttpException(
        {
          error: {
            message: `Gateway rate limit exceeded (${limit} requests/minute)`,
            type: 'rate_limit_error',
            code: 'rate_limit_exceeded',
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
