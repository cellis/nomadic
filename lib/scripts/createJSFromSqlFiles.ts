import fs from 'fs';
import path from 'path';
import { getMigrationSqlFiles } from '../migrate/getMigrationFilesToRun';
import migrationFile from '../templates/migrationFile';
import getConfigFromOptions from '../util/getConfigFromOptions';

export default async function createJSFromSqlFiles(options: Nomadic.Options) {
  const args = await getConfigFromOptions(options, false);
  let files = await getMigrationSqlFiles(args);

  // only need the 'up' files for this
  files = files.filter((f) => f.endsWith('up.sql'));

  for( const file of files ) {
    const migrationName = file.replace('-up.sql', '');

    const jsName = `${migrationName}.js`;

    await fs.promises.writeFile(
      path.join(args.migrations, jsName), 
      migrationFile(migrationName));
  }

  console.log('[nomadic]: Created', files.length, 'js files from sql files.');
}