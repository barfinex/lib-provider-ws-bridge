# @barfinex/provider-ws-bridge

**NestJS library** that bridges **Redis Pub/Sub** to **Socket.IO** so real-time Provider events (orders, candles, accounts, etc.) can be streamed to browsers or other WebSocket clients.

Use it in any REST app that needs to push Barfinex event-bus data over WebSockets — for example a custom dashboard or a thin layer in front of the Provider.

---

## What it does

- **Redis → Socket.IO** — subscribes to configurable Redis channels and forwards messages as Socket.IO events.
- **NestJS module** — `ProviderWsBridgeModule.forRoot(options)` for Redis connection, channel list, and optional JSON parsing and logging.
- **Flexible channels** — you choose which channels to bridge (e.g. `orders`, `candles`, `accounts`).

---

## Installation

In a monorepo, add the path to `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@barfinex/provider-ws-bridge": ["libs/provider-ws-bridge/src/index.ts"]
    }
  }
}
```

Or install from npm when published:

```sh
npm install @barfinex/provider-ws-bridge
```

---

## Quick use

```ts
import { Module } from '@nestjs/common';
import { ProviderWsBridgeModule } from '@barfinex/provider-ws-bridge';

@Module({
  imports: [
    ProviderWsBridgeModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT || 6379),
      },
      subscriptions: (process.env.WS_CHANNELS || 'orders,candles,accounts').split(','),
      parseJson: true,
      log: true,
    }),
  ],
})
export class AppModule {}
```

---

## What's included

| Export | Purpose |
|--------|--------|
| `ProviderWsBridgeModule` | NestJS module with `forRoot()` config (redis, subscriptions, parseJson, log). |
| `RedisService` | Redis client used by the bridge. |
| `SocketGateway` | Socket.IO gateway that emits events to clients. |
| Types & tokens | For DI and custom configuration. |

---

## Documentation

- **Barfinex overview** — [First Steps](https://barfinex.com/docs/first-steps), [Architecture](https://barfinex.com/docs/architecture) (event bus and Provider WebSocket).
- **Provider** — [Installation provider](https://barfinex.com/docs/installation-provider), [Docker Compose for Provider](https://barfinex.com/docs/installation-provider-docker-compose), [Provider API reference](https://barfinex.com/docs/provider-api).
- **Studio** — [Terminal Configuration](https://barfinex.com/docs/configuration-studio), [Registering Provider in Studio](https://barfinex.com/docs/configuration-studio-provider).
- **Troubleshooting** — [Typical problems and solutions](https://barfinex.com/docs/troubleshooting).

---

## Contributing

Ideas and PRs welcome. Community: [Telegram](https://t.me/barfinex) · [GitHub](https://github.com/barfinex).

---

## License

Licensed under the [Apache License 2.0](LICENSE) with additional terms. Attribution to **Barfin Network Limited** and a link to [https://barfinex.com](https://barfinex.com) are required. See [LICENSE](LICENSE) and the [Barfinex site](https://barfinex.com) for details.
