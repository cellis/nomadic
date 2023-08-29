import { create } from './create';
import fs from 'fs';
import path from 'path';
import migrationFile from './templates/migrationFile';
import { SQL_COMMENT_TEMPLATE } from './util/sql';
import { getMigrationPath } from './test/helpers';
import { Nomadic } from './nomadic';

jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn(),
    mkdir: jest.fn(),
    access: jest.fn(),
  },
}));
    

describe('create', () => {
  const args: Nomadic.ConfigArgs = {
    migrations: getMigrationPath(),
    migrationsTable: 'migrations',
    database: 'nomadic-test',
    host: 'localhost',
    skip: true,
    user: 'postgres',
    password: '',
    port: 5432,
  };
  const FORMATTED_DATE = '20220801203510';
  const MIGRATION_NAME = 'hello-world';
  const upDownRelativePathPrefix = `${FORMATTED_DATE}-${MIGRATION_NAME}`;
  beforeEach(async () => {

    jest.useFakeTimers().setSystemTime(new Date('2022-08-01T20:35:10.329Z'));
    
    await create(MIGRATION_NAME, args);
  });

  afterEach(() => {
    jest.useRealTimers();
  });
  it('creates a js file in the migrations directory', async () => {
    expect(fs.promises.writeFile).toHaveBeenCalledWith(
        path.join(args.migrations,
        `${FORMATTED_DATE}-${MIGRATION_NAME}.js`
      ), migrationFile(upDownRelativePathPrefix)
    );
  });

  it('creates an sql up file in the migrations/sql directory', async () => {
    expect(fs.promises.writeFile).toHaveBeenCalledWith(
      path.join(args.migrations, 'sqls',
        `${FORMATTED_DATE}-${MIGRATION_NAME}-up.sql`
      ), SQL_COMMENT_TEMPLATE
    );
  });
  
  it('creates an sql down file in the migrations/sql directory', async () => {
    expect(fs.promises.writeFile).toHaveBeenCalledWith(
      path.join(args.migrations, 'sqls',
        `${FORMATTED_DATE}-${MIGRATION_NAME}-down.sql`
      ), SQL_COMMENT_TEMPLATE
    );
  });
});