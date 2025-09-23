# @barfinex/provider-ws-bridge (libs/provider-ws-bridge)

NestJS library for Provider APIs: bridges Redis pub/sub channels → Socket.IO events.

## Install / Link
Put this folder under `libs/provider-ws-bridge` in your monorepo. Ensure your root `tsconfig.base.json` has a path alias:

```json
{
  "compilerOptions": {
    "paths": {
      "@barfinex/provider-ws-bridge": ["libs/provider-ws-bridge/src/index.ts"]
    }
  }
}
```

## Use in your REST app
```ts
import { Module } from '@nestjs/common';
import { ProviderWsBridgeModule } from '@barfinex/provider-ws-bridge';

@Module({
  imports: [
    ProviderWsBridgeModule.forRoot({
      redis: { host: process.env.REDIS_HOST || 'localhost', port: Number(process.env.REDIS_PORT || 6379) },
      subscriptions: (process.env.WS_CHANNELS || 'orders,candles,accounts').split(','),
      parseJson: true,
      log: true,
    }),
  ],
})
export class AppModule {}
```
