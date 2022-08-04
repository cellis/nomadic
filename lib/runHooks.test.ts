import mock from 'mock-fs';
import path from 'path';
import { Client } from 'pg';
import { down } from './down';
import { setupConfigAndRun } from './setupConfigAndRun';
import mockMigrationFiles from './test/fixtures/files/mockMigrationFiles';
import { getMigrationPath } from './test/helpers';
import { up } from './up';
import { dropMigrationsTable, dropTestTables } from './util/db';
import { MIGRATIONS_TABLE } from './util/sql';
function resetHooks() {
  return {
    up: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue(null),
    down: jest.fn().mockResolvedValue(null),
  };
}

describe('hooks', () => {
  const db = new Client({
    database: 'nomadic-test',
    host: 'localhost',
    port: 5432,
  });

  let hooks: Nomadic.Hooks = resetHooks();
  const args: Nomadic.ConfigArgs = {
    migrations: path.join(process.cwd(),MIGRATIONS_TABLE),
    database: 'nomadic-test',
    host: 'localhost',
    skip: false,
    user: 'postgres',
    password: '',
    port: 5432,
  };

  beforeAll(() => {
    return db.connect();
  });
  
  beforeEach(() => {
    const migrationPath = getMigrationPath();
    mockMigrationFiles(migrationPath);
  });

  afterEach(() => {
    mock.restore();
  });

  afterAll(() => {
    return db.end();
  });
  
  describe('when skip is false and hooks are defined for up', () => {
    beforeEach(async () => {
      hooks = resetHooks();
      await dropMigrationsTable(db);
      await dropTestTables(db);
      await setupConfigAndRun({ ...args, hooks }, () => up(1, args), 'up');
    });
    it('runs the up hook', () => {
      expect(hooks.up).toBeCalled();
    });

    it('does not run the down hook', () => {
      expect(hooks.down).not.toHaveBeenCalled();
    });
  });

  describe('when skip is false and hooks are defined for down', () => {
    beforeEach(async () => {
      hooks = resetHooks();
      await dropMigrationsTable(db);
      await dropTestTables(db);
      await up(1, args);
      await setupConfigAndRun({ ...args, hooks }, () => down(1, args), 'down');
    });

    it('runs the down hook', async () => {
      expect(hooks.down).toBeCalled();
    });

    it('does not run the up hook', () => {
      expect(hooks.up).not.toHaveBeenCalled();
    });
  });
});