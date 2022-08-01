declare namespace Nomadic {
  interface Args {
    action: 'up' | 'create' | 'down';
    pathOrCount: string;
    database?: string;
    migrations?: string;
    host?: string;
    user?: string;
    password?: string;
    config?: string;

  }
  
  type ConfigArgs = Omit<Required<Args>, 'config' | 'action' | 'count'>
}