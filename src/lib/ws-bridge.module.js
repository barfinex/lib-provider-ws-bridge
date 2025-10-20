"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ProviderWsBridgeModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderWsBridgeModule = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("./redis.service");
const socket_gateway_1 = require("./socket.gateway");
const tokens_1 = require("./tokens");
let ProviderWsBridgeModule = ProviderWsBridgeModule_1 = class ProviderWsBridgeModule {
    static forRoot(options) {
        if (!options?.subscriptions?.length) {
            throw new Error('ProviderWsBridgeModule: options.subscriptions is required and not empty');
        }
        const providers = [
            { provide: tokens_1.WS_BRIDGE_OPTIONS, useValue: options },
            { provide: tokens_1.WS_BRIDGE_SUBSCRIPTIONS, useValue: options.subscriptions },
            redis_service_1.RedisService,
            socket_gateway_1.SocketBridgeGateway,
        ];
        return {
            module: ProviderWsBridgeModule_1,
            providers,
            exports: providers,
        };
    }
    static forRootAsync(asyncOptions) {
        return {
            module: ProviderWsBridgeModule_1,
            imports: asyncOptions.imports ?? [],
            providers: [
                {
                    provide: tokens_1.WS_BRIDGE_OPTIONS,
                    useFactory: async (...args) => await asyncOptions.useFactory(...args),
                    inject: asyncOptions.inject ?? [],
                },
                {
                    provide: tokens_1.WS_BRIDGE_SUBSCRIPTIONS,
                    useFactory: async (opts) => opts.subscriptions,
                    inject: [tokens_1.WS_BRIDGE_OPTIONS],
                },
                redis_service_1.RedisService,
                socket_gateway_1.SocketBridgeGateway,
            ],
            exports: [tokens_1.WS_BRIDGE_OPTIONS, tokens_1.WS_BRIDGE_SUBSCRIPTIONS, redis_service_1.RedisService, socket_gateway_1.SocketBridgeGateway],
        };
    }
};
exports.ProviderWsBridgeModule = ProviderWsBridgeModule;
exports.ProviderWsBridgeModule = ProviderWsBridgeModule = ProviderWsBridgeModule_1 = __decorate([
    (0, common_1.Module)({})
], ProviderWsBridgeModule);
//# sourceMappingURL=ws-bridge.module.js.map