import { Inject, Logger, OnApplicationBootstrap } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from './redis.service';
import { WS_BRIDGE_OPTIONS, WS_BRIDGE_SUBSCRIPTIONS } from './tokens';
import { WsBridgeOptions } from './types';

@WebSocketGateway({ cors: { origin: '*' } })
export class SocketBridgeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnApplicationBootstrap {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(SocketBridgeGateway.name);
  private initialized = false;

  constructor(
    private readonly redis: RedisService,
    @Inject(WS_BRIDGE_OPTIONS) private readonly opts: WsBridgeOptions,
    @Inject(WS_BRIDGE_SUBSCRIPTIONS) private readonly subscriptions: string[],
  ) { }

  // Гарантированно после onModuleInit у провайдеров
  async onApplicationBootstrap() {
    await this.setupSubscriptions();
  }

  // На случай ожиданий стороннего кода именно от afterInit
  async afterInit() {
    await this.setupSubscriptions();
  }

  private async setupSubscriptions() {
    if (this.initialized) return;

    if (!this.subscriptions?.length) {
      this.logger.warn('No subscriptions passed to WsBridge');
      return;
    }

    for (const channel of this.subscriptions) {
      try {
        await this.redis.subscribe(channel, (message: string) => {
          let payload: unknown = message;
          if (this.opts.parseJson) {
            try {
              payload = JSON.parse(message);
            } catch {
              /* noop */
            }
          }
          this.server.emit(channel, payload);
        });
      } catch (e) {
        this.logger.error(`Failed to subscribe ${channel}: ${String(e)}`);
      }
    }

    this.initialized = true;
    if (this.opts.log) this.logger.log(`Initialized with ${this.subscriptions.length} subscriptions`);
  }

  handleConnection(client: Socket) {
    if (this.opts.log) this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    if (this.opts.log) this.logger.log(`Client disconnected: ${client.id}`);
  }

  // 🔎 Health check: s.emit('health') -> 'health:ok'
  @SubscribeMessage('health')
  handleHealth(client: Socket) {
    client.emit('health:ok', { ok: true, t: Date.now() });
  }

  // Пример эхо-сообщения
  @SubscribeMessage('message')
  handleMessage(client: Socket, data: any) {
    client.emit('response', { message: `Принято: ${data?.text ?? ''}` });
  }
}
