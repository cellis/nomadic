import glob from 'glob-promise';
import path from 'path';
import { Nomadic } from '../nomadic';

export async function getMigrationSqlFiles(args: Nomadic.ConfigArgs) {
  const files = await glob(`${path.join(args.migrations, 'sqls')}/*.sql`);

  return files.map(f => {
    return path.basename(f);
  });
}

export default async function getMigrationFilesToRun(args: Nomadic.ConfigArgs) {
  const files = await glob(`${args.migrations}/*.js`);

  return files.map(f => {
    return path.basename(f);
  });
}
