import { OnApplicationBootstrap } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from './redis.service';
import { WsBridgeOptions } from './types';
export declare class SocketBridgeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnApplicationBootstrap {
    private readonly redis;
    private readonly opts;
    private readonly subscriptions;
    server: Server;
    private readonly logger;
    private initialized;
    constructor(redis: RedisService, opts: WsBridgeOptions, subscriptions: string[]);
    onApplicationBootstrap(): Promise<void>;
    afterInit(): Promise<void>;
    private setupSubscriptions;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleHealth(client: Socket): void;
    handleMessage(client: Socket, data: any): void;
}
