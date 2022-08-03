import { Client } from 'pg';
import PgTools from 'pgtools';
import { nfcall } from 'q';

export async function run() {
  const database = 'nomadic-test';
  console.log('Dropping database', database);
  const schema = 'nomadic';
  const schema2 = 'nomadic_hidden';
  const config: PgTools.PgToolsConfig = {
    host: 'localhost',
    port: 5432,
  };
  const client = new Client({
    ...config,
    database,
  });
  try {
    await client.connect();
    await client.query(
      `SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname=$1
        AND pid <> pg_backend_pid();`,
      [database]
    );
    await client.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await client.query(`DROP SCHEMA IF EXISTS ${schema2} CASCADE`);
    await client.end();
  } catch (error) {
    console.log('Error closing connections or dropping schema', schema);
  } finally {
    await client.end();
  }

  try {
    await nfcall(PgTools.dropdb, config, database);

    console.log('Database', database, 'dropped');
  } catch (error) {
    console.log(
      'Could not drop database',
      `${database}. Maybe it doesn't exist?`
    );
  }
}

if (require.main === module) {
  run();
}
