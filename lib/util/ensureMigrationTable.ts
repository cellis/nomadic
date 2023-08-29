import { Client } from 'pg';
import { FIND_MIGRATION_TABLE_QUERY, SQL_CREATE_MIGRATIONS_TABLE } from './sql';
import { Nomadic } from '../nomadic';

export default async function(client: Client, args: Nomadic.ConfigArgs) {
  const migrationTableResult = await client.query(FIND_MIGRATION_TABLE_QUERY, 
    [args.migrationsTable || 'migrations']);

  if (migrationTableResult.rowCount === 0) {
    await client.query(SQL_CREATE_MIGRATIONS_TABLE);
  }
}