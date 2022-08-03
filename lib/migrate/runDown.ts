import colors from 'colors';
import path from 'path';
import { Client } from 'pg';
import { GET_LAST_N_MIGRATIONS, SQL_DELETE_MIGRATION } from '../util/sql';
import { Migration, MigrationRow, RunAll, RunN } from './types';

export const runDownN: RunN = async (
  files: string[],
  count: number, 
  client: Client, 
  args: Nomadic.ConfigArgs
) => {
  // const laterMigrations = await getLaterMigrations(
  //   count,
  //   files,
  //   client
  // );

  // get last N migrations
  const lastNMigrations = await client.query<MigrationRow>(
    GET_LAST_N_MIGRATIONS,[count]
  );

  // find all the migration files 
  const migrationFiles = lastNMigrations.rows.map(
    (row) =>({ id: row.id, file: path.join(args.migrations, `${row.name}.js`) })
  );

  for(const info of migrationFiles) {
    const { file: migrationFile, id } = info;
    // run all down in a transaction while deleting
    // eslint-disable-next-line
    const migration: Migration = require(migrationFile);

    try {
      await client.query('BEGIN');
      migration.down(client);
      await client.query(SQL_DELETE_MIGRATION, [id]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');

      console.log(
        colors.cyan('Error: could not run down for '), 
        colors.magenta(migrationFile),
        colors.cyan(`${error}`)
      );
    }
  }
};

export const runDownAll: RunAll = async (
  files: string[],
  client: Client, 
  args: Nomadic.ConfigArgs
) => {
  return new Promise((resolve) => setTimeout(() => {
    resolve();
  },1000));
};
