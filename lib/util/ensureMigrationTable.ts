import { Client } from 'pg';
import { FIND_MIGRATION_TABLE_QUERY, SQL_CREATE_MIGRATIONS_TABLE } from './sql';

export default async function(client: Client) {
  const migrationTableResult = await client.query(FIND_MIGRATION_TABLE_QUERY, ['migrations']);

  if (migrationTableResult.rowCount === 0) {
    await client.query(SQL_CREATE_MIGRATIONS_TABLE);
  }
}