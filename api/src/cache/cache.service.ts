import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client!: Redis;
  private readonly defaultTtl = 300;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const url =
      this.config.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
    this.client = new Redis(url, { maxRetriesPerRequest: null });
    this.logger.log('Redis cache connected');
  }

  async onModuleDestroy() {
    await this.client?.quit();
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.client.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = this.defaultTtl) {
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      this.logger.warn(`Cache set failed: ${key}`);
    }
  }

  async delPattern(pattern: string) {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length) await this.client.del(...keys);
    } catch {
      /* ignore */
    }
  }

  cacheKey(orgId: string, segment: string, range: string) {
    return `covalynce:analytics:${orgId}:${segment}:${range}`;
  }

  async invalidateOrg(orgId: string) {
    await this.delPattern(`covalynce:analytics:${orgId}:*`);
  }

  async ping(): Promise<'ok' | 'error'> {
    try {
      const pong = await this.client.ping();
      return pong === 'PONG' ? 'ok' : 'error';
    } catch {
      return 'error';
    }
  }

  /** Atomic counter with TTL — used for gateway per-key rate limits */
  async increment(key: string, ttlSeconds: number): Promise<number> {
    try {
      const count = await this.client.incr(key);
      if (count === 1) {
        await this.client.expire(key, ttlSeconds);
      }
      return count;
    } catch {
      return 0;
    }
  }
}
