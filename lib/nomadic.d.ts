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
    up?: (client: Client) => Promise<void>;
    down?: (client: Client) => Promise<void>;
    create?: (client: Client) => Promise<void>;
  }

  type TransformFn = (sql: string) => Promise<string> | string
  interface Transform {
    transform?: TransformFn
  }
  type Options = {
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
  type ConfigArgs = Required<Pick<Options, 
    'database' | 
    'password' | 
    'host' | 
    'user' |
    'port' |
    'skip' |
    'migrations'
  >> & Transform;
}