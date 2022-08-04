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

describe('hooks', () => {
  const db = new Client({
    database: 'nomadic-test',
    host: 'localhost',
    port: 5432,
  });

  const hooks: Nomadic.Hooks = {
    up: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue(null),
    down: jest.fn().mockResolvedValue(null),
  };
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
    it('runs the up hook', async () => {
      await dropMigrationsTable(db);
      await dropTestTables(db);
      await setupConfigAndRun({ ...args, hooks }, () => up(1, args));
      expect(hooks.up).toBeCalled();
    });
  });

  describe('when skip is false and hooks are defined for down', () => {
    it('runs the down hook', async () => {
      await dropMigrationsTable(db);
      await dropTestTables(db);
      await up(1, args);
      await setupConfigAndRun({ ...args, hooks }, () => down(1, args));
      expect(hooks.down).toBeCalled();
    });
  });
});