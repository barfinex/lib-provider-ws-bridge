"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SocketBridgeGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketBridgeGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const redis_service_1 = require("./redis.service");
const tokens_1 = require("./tokens");
let SocketBridgeGateway = SocketBridgeGateway_1 = class SocketBridgeGateway {
    constructor(redis, opts, subscriptions) {
        this.redis = redis;
        this.opts = opts;
        this.subscriptions = subscriptions;
        this.logger = new common_1.Logger(SocketBridgeGateway_1.name);
        this.initialized = false;
    }
    async onApplicationBootstrap() {
        await this.setupSubscriptions();
    }
    async afterInit() {
        await this.setupSubscriptions();
    }
    async setupSubscriptions() {
        if (this.initialized)
            return;
        if (!this.subscriptions?.length) {
            this.logger.warn('No subscriptions passed to WsBridge');
            return;
        }
        for (const channel of this.subscriptions) {
            try {
                await this.redis.subscribe(channel, (message) => {
                    let payload = message;
                    if (this.opts.parseJson) {
                        try {
                            payload = JSON.parse(message);
                        }
                        catch {
                        }
                    }
                    this.server.emit(channel, payload);
                });
            }
            catch (e) {
                this.logger.error(`Failed to subscribe ${channel}: ${String(e)}`);
            }
        }
        this.initialized = true;
        if (this.opts.log)
            this.logger.log(`Initialized with ${this.subscriptions.length} subscriptions`);
    }
    handleConnection(client) {
        if (this.opts.log)
            this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        if (this.opts.log)
            this.logger.log(`Client disconnected: ${client.id}`);
    }
    handleHealth(client) {
        client.emit('health:ok', { ok: true, t: Date.now() });
    }
    handleMessage(client, data) {
        client.emit('response', { message: `Принято: ${data?.text ?? ''}` });
    }
};
exports.SocketBridgeGateway = SocketBridgeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SocketBridgeGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], SocketBridgeGateway.prototype, "handleHealth", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], SocketBridgeGateway.prototype, "handleMessage", null);
exports.SocketBridgeGateway = SocketBridgeGateway = SocketBridgeGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: '*' } }),
    __param(1, (0, common_1.Inject)(tokens_1.WS_BRIDGE_OPTIONS)),
    __param(2, (0, common_1.Inject)(tokens_1.WS_BRIDGE_SUBSCRIPTIONS)),
    __metadata("design:paramtypes", [redis_service_1.RedisService, Object, Array])
], SocketBridgeGateway);
//# sourceMappingURL=socket.gateway.js.map