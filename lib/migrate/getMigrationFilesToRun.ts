import glob from 'glob-promise';
import path from 'path';

export default async function getMigrationFilesToRun(args: Nomadic.ConfigArgs) {
  const files = await glob(`${args.migrations}/*.js`);

  return files.map(f => {
    return path.basename(f);
  });
}
