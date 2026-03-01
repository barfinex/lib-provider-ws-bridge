import { INestApplication } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server } from 'socket.io';

export interface ProviderSocketAdapterOptions {
    path?: string; // <-- хотим '/ws' по умолчанию
    cors?: {
        origin: string | string[] | boolean;
        credentials?: boolean;
    };
    // любые другие опции socket.io можно прокинуть сюда при необходимости
}

export class ProviderSocketAdapter extends IoAdapter {
    private ioServer?: Server;

    constructor(private readonly app: INestApplication, private readonly opts: ProviderSocketAdapterOptions) {
        super(app);
    }

    override createIOServer(port: number, options?: any) {
        const mergedOptions = {
            ...(options || {}),
            path: this.opts.path ?? '/ws', // <-- дефолт: /ws
            cors: this.opts.cors ?? { origin: '*', credentials: true },
        };

        // IMPORTANT:
        // Keep a single Socket.IO server instance and attach it to the existing
        // Nest HTTP server. This prevents accidental secondary bind on the same
        // TCP port (EADDRINUSE).
        if (!this.ioServer) {
            const httpServer =
                this.app.getHttpServer?.() ??
                (this.app as any)?.getHttpAdapter?.()?.getHttpServer?.();

            if (httpServer) {
                this.ioServer = new Server(httpServer, mergedOptions);
            } else {
                // Last resort for edge bootstrap order: create detached server.
                // Do NOT bind by port here.
                this.ioServer = new Server(mergedOptions);
            }
        }

        if (mergedOptions?.namespace) {
            return this.ioServer.of(mergedOptions.namespace);
        }

        return this.ioServer;
    }
}

/** Устанавливает кастомный адаптер с путём `/ws` по умолчанию. */
export function applyProviderWsAdapter(app: INestApplication, opts: ProviderSocketAdapterOptions = {}) {
    app.useWebSocketAdapter(new ProviderSocketAdapter(app, { path: '/ws', ...opts }));
}
