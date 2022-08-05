import mock from 'mock-fs';
import path from 'path';
import { Client } from 'pg';
import { down } from './down';
import { Nomadic } from './nomadic';
import mockMigrationFiles from './test/fixtures/files/mockMigrationFiles';
import { getMigrationPath } from './test/helpers';
import { up } from './up';
import { dropMigrationsTable, dropTestTables, getNonCommentTables } from './util/db';
import { FIND_MULTIPLE_TABLE_QUERY, MIGRATIONS_TABLE, SQL_COMMENT_TEMPLATE } from './util/sql';

describe('transform', () => {
  const db = new Client({
    database: 'nomadic-test',
    host: 'localhost',
    port: 5432,
  });

  const transform: Nomadic.Transform = {
    transform: () => {
      // in this case we're simply rewriting all sql to be the comment
      return SQL_COMMENT_TEMPLATE;
    },
  };
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
  
  describe('when transform is in args for up', () => {
    beforeEach(async () => {
      await dropMigrationsTable(db);
      await dropTestTables(db);
      await up('all', { ...args, ...transform });
    });
    it('rewrites sql', async () => {
      const findAllTables = await db.query(
        FIND_MULTIPLE_TABLE_QUERY, [getNonCommentTables()]);

      expect(findAllTables.rowCount).toBe(0);
    });
  });

  describe('when transform is in args for down', () => {
    beforeEach(async () => {
      await dropMigrationsTable(db);
      await dropTestTables(db);
      await up('all', args);
      await down(10, { ...args, ...transform });
    });
    it('rewrites sql', async () => {
      const nonCommentTables = getNonCommentTables();
      const findAllTables = await db.query(
        FIND_MULTIPLE_TABLE_QUERY, [nonCommentTables]);

      expect(findAllTables.rowCount).toBe(nonCommentTables.length);
    });
  });
});