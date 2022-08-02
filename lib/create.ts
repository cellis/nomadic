import fs from 'fs';
import { formatName } from './util/parsing';
import path from 'path';
import migrationFile from './templates/migrationFile';

export const SQL_TEMPLATE = '/* Replace with your SQL commands */\n';

export async function create(name: string, args: Nomadic.ConfigArgs) {
  const date = new Date();

  const filePath = formatName(name, date);

  const downFile = `${filePath}-down.sql`;
  const upFile = `${filePath}-up.sql`;
  const jsFile = `${filePath}.js`;

  await fs.promises.writeFile(
    path.join(args.migrations, jsFile), 
    migrationFile(filePath));
  
  await fs.promises.writeFile(
    path.join(args.migrations,'sql', downFile), 
    SQL_TEMPLATE);

  await fs.promises.writeFile(
    path.join(args.migrations,'sql', upFile), 
    SQL_TEMPLATE);
}