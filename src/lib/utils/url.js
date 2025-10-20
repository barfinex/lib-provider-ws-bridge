"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRedisUrl = buildRedisUrl;
function buildRedisUrl(cfg) {
    if (!cfg)
        return 'redis://localhost:6379';
    if (cfg.url)
        return cfg.url;
    const host = cfg.host ?? 'localhost';
    const port = cfg.port ?? 6379;
    return `redis://${host}:${port}`;
}
//# sourceMappingURL=url.js.map