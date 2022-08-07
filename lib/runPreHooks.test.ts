import mock from 'mock-fs';
import path from 'path';
import { Client } from 'pg';
import { down } from './down';
import { Nomadic } from './nomadic';
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

describe('pre hooks', () => {
  const db = new Client({
    database: 'nomadic-test',
    host: 'localhost',
    port: 5432,
  });

  let preHooks: Nomadic.Hooks = resetHooks();
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
  
  describe('when skip is false and pre hooks are defined for up', () => {
    beforeEach(async () => {
      preHooks = resetHooks();
      await dropMigrationsTable(db);
      await dropTestTables(db);
      await setupConfigAndRun({ ...args, preHooks }, () => up(1, args), 'up');
    });
    it('runs the up pre hook', () => {
      expect(preHooks.up).toBeCalled();
    });

    it('does not run the down pre hook', () => {
      expect(preHooks.down).not.toHaveBeenCalled();
    });
  });

  describe('when skip is false and preHooks are defined for down', () => {
    beforeEach(async () => {
      preHooks = resetHooks();
      await dropMigrationsTable(db);
      await dropTestTables(db);
      await up(1, args);
      await setupConfigAndRun({ ...args, preHooks }, () => down(1, args), 'down');
    });

    it('runs the down pre hook', async () => {
      expect(preHooks.down).toBeCalled();
    });

    it('does not run the up pre hook', () => {
      expect(preHooks.up).not.toHaveBeenCalled();
    });
  });
});