import path from 'path';
import { Client } from 'pg';
import { up } from './up';
import mock from 'mock-fs';
import { 
  MIGRATIONS_TABLE, 
} from './util/sql';

import mockMigrationFiles from 
  './test/fixtures/files/mockMigrationFiles';
import { getMigrationPath } from './test/helpers';
import { dropMigrationsTable, dropTestTables } from './util/db';
import { down } from './down';

describe('down', () => {
  const db = new Client({
    database: 'nomadic-test',
    host: 'localhost',
    port: 5432,
  });

  const args: Nomadic.ConfigArgs = {
    migrations: path.join(process.cwd(),MIGRATIONS_TABLE),
    database: 'nomadic-test',
    host: 'localhost',
    skip: true,
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

  describe('count is 2 and already have 2', () => {
    const ALREADY_HAVE = 4;
    beforeEach(async () => {
      await dropMigrationsTable(db);
      await dropTestTables(db);
      await up(ALREADY_HAVE, args);
    });
    it('runs <count> down migrations', async () => {
      // find last N migrations
      // const lastNMigrations = await db.query(GET_LAST_N_MIGRATIONS)
      await down(2, args);

      // ensure that going down 2 leaves migrations with 2 rows
      const migrations = await db.query('SELECT * from migrations');

      expect(migrations.rowCount).toBe(2);
    });
  });
});