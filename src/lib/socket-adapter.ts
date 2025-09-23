import { INestApplication } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';

export interface ProviderSocketAdapterOptions {
    path?: string; // <-- хотим '/ws' по умолчанию
    cors?: {
        origin: string | string[] | boolean;
        credentials?: boolean;
    };
    // любые другие опции socket.io можно прокинуть сюда при необходимости
}

export class ProviderSocketAdapter extends IoAdapter {
    constructor(private readonly app: INestApplication, private readonly opts: ProviderSocketAdapterOptions) {
        super(app);
    }

    override createIOServer(port: number, options?: any) {
        const server = super.createIOServer(port, {
            ...(options || {}),
            path: this.opts.path ?? '/ws', // <-- дефолт: /ws
            cors: this.opts.cors ?? { origin: '*', credentials: true },
        });
        return server;
    }
}

/** Устанавливает кастомный адаптер с путём `/ws` по умолчанию. */
export function applyProviderWsAdapter(app: INestApplication, opts: ProviderSocketAdapterOptions = {}) {
    app.useWebSocketAdapter(new ProviderSocketAdapter(app, { path: '/ws', ...opts }));
}
