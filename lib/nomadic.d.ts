// import { Client } from 'pg';

declare namespace Nomadic {
  /**
   * An instance of pg.Client 
   */
  type Action = 'up' | 'create' | 'down';

  interface Result<T> {
    rows: T[],
    rowCount: number;
  }
  interface Client {
    query: <T = any>(sql: string, args?: any[]) => Promise<Result<T>>
  }
  interface Hooks {
    up?: (client: any) => Promise<void>;
    down?: (client: any) => Promise<void>;
    create?: (client: Client) => Promise<void>;
  }
  interface Options {
    database?: string;
    migrations?: string;
    host?: string;
    user?: string;
    password?: string;
    port?: number;
    config?: string;
    skip?: boolean;
    hooksFile?: string;
    hooks?: Hooks
  }
  
  type ConfigArgs = Omit<Required<Options>, 'config' | 'action' | 'count' | 'hooksFile' | 'hooks'>
}