import path from 'path';
import { Client } from 'pg';
import { up } from './up';
import mock from 'mock-fs';
import { 
  FIND_MIGRATION_TABLE_QUERY, 
  FIND_MULTIPLE_TABLE_QUERY, 
  GET_FIRST_N_MIGRATIONS, 
  MIGRATIONS_TABLE, 
  SQL_SELECT_MIGRATIONS, 
} from './util/sql';

import mockMigrationFiles, { MIGRATION_ORDER } from 
  './test/fixtures/files/mockMigrationFiles';
import { getMigrationPath } from './test/helpers';
import { dropMigrationsTable, dropTestTables, getNonCommentTables } from './util/db';
import debug from 'debug';

const log = debug('nomadic');

describe('up', () => {
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

  describe('no migration table', () => {
    it('creates the migration table', async () => {
      await dropMigrationsTable(db);
      await up('all', args);

      // query db to find migration table.
      const migrationsTableResult = 
        await db.query(FIND_MIGRATION_TABLE_QUERY, [MIGRATIONS_TABLE]);

      expect(migrationsTableResult.rowCount).toBe(1);
    });
  });

  describe('pending migrations', () => {
    describe('count is a number', () => {
      const COUNT = 2;
      
      beforeEach(async () => {
        await dropMigrationsTable(db);
        await dropTestTables(db);
      
        await up(COUNT, args);
      });
      
      it('runs the next <count> migration(s)', async () => {
        // we expect to to find the first 2 tables
        const tablesResult = 
          await db.query(FIND_MULTIPLE_TABLE_QUERY, [[
            MIGRATION_ORDER[0].name,
            MIGRATION_ORDER[1].name,
          ]]);

        expect(tablesResult.rowCount).toBe(COUNT);
      });

      it('adds the next <count> migration(s) to the migration table',async () => {
        await up(COUNT, args);
        
        const migrationsResult = await db.query(SQL_SELECT_MIGRATIONS);

        expect(migrationsResult.rowCount).toBe(COUNT + COUNT);
      });
    });

    describe('count is number and already have 2 migrations', () => {
      const ALREADY_HAVE = 2;
      beforeEach(async () => {
        await dropMigrationsTable(db);
        await dropTestTables(db);
        await up(ALREADY_HAVE, args);
      });

      it('does not modify or run existing migrations', async () => {
        // get old run_on for existing rows, compare to new run_on for existing_rows
        // get the first <ALREADY_HAVE> migrations
        const existingMigrationsResultBefore = 
          await db.query(GET_FIRST_N_MIGRATIONS, [ALREADY_HAVE]);
        
        expect(existingMigrationsResultBefore.rowCount).toBe(ALREADY_HAVE);

        await up(3, args);
        
        const existingMigrationsResultAfter = 
          await db.query(GET_FIRST_N_MIGRATIONS, [ALREADY_HAVE]);

        expect(existingMigrationsResultBefore).toMatchObject(
          existingMigrationsResultAfter
        );
      });

      it('runs only the latest <count> migrations', async () => {
        const allTablesAfterBeforeUp = await db.query(
          FIND_MULTIPLE_TABLE_QUERY, [
            getNonCommentTables(),
          ]
        );

        log('tables after before up %o', allTablesAfterBeforeUp);

        await up(3, args);

        const tablesExpected = MIGRATION_ORDER.slice(0,-ALREADY_HAVE);

        log('tables expected %o', tablesExpected);

        const tablesResult = await db.query(FIND_MULTIPLE_TABLE_QUERY,[
          getNonCommentTables(),
        ]);

        log('tables result %o', tablesResult.rows);

        expect(tablesResult.rowCount).toBe(tablesExpected.length);
      });
    });

    describe('count is "all"', () => {
      beforeEach(async () => {
        await dropMigrationsTable(db);
        await dropTestTables(db);
        await up(2, args);
      });

      it('runs all remaining migrations', async () => {
        const migrationsResultBefore = await db.query(SQL_SELECT_MIGRATIONS);

        log('migrations results before %o', migrationsResultBefore);
        
        await up('all', args);

        const migrationsResult = await db.query(SQL_SELECT_MIGRATIONS);

        log('migrations results after %o', migrationsResult);

        // expect to find all migrations
        expect(migrationsResult.rowCount).toBe(MIGRATION_ORDER.length);
      });
  
      it('adds all remaining migrations to the migration table',async () => {
        await up('all', args);

        const tablesResult = await db.query(FIND_MULTIPLE_TABLE_QUERY,
          // don't want to look for the comment
          [getNonCommentTables()]
        );

        log('tables found %o', tablesResult.rows);
        
        // expect to find all tables
        expect(tablesResult.rowCount).toBe(MIGRATION_ORDER.length-1);
      });
    });
  });
});