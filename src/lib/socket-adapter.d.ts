import { INestApplication } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
export interface ProviderSocketAdapterOptions {
    path?: string;
    cors?: {
        origin: string | string[] | boolean;
        credentials?: boolean;
    };
}
export declare class ProviderSocketAdapter extends IoAdapter {
    private readonly app;
    private readonly opts;
    constructor(app: INestApplication, opts: ProviderSocketAdapterOptions);
    createIOServer(port: number, options?: any): any;
}
export declare function applyProviderWsAdapter(app: INestApplication, opts?: ProviderSocketAdapterOptions): void;
