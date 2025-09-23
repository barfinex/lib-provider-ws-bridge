import { RedisConfig } from '../types';

export function buildRedisUrl(cfg?: RedisConfig): string {
  if (!cfg) return 'redis://localhost:6379';
  if (cfg.url) return cfg.url;
  const host = cfg.host ?? 'localhost';
  const port = cfg.port ?? 6379;
  return `redis://${host}:${port}`;
}
