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
    const client = createClient({ url });
    client.on('error', (err) => this.logger.error('Redis error', err as any));

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
