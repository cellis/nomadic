import colors from 'colors';
import path from 'path';
import { Client, QueryResult } from 'pg';
import { 
  GET_LAST_N_MIGRATIONS, 
  MIGRATIONS_TABLE, 
  SQL_DELETE_MIGRATION, 
  SQL_GET_ALL_MIGRATIONS, 
} from '../util/sql';
import { Migration, MigrationRow, RunAll, RunN } from './types';
import debug from 'debug';
import { Nomadic } from '../nomadic';
import getQueryErrorLine from '../util/getQueryErrorLine';
import { readFile } from 'fs/promises';

const log = debug('nomadic');

export const runDownMigrations = async (
  migrations: QueryResult<MigrationRow>,
  client: Client, 
  args: Nomadic.ConfigArgs
) => {
  // get ids to drop
  const migrationFiles = migrations.rows.map(
    (row) =>({ name: row.name, id: row.id, file: path.join(args.migrations, `${row.name}.js`) })
  );

  for(const info of migrationFiles) {
    const { file: migrationFile, id, name: migrationName } = info;
    // run all down in a transaction while deleting
    // eslint-disable-next-line
    const migration: Migration = require(migrationFile);

    try {
      await client.query('BEGIN');
      await migration.down(client, args.transform);
      await client.query(SQL_DELETE_MIGRATION
        .replace(MIGRATIONS_TABLE, 
          args.migrationsTable || MIGRATIONS_TABLE), [id]);
      await client.query('COMMIT');
    } catch (error: any) {
      await client.query('ROLLBACK');

      // find the script
      const errScript = await readFile(path.join(
        args.migrations,'sqls', `${migrationName}-down.sql`));
      const errScriptTransformed = args.transform ? 
        await args.transform(errScript.toString()) : errScript.toString();
      const errLine = getQueryErrorLine(errScriptTransformed, error);
      
      log('Error %s in down migration, rolling back. line: %s', 
      error.message, error.line);
      
      
      console.log(colors.magenta(
        `[nomadic]: Encountered an error while running ${
          migrationName
        }-down.sql: ${error.message} at line ${errLine}`
      ));
      console.log(`[nomadic]: Rolling back ${migrationName} and stopping.`);

      process.exit();
    }
  }
};

export const runDownN: RunN = async (
  files: string[],
  count: number, 
  client: Client, 
  args: Nomadic.ConfigArgs
) => {
  // get last N migrations
  const migrations = await client.query<MigrationRow>(
    GET_LAST_N_MIGRATIONS.replace(MIGRATIONS_TABLE, 
      args.migrationsTable || MIGRATIONS_TABLE),[count]
  );

  return runDownMigrations(migrations, client, args);
};

export const runDownAll: RunAll = async (
  files: string[],
  client: Client, 
  args: Nomadic.ConfigArgs
) => {
  // drop all migrations
  const migrations = await client.query<MigrationRow>(
    SQL_GET_ALL_MIGRATIONS
      .replace(MIGRATIONS_TABLE, 
        args.migrationsTable || MIGRATIONS_TABLE)
  );

  return runDownMigrations(migrations, client, args);
};
