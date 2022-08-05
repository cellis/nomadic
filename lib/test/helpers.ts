import path from 'path';

export interface SpiedConsole {
  console?: jest.SpyInstance;
}

export function getMigrationPath() {
  return path.join(process.cwd(),'migrations');
}