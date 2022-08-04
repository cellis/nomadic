import { Client } from 'pg';
import ensureMigrationTable from '../util/ensureMigrationTable';
import getMigrationFilesToRun from './getMigrationFilesToRun';
import isCountAll from './isCountAll';
import { runDownAll, runDownN } from './runDown';
import { runUpAll, runUpN } from './runUp';
import { RunAll, RunN } from './types';

export async function migrate(
  countOrAll: string | number, 
  args: Nomadic.ConfigArgs,
  direction: 'up' | 'down'
) {
  const client = new Client({
    database: args.database,
    host: args.host,
    port: args.port,
    user: args.user,
    password: args.password,
  });

  const runAll: RunAll = direction === 'up' ? runUpAll : runDownAll;
  const runN: RunN = direction === 'up' ? runUpN : runDownN;

  await client.connect();
  
  await ensureMigrationTable(client);

  const files = await getMigrationFilesToRun(args);

  if (!files.length) {
    console.log('No migrations to run');
  } else {
    // get highest run migration in migrations table
    if (isCountAll(countOrAll)) {
      await runAll(files,client, args);
    } else {
      await runN(files,countOrAll, client, args);
    }

  }

  await client.end();
}