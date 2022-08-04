export const MIGRATIONS_TABLE = 'migrations';
export const FIND_MIGRATION_TABLE_QUERY = 
  'SELECT table_name FROM information_schema.tables WHERE table_name = $1;';

export const FIND_MULTIPLE_TABLE_QUERY = `
  SELECT table_name FROM information_schema.tables 
    WHERE table_name = ANY ($1);
`;

export const GET_LAST_MIGRATION_RUN = `
SELECT DISTINCT ON (id)
id, run_on, name
FROM migrations
ORDER BY id, run_on DESC;
`;

export const GET_LAST_N_MIGRATIONS = `
select * from public.migrations order by run_on desc limit $1;
`;

export const SQL_GET_ALL_MIGRATIONS = `
  select * from public.migrations order by run_on desc;
`;

export const SQL_DELETE_MIGRATION = `
DELETE FROM migrations WHERE id = $1;
`;

export const SQL_INSERT_MIGRATION = `
INSERT INTO public.migrations (name, run_on) VALUES ($1, now());
`;

export const GET_FIRST_N_MIGRATIONS = `
select * from public.migrations order by run_on asc limit $1;
`;

export const SQL_COMMENT_TEMPLATE = 
  '/* Replace with your SQL commands */\n';

export const SQL_CREATE_MIGRATIONS_TABLE = `
create table migrations(
	id serial not null
		constraint migrations_pkey
			primary key,
	name varchar(255) not null,
	run_on timestamp not null default now()
);
`;

export const SQL_DROP_MIGRATIONS_TABLE = `
DROP TABLE IF EXISTS migrations;
`;

export const SQL_SELECT_MIGRATIONS = `
SELECT * FROM migrations;
`;

export const SQL_CREATE_POST_TABLE = `
CREATE TABLE post (
  id text NOT NULL,
  user_id text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone,
  body text,
  description text
);
`;

export const SQL_CREATE_ISSUE_TABLE = `
CREATE TABLE issue (
  id integer NOT NULL,
  issue text NOT NULL,
  reporter text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  resolved boolean DEFAULT false
);
`;

export const SQL_DROP_ISSUE_TABLE = `
DROP TABLE IF EXISTS issue;
`;

export const SQL_CREATE_COUNTRY_TABLE = `
CREATE TABLE country (
  country_short_code text NOT NULL,
  country_name text NOT NULL
);
`;

export const SQL_DROP_COUNTRY_TABLE = `
DROP TABLE IF EXISTS country;
`;

export const SQL_DROP_POST_TABLE = 'DROP TABLE IF EXISTS post;';

export const SQL_CREATE_MESSAGE_TABLE = `
CREATE TABLE message (
  id serial not null,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  sender text NOT NULL
);
`;

export const SQL_DROP_MESSAGE_TABLE = 'DROP TABLE IF EXISTS message;';

export const SQL_CREATE_ACCOUNT_TABLE = `
CREATE TABLE account (
  id text NOT NULL,
  email text,
  password_hash text,
  updated_at timestamp without time zone DEFAULT now(),
  reset_password_token text,
  created_at timestamp without time zone DEFAULT now(),
  confirmed boolean DEFAULT false,
  sms_confirmed boolean,
  phone_number text
);
`;
export const SQL_DROP_ACCOUNT_TABLE = 'DROP TABLE IF EXISTS account;';

export const SQL_CREATE_RECEIPT_TABLE = `
CREATE TABLE receipt (
  id integer NOT NULL,
  platform_id text NOT NULL,
  platform text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  user_id text NOT NULL,
  receipt text NOT NULL
);
`;

export const SQL_DROP_RECEIPT_TABLE = 'DROP TABLE IF EXISTS receipt;';