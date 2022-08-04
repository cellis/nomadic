import mock from 'mock-fs';
import migrationFile from '../../../templates/migrationFile';
import { addDays, formatName } from '../../../util/parsing';
import { 
  SQL_COMMENT_TEMPLATE, 
  SQL_CREATE_ACCOUNT_TABLE, 
  SQL_CREATE_COUNTRY_TABLE, 
  SQL_CREATE_ISSUE_TABLE, 
  SQL_CREATE_MESSAGE_TABLE, 
  SQL_CREATE_POST_TABLE, 
  SQL_CREATE_RECEIPT_TABLE, 
  SQL_DROP_ACCOUNT_TABLE, 
  SQL_DROP_COUNTRY_TABLE, 
  SQL_DROP_ISSUE_TABLE, 
  SQL_DROP_MESSAGE_TABLE, 
  SQL_DROP_POST_TABLE, 
  SQL_DROP_RECEIPT_TABLE,
} from '../../../util/sql';

const date1 = addDays(new Date(), 1);
const date2 = addDays(date1, 1);
const date3 = addDays(date1, 2);
const date4 = addDays(date1, 3);
const date5 = addDays(date1, 4);
const date6 = addDays(date1, 5);
const date7 = addDays(date1, 6);
const comment = formatName('just-a-comment', date7);

export const MIGRATION_ORDER = [
  {
    date: date1,
    name: 'post',
  },
  {
    date: date2,
    name: 'message',
  },
  {
    date: date3,
    name: 'account',
  },
  {
    date: date4,
    name: 'receipt',
  },
  {
    date: date5,
    name: 'country',
  },
  {
    date: date6,
    name: 'issue',
  },
  {
    date: date7,
    name: 'comment',
  },
];

const createPostMigration = formatName(
  'create-post', MIGRATION_ORDER[0].date
);

const createMessageMigration = formatName(
  'create-message', MIGRATION_ORDER[1].date
);

const createAccountMigration = formatName(
  'create-account', MIGRATION_ORDER[2].date
);

const createReceiptMigration = formatName(
  'create-receipt', 
  MIGRATION_ORDER[3].date
);

const createCountryMigration = formatName(
  'create-country', 
  MIGRATION_ORDER[4].date
);

const createIssueMigration = formatName(
  'create-issue', 
  MIGRATION_ORDER[5].date
);


export default function(migrationPath: string) {
  mock({
    [migrationPath]: {
      [`${createPostMigration}.js`]: migrationFile(createPostMigration),
      [`${createMessageMigration}.js`]: migrationFile(createMessageMigration),
      [`${createAccountMigration}.js`]: migrationFile(createAccountMigration),
      [`${createReceiptMigration}.js`]: migrationFile(createReceiptMigration),
      [`${createCountryMigration}.js`]: migrationFile(createCountryMigration),
      [`${createIssueMigration}.js`]: migrationFile(createIssueMigration),
      [`${comment}.js`]: migrationFile(comment),
      'sqls': {
        [`${createPostMigration}-up.sql`]: SQL_CREATE_POST_TABLE,
        [`${createPostMigration}-down.sql`]: SQL_DROP_POST_TABLE,
        [`${createMessageMigration}-up.sql`]: SQL_CREATE_MESSAGE_TABLE,
        [`${createMessageMigration}-down.sql`]: SQL_DROP_MESSAGE_TABLE,
        [`${createAccountMigration}-up.sql`]: SQL_CREATE_ACCOUNT_TABLE,
        [`${createAccountMigration}-down.sql`]: SQL_DROP_ACCOUNT_TABLE,
        [`${createReceiptMigration}-up.sql`]: SQL_CREATE_RECEIPT_TABLE,
        [`${createReceiptMigration}-down.sql`]: SQL_DROP_RECEIPT_TABLE,
        [`${createCountryMigration}-up.sql`]: SQL_CREATE_COUNTRY_TABLE,
        [`${createCountryMigration}-down.sql`]: SQL_DROP_COUNTRY_TABLE,
        [`${createIssueMigration}-up.sql`]: SQL_CREATE_ISSUE_TABLE,
        [`${createIssueMigration}-down.sql`]: SQL_DROP_ISSUE_TABLE,
        [`${comment}-up.sql`]: SQL_COMMENT_TEMPLATE,
        [`${comment}-down.sql`]: SQL_COMMENT_TEMPLATE,
      },
    },
  });
}