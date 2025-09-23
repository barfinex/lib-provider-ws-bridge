import { DynamicModule, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { SocketBridgeGateway } from './socket.gateway';
import { WS_BRIDGE_OPTIONS, WS_BRIDGE_SUBSCRIPTIONS } from './tokens';
import { WsBridgeOptions } from './types';

@Module({})
export class ProviderWsBridgeModule {
  static forRoot(options: WsBridgeOptions): DynamicModule {
    if (!options?.subscriptions?.length) {
      throw new Error('ProviderWsBridgeModule: options.subscriptions is required and not empty');
    }
    const providers = [
      { provide: WS_BRIDGE_OPTIONS, useValue: options },
      { provide: WS_BRIDGE_SUBSCRIPTIONS, useValue: options.subscriptions },
      RedisService,
      SocketBridgeGateway,
    ];
    return {
      module: ProviderWsBridgeModule,
      providers,
      exports: providers,
    };
  }

  static forRootAsync(asyncOptions: {
    useFactory: (...args: any[]) => Promise<WsBridgeOptions> | WsBridgeOptions;
    inject?: any[];
    imports?: any[];
  }): DynamicModule {
    return {
      module: ProviderWsBridgeModule,
      imports: asyncOptions.imports ?? [],
      providers: [
        {
          provide: WS_BRIDGE_OPTIONS,
          useFactory: async (...args: any[]) => await asyncOptions.useFactory(...args),
          inject: asyncOptions.inject ?? [],
        },
        {
          provide: WS_BRIDGE_SUBSCRIPTIONS,
          useFactory: async (opts: WsBridgeOptions) => opts.subscriptions,
          inject: [WS_BRIDGE_OPTIONS],
        },
        RedisService,
        SocketBridgeGateway,
      ],
      exports: [WS_BRIDGE_OPTIONS, WS_BRIDGE_SUBSCRIPTIONS, RedisService, SocketBridgeGateway],
    };
  }
}
