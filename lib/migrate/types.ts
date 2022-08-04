import { Client, QueryArrayConfig, QueryArrayResult, QueryConfig, QueryResult, QueryResultRow, Submittable } from 'pg';

export interface RunN {
  (
    files: string[],
    count: number,
    client: Client,
    args: Nomadic.ConfigArgs
  ): Promise<void>
}

export interface RunAll {
  (
    files: string[],
    client: Client, 
    args: Nomadic.ConfigArgs
  ): Promise<void>
}

export interface MigrationRow {
  run_on: Date;
  name: string;
  id: number;
}

export interface PsuedoClient {
  query<T extends Submittable>(queryStream: T): T;
    // tslint:disable:no-unnecessary-generics
  query<R extends any[] = any[], I extends any[] = any[]>(
      queryConfig: QueryArrayConfig<I>,
      values?: I,
  ): Promise<QueryArrayResult<R>>;
  query<R extends QueryResultRow = any, I extends any[] = any[]>(
      queryConfig: QueryConfig<I>,
  ): Promise<QueryResult<R>>;
  query<R extends QueryResultRow = any, I extends any[] = any[]>(
      queryTextOrConfig: string | QueryConfig<I>,
      values?: I,
  ): Promise<QueryResult<R>>;
  query<R extends any[] = any[], I extends any[] = any[]>(
      queryConfig: QueryArrayConfig<I>,
      callback: (err: Error, result: QueryArrayResult<R>) => void,
  ): void;
  query<R extends QueryResultRow = any, I extends any[] = any[]>(
      queryTextOrConfig: string | QueryConfig<I>,
      callback: (err: Error, result: QueryResult<R>) => void,
  ): void;
  query<R extends QueryResultRow = any, I extends any[] = any[]>(
      queryText: string,
      values: I,
      callback: (err: Error, result: QueryResult<R>) => void,
  ): void;
  runSql: (...args: any) => any
}

export interface Migration {
  up: (db: Client | PsuedoClient, transform?: Nomadic.TransformFn) => Promise<void>;
  down: (db: Client | PsuedoClient, transform?: Nomadic.TransformFn) => Promise<void>
}
