import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { WsBridgeOptions } from './types';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly opts;
    private readonly logger;
    private subscriber?;
    private connectPromise?;
    private subscribed;
    constructor(opts: WsBridgeOptions);
    onModuleInit(): Promise<void>;
    private ensureConnected;
    subscribe(channel: string, cb: (message: string, channel: string) => void): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
