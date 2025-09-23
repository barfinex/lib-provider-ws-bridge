export type WsChannel = string;

export interface RedisConfig {
  url?: string;
  host?: string;
  port?: number;
}

export interface SocketConfig {
  namespace?: string;
  cors?: {
    origin: string | string[] | boolean;
    credentials?: boolean;
  };
}

export interface WsBridgeOptions {
  redis?: RedisConfig;
  subscriptions: WsChannel[];
  parseJson?: boolean;
  log?: boolean;
  socket?: SocketConfig;
}
