import colors from 'colors';
import path from 'path';
import { Client } from 'pg';
import { GET_LAST_N_MIGRATIONS, MIGRATIONS_TABLE, SQL_INSERT_MIGRATION } from '../util/sql';
import isCountAll from './isCountAll';
import { Migration, MigrationRow, RunN } from './types';
import debug from 'debug';
import { Nomadic } from '../nomadic';
import { readFile } from 'fs/promises';
import getQueryErrorLine from '../util/getQueryErrorLine';

const log = debug('nomadic');

async function getLaterMigrations(
  countOrAll: number | string, 
  files: string[],
  client: Client,
  args: Nomadic.ConfigArgs
) {
  // as the numbers are formatted, they're easy to sort
  // last run in the dark ages, should have no problems
  let lastRunName = '0';
  // might not have any migrations at all
  try {
    // first get the highest run so far
    const lastNResult = await client.query<MigrationRow>(
      GET_LAST_N_MIGRATIONS.replace(MIGRATIONS_TABLE, 
        args.migrationsTable || MIGRATIONS_TABLE), [1] // limit 1
    );

    if (lastNResult.rowCount > 0) {
      
      const lastRun = lastNResult.rows[0];
  
      lastRunName = `${lastRun.name.slice(1).split('-').shift()}`;
    }
  } catch (error) {
    console.error(error);
  }

  const lastRunNum = parseInt(lastRunName);

  log('Last run %o', lastRunNum);
  // filter all files by the ones whose dates 
  // are larger than last run on
  let laterMigrations = files.filter((fileName) => {
    const fileDateNum = parseInt(`${fileName.split('-').shift()}`);

    return fileDateNum > lastRunNum;
  }).sort((a, b) => {
    const aNum = parseInt(`${a.split('-').shift()}`);
    const bNum = parseInt(`${b.split('-').shift()}`);

    return aNum - bNum;
  });

  if (!isCountAll(countOrAll)) {
    // go up by no more than N
    laterMigrations = laterMigrations.slice(0,countOrAll);
  }

  log('Later migrations %o',{ laterMigrations });

  return laterMigrations;
}

async function runUpMigrations(
  laterMigrations: string[], 
  args: Nomadic.ConfigArgs, 
  client: Client
) {
  // have all the migrations sorted by date
  // time to run them
  for (const migrationJsName of laterMigrations) {
    // load the up sql
    // eslint-disable-next-line
    const migrationSql: Migration = require(
      path.join(args.migrations, migrationJsName)
    );

    const migrationName = migrationJsName.replace('.js', '');

    try {

      // need this in a transaction so both the up and 
      // the insert of the migration row succeed or fail

      if(!migrationSql.skipTransaction) {

        await client.query('BEGIN');

        await migrationSql.up(client, args.transform);
        await client.query(
          SQL_INSERT_MIGRATION.replace(MIGRATIONS_TABLE, 
            args.migrationsTable || MIGRATIONS_TABLE),
          [`/${migrationName}`]
        );
        await client.query('COMMIT');
      } else {
        log('Skipping transaction for %s', migrationName);
        console.log(colors.magenta('[nomadic]: Skipping transaction for'), migrationName);
        await migrationSql.up(client, args.transform);
        await client.query(
          SQL_INSERT_MIGRATION.replace(MIGRATIONS_TABLE, 
            args.migrationsTable || MIGRATIONS_TABLE),
          [`/${migrationName}`]
        );
      }
    } catch (error: any) {
      if (!migrationSql.skipTransaction) {
        await client.query('ROLLBACK');
      }
       // find the script
      const errScript = await readFile(path.join(
        args.migrations, 'sqls', `${migrationName}-up.sql`));
      const errScriptTransformed = args.transform ? 
        await args.transform(errScript.toString()) : errScript.toString();
      const errLine = getQueryErrorLine(errScriptTransformed, error);
      
      log('Error %s in up migration, rolling back. line: %s', 
      error.message, error.line);
      
      
      console.log(colors.magenta(
        `[nomadic]: Encountered an error while running ${
          migrationName
        }-up.sql: ${error.message} at line ${errLine}`
      ));

      process.exit();
    }
    // require the file and run its exported `up` method,
    // passing in the client
    // and we're done!
  }
}

export const runUpN: RunN = async (
  files: string[],
  count: number, 
  client: Client, 
  args: Nomadic.ConfigArgs
) => {
  const laterMigrations = await getLaterMigrations(
    count,
    files,
    client,
    args
  );

  await runUpMigrations(laterMigrations, args, client);
};

export async function runUpAll(
  files: string[],
  client: Client, 
  args: Nomadic.ConfigArgs
) {
  const laterMigrations = await getLaterMigrations(
    'all',
    files,
    client,
    args
  );

  await runUpMigrations(laterMigrations, args, client);
}
