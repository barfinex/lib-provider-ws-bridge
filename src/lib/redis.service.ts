import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis'; // <— без RedisClientType
import { WS_BRIDGE_OPTIONS } from './tokens';
import { WsBridgeOptions } from './types';
import { buildRedisUrl } from './utils/url';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private subscriber?: ReturnType<typeof createClient>; // <— ключевая замена
  private connectPromise?: Promise<void>;
  private subscribed = new Set<string>();
  private lastTransientErrorAt = 0;

  constructor(@Inject(WS_BRIDGE_OPTIONS) private readonly opts: WsBridgeOptions) { }

  async onModuleInit() {
    try {
      await this.ensureConnected();
    } catch (e) {
      this.logger.warn(`Redis initial connect failed (will retry on first subscribe): ${String(e)}`);
    }
  }

  private async ensureConnected() {
    if (this.subscriber && this.subscriber.isOpen) return;
    if (this.connectPromise) return this.connectPromise;

    const url = buildRedisUrl(this.opts.redis);
    const client = createClient({
      url,
      socket: {
        keepAlive: Number(process.env.REDIS_KEEP_ALIVE_MS || 5_000),
        noDelay: true,
        connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT_MS || 10_000),
        reconnectStrategy: (retries) => {
          const base = Number(process.env.REDIS_RECONNECT_BASE_MS || 200);
          const max = Number(process.env.REDIS_RECONNECT_MAX_MS || 3_000);
          return Math.min(max, base * Math.pow(2, Math.min(retries, 6)));
        },
      },
    });
    client.on('error', (err) => {
      const text = String((err as any)?.message || err || '').toLowerCase();
      const isTransient =
        text.includes('econnreset') ||
        text.includes('socket hang up') ||
        text.includes('connection reset');
      if (isTransient) {
        const now = Date.now();
        if (now - this.lastTransientErrorAt > 10_000) {
          this.lastTransientErrorAt = now;
          this.logger.warn(`Redis transient connection error: ${String((err as any)?.message || err)}`);
        }
        return;
      }
      this.logger.error('Redis error', err as any);
    });
    client.on('reconnecting', () => {
      this.logger.warn('Redis reconnecting...');
    });
    client.on('ready', () => {
      if (this.opts.log) this.logger.log('Redis connection is ready');
    });
    client.on('end', () => {
      this.logger.warn('Redis connection ended');
    });

    this.connectPromise = (async () => {
      await client.connect();
      this.subscriber = client;
      if (this.opts.log) this.logger.log(`Connected to Redis at ${url}`);
    })();

    try {
      await this.connectPromise;
    } finally {
      this.connectPromise = undefined;
    }
  }

  async subscribe(channel: string, cb: (message: string, channel: string) => void) {
    await this.ensureConnected();
    await this.subscriber!.subscribe(channel, cb as any);
    this.subscribed.add(channel);
    if (this.opts.log) this.logger.log(`Subscribed: ${channel}`);
  }

  async onModuleDestroy() {
    try {
      if (this.subscriber?.isOpen) {
        for (const ch of this.subscribed) {
          try { await this.subscriber.unsubscribe(ch); } catch { }
        }
        await this.subscriber.quit();
      }
    } catch { }
  }
}
