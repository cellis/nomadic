import path from 'path';

export interface SpiedConsole {
  console?: jest.SpyInstance;
}

export function spyConsole() {
  const spy: SpiedConsole = {};

  beforeEach(() => {
    spy.console = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    spy.console?.mockClear();
  });

  afterAll(() => {
    spy.console?.mockRestore();
  });

  return spy;
}

export function getMigrationPath() {
  return path.join(process.cwd(),'migrations');
}