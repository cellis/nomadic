export namespace Nomadic {
  /**
   * An instance of pg.Client 
   */
  export type Action = 'up' | 'create' | 'down';

  // eslint-disable-next-lin

  export interface Result<T> {
    rows: T[],
    rowCount: number;
  }
  export interface Client {
    query: <T = any>(sql: string, args?: any[]) => Promise<Result<T>>
  }
  export interface Hooks {
    up?: (client: Client) => Promise<void>;
    down?: (client: Client) => Promise<void>;
    create?: (client: Client) => Promise<void>;
  }

  export type TransformFn = (sql: string) => Promise<string> | string
  export interface Transform {
    transform?: TransformFn
  }
  export type Options = {
    database?: string;
    migrations?: string;
    host?: string;
    user?: string;
    password?: string;
    port?: number;
    config?: string;
    skip?: boolean;
    hooksFile?: string;
    hooks?: Hooks;
    
  } & Transform;
  // 
    // 'config' | 'action' | 'count' | 'hooksFile' | 'hooks' | 'transform'
  export type ConfigArgs = Required<Pick<Options, 
    'database' | 
    'password' | 
    'host' | 
    'user' |
    'port' |
    'skip' |
    'migrations'
  >> & Transform;
}