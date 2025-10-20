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
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const redis_1 = require("redis");
const tokens_1 = require("./tokens");
const url_1 = require("./utils/url");
let RedisService = RedisService_1 = class RedisService {
    constructor(opts) {
        this.opts = opts;
        this.logger = new common_1.Logger(RedisService_1.name);
        this.subscribed = new Set();
    }
    async onModuleInit() {
        try {
            await this.ensureConnected();
        }
        catch (e) {
            this.logger.warn(`Redis initial connect failed (will retry on first subscribe): ${String(e)}`);
        }
    }
    async ensureConnected() {
        if (this.subscriber && this.subscriber.isOpen)
            return;
        if (this.connectPromise)
            return this.connectPromise;
        const url = (0, url_1.buildRedisUrl)(this.opts.redis);
        const client = (0, redis_1.createClient)({ url });
        client.on('error', (err) => this.logger.error('Redis error', err));
        this.connectPromise = (async () => {
            await client.connect();
            this.subscriber = client;
            if (this.opts.log)
                this.logger.log(`Connected to Redis at ${url}`);
        })();
        try {
            await this.connectPromise;
        }
        finally {
            this.connectPromise = undefined;
        }
    }
    async subscribe(channel, cb) {
        await this.ensureConnected();
        await this.subscriber.subscribe(channel, cb);
        this.subscribed.add(channel);
        if (this.opts.log)
            this.logger.log(`Subscribed: ${channel}`);
    }
    async onModuleDestroy() {
        try {
            if (this.subscriber?.isOpen) {
                for (const ch of this.subscribed) {
                    try {
                        await this.subscriber.unsubscribe(ch);
                    }
                    catch { }
                }
                await this.subscriber.quit();
            }
        }
        catch { }
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tokens_1.WS_BRIDGE_OPTIONS)),
    __metadata("design:paramtypes", [Object])
], RedisService);
//# sourceMappingURL=redis.service.js.map