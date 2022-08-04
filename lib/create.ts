import fs from 'fs';
import { formatName } from './util/parsing';
import path from 'path';
import migrationFile from './templates/migrationFile';
import { SQL_COMMENT_TEMPLATE } from './util/sql';

export async function create(name: string, args: Nomadic.ConfigArgs) {
  const date = new Date();

  const filePath = formatName(name, date);

  const downFile = `${filePath}-down.sql`;
  const upFile = `${filePath}-up.sql`;
  const jsFile = `${filePath}.js`;

  try {
    await fs.promises.access(args.migrations, fs.constants.F_OK);
  } catch (error) {
    await fs.promises.mkdir(args.migrations, { recursive: true });
  }

  await fs.promises.writeFile(
    path.join(args.migrations, jsFile), 
    migrationFile(filePath));
  
  await fs.promises.writeFile(
    path.join(args.migrations,'sql', downFile), 
    SQL_COMMENT_TEMPLATE);

  await fs.promises.writeFile(
    path.join(args.migrations,'sql', upFile), 
    SQL_COMMENT_TEMPLATE);
}