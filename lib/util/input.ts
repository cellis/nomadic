import { Command, Option } from 'commander';
import path from 'path';

export const skipOption = new Option('-s, --skip <boolean>', 'skip after hooks');

export const passwordOpt = new Option('-p, --password <string>', 'database password');
passwordOpt.default('');

export const portOpt = new Option('--port <number>', 'database port');
portOpt.default(5432);

export const databaseOpt = new Option('-d, --database <string>', 'database name');

export const hostOpt = new Option('-h, --host', 'database host');
hostOpt.default('localhost');
export const userOpt = new Option('-u, --user', 'database user');
userOpt.default('postgres');
export const migrationsOpt = new Option('-m, --migrations', 'migrations directory');
migrationsOpt.default(path.join(process.cwd(), 'migrations'));

export const configOpt = new Option('-c, --config <string>', 'config path');

export function withDefaultOptions(command: Command) {
  command.addOption(hostOpt)
  .addOption(databaseOpt)
  .addOption(userOpt)
  .addOption(configOpt)
  .addOption(passwordOpt)
  .addOption(migrationsOpt);

  return command;
}