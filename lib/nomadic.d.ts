declare namespace Nomadic {

  type Action = 'up' | 'create' | 'down';
  interface Options {
    database?: string;
    migrations?: string;
    host?: string;
    user?: string;
    password?: string;
    port?: number;
    config?: string;
    skip?: boolean
  }
  
  type ConfigArgs = Omit<Required<Options>, 'config' | 'action' | 'count'>
}