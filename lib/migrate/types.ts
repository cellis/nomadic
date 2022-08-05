import { Client } from 'pg';
import { Nomadic } from '../nomadic';

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

export interface Migration {
  up: (db: Client, transform?: Nomadic.TransformFn) => Promise<void>;
  down: (db: Client, transform?: Nomadic.TransformFn) => Promise<void>;
}
