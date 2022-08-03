import { Client } from 'pg';
import PgTools from 'pgtools';
import { nfcall } from 'q';
import onExit from 'signal-exit';
import { run as dropDatabase } from './dropDatabase';

export async function run(watch: boolean) {
  const database = 'nomadic-test';
  const schema = 'nomadic';
  const schema2 = 'nomadic_hidden';
  const config: PgTools.PgToolsConfig = {
    host: 'localhost',
    port: 5432,
  };

  // first check if we already have the db while in watch mode:
  const pgClient = new Client({
    ...config,
    database: 'postgres',
  });

  await pgClient.connect();

  const {
    rows: [checkResult],
  } = await pgClient.query<{ exists: boolean }>(
    `SELECT EXISTS(
      SELECT datname FROM 
      pg_catalog.pg_database 
      WHERE lower(datname) = lower('${database}')
    );`
  );

  await pgClient.end();

  if (checkResult.exists) {
    console.log('Database', database, 'was already created');
    return;
  }

  console.log('Creating database', database);

  try {
    await nfcall(PgTools.createdb, config, database);

    console.log('Database', database, 'created');
  } catch (error) {
    console.log('Already have a database named', database);
  }

  try {
    const client = new Client({
      ...config,
      database,
    });

    await client.connect();
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schema2}`);
    await client.end();
    console.log('schema', schema, 'created');
    console.log('schema', schema2, 'created');
  } catch (error) {
    console.log('Could not create a schema named', schema);
  }

  if (watch) {
    onExit(async () => {
      // watching
      console.log('My watch has ended, drop the dab');
      await dropDatabase();
    });
  }
}

if (require.main === module) {
  run(false);
}
