import { create, SQL_TEMPLATE } from './create';
import fs from 'fs';
import path from 'path';
import migrationFile from './templates/migrationFile';

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  promises: {
    writeFile: jest.fn(),
    mkDir: jest.fn(),
  },
}));

describe('when create is in args', () => {
  const args: Nomadic.ConfigArgs = {
    migrations: path.join(process.cwd(),'migrations'),
    database: 'nomadic-test',
    host: 'localhost:5432',
    skip: true,
    user: 'postgres',
    password: '',
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
      path.join(args.migrations, 'sql',
        `${FORMATTED_DATE}-${MIGRATION_NAME}-up.sql`
      ), SQL_TEMPLATE
    );
  });
  
  it('creates an sql down file in the migrations/sql directory', async () => {
    expect(fs.promises.writeFile).toHaveBeenCalledWith(
      path.join(args.migrations, 'sql',
        `${FORMATTED_DATE}-${MIGRATION_NAME}-down.sql`
      ), SQL_TEMPLATE
    );
  });
});