import { Client } from 'pg';
import ensureMigrationTable from './util/ensureMigrationTable';
import glob from 'glob-promise';
import { GET_LAST_N_MIGRATIONS, SQL_INSERT_MIGRATION } from './util/sql';
import { formatDate } from './util/parsing';
import path from 'path';

function isCountAll(count: string | number): count is string {
  if (count === 'all') {
    return true;
  }

  return false;
}

async function getMigrationFilesToRun(args: Nomadic.ConfigArgs) {
  const files = await glob(`${args.migrations}/*.js`);

  return files.map(f => {
    return path.basename(f);
  });
}

interface MigrationRow {
  run_on: Date;
  name: string;
  id: number;
}

interface Migration {
  up: (db: Client) => Promise<void>;
  down: (db: Client) => Promise<void>
}

async function getLaterMigrations(
  countOrAll: number | string, 
  files: string[],
  client: Client 
) {
  // as the numbers are formatted, they're easy to sort
  // last run in the dark ages, should have no problems
  let lastRunOn: Date = new Date('01-01-1000'); 
  // might not have any migrations at all

  try {
    // first get the highest run so far
    const lastNResult = await client.query<MigrationRow>(
      GET_LAST_N_MIGRATIONS, [1] // limit 1
    );

    if (lastNResult.rowCount > 0) {
      
      const lastRun = lastNResult.rows[0];
  
      lastRunOn = lastRun.run_on;
    }
  } catch (error) {
    console.error(error);
  }

  const lastRunNum = parseInt(formatDate(lastRunOn));

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
      await client.query('BEGIN');
      await migrationSql.up(client);
      await client.query(
        SQL_INSERT_MIGRATION,
        [`/${migrationName}`]
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
    }
    // require the file and run its exported `up` method,
    // passing in the client
    // and we're done!
  }
}

async function runUpN(
  files: string[],
  count: number, 
  client: Client, 
  args: Nomadic.ConfigArgs
) {
  const laterMigrations = await getLaterMigrations(
    count,
    files,
    client
  );

  await runUpMigrations(laterMigrations, args, client);
}

async function runUpAll(
  files: string[],
  client: Client, 
  args: Nomadic.ConfigArgs
) {
  const laterMigrations = await getLaterMigrations(
    'all',
    files,
    client
  );

  await runUpMigrations(laterMigrations, args, client);
}

export async function up(countOrAll: string | number, args: Nomadic.ConfigArgs) {
  const client = new Client({
    database: args.database,
    host: args.host,
    port: args.port,
    user: args.user,
    password: args.password,
  });

  await client.connect();
  
  await ensureMigrationTable(client);

  const files = await getMigrationFilesToRun(args);

  if (!files.length) {
    console.log('No migrations to run');
  } else {
    // get highest run migration in migrations table
    if (isCountAll(countOrAll)) {
      await runUpAll(files,client, args);
    } else {
      await runUpN(files,countOrAll, client, args);
    }

  }

  await client.end();
}