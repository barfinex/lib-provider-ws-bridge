"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderSocketAdapter = void 0;
exports.applyProviderWsAdapter = applyProviderWsAdapter;
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
class ProviderSocketAdapter extends platform_socket_io_1.IoAdapter {
    constructor(app, opts) {
        super(app);
        this.app = app;
        this.opts = opts;
    }
    createIOServer(port, options) {
        const server = super.createIOServer(port, {
            ...(options || {}),
            path: this.opts.path ?? '/ws',
            cors: this.opts.cors ?? { origin: '*', credentials: true },
        });
        return server;
    }
}
exports.ProviderSocketAdapter = ProviderSocketAdapter;
function applyProviderWsAdapter(app, opts = {}) {
    app.useWebSocketAdapter(new ProviderSocketAdapter(app, { path: '/ws', ...opts }));
}
//# sourceMappingURL=socket-adapter.js.map