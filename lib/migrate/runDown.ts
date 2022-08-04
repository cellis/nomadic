import colors from 'colors';
import path from 'path';
import { Client, QueryResult } from 'pg';
import { GET_LAST_N_MIGRATIONS, SQL_DELETE_MIGRATION, SQL_GET_ALL_MIGRATIONS } from '../util/sql';
import { Migration, MigrationRow, RunAll, RunN } from './types';
import debug from 'debug';

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
      await client.query(SQL_DELETE_MIGRATION, [id]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');

      log('Error up migration, rolling back %o', error);
      console.log(colors.magenta(
        `[nomadic]: Encountered an error while running ${
          migrationName
        }: ${error}`
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
    GET_LAST_N_MIGRATIONS,[count]
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
  );

  return runDownMigrations(migrations, client, args);
};
