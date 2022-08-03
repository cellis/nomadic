import debug from 'debug';
import { Client } from 'pg';
import { 
  SQL_DROP_ACCOUNT_TABLE, 
  SQL_DROP_COUNTRY_TABLE, 
  SQL_DROP_ISSUE_TABLE, 
  SQL_DROP_MESSAGE_TABLE, 
  SQL_DROP_MIGRATIONS_TABLE, 
  SQL_DROP_POST_TABLE, 
  SQL_DROP_RECEIPT_TABLE, 
} from './sql';
const log = debug('nomadic');

export async function dropMigrationsTable(db: Client) {
  try {
    await db.query(SQL_DROP_MIGRATIONS_TABLE);
  } catch (error) {
    log('Error dropping migration table %o', error);
  }
}


export async function dropTestTables(db: Client) {
  try {
    await db.query([
      SQL_DROP_ACCOUNT_TABLE,
      SQL_DROP_RECEIPT_TABLE,
      SQL_DROP_POST_TABLE,
      SQL_DROP_COUNTRY_TABLE,
      SQL_DROP_ISSUE_TABLE,
      SQL_DROP_MESSAGE_TABLE,
    ].join('\n'));
  } catch (error) {
    log('Error dropping test tables %o',error);
  }
}