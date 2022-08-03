declare module 'pgtools' {
  interface PgToolsConfig {
    user?: string;
    port: number;
    host: string;
    password?: string;
    ssl?: boolean;
  }

  export function dropdb(
    config: PgToolsConfig,
    database: string,
    callback: <T = any>(err: Error | null, res: T) => void
  ): void;

  export function createdb(
    config: PgToolsConfig,
    database: string,
    callback: <T = any>(err: Error | null, res: T) => void
  ): void;
}
