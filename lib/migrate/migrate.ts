import { Client, ClientConfig } from 'pg';
import ensureMigrationTable from '../util/ensureMigrationTable';
import getMigrationFilesToRun from './getMigrationFilesToRun';
import isCountAll from './isCountAll';
import { runDownAll, runDownN } from './runDown';
import { runUpAll, runUpN } from './runUp';
import { RunAll, RunN } from './types';
import { Nomadic } from '../nomadic';

export async function migrate(
  countOrAll: string | number, 
  args: Nomadic.ConfigArgs,
  direction: 'up' | 'down'
) {
  const clientArgs: ClientConfig = {
    database: args.database,
    host: args.host,
    port: args.port,
    user: args.user,
    password: args.password,
  };

  if (args.ssl) {
    clientArgs.ssl = args.ssl;
  }

  const client = new Client(clientArgs);

  const runAll: RunAll = direction === 'up' ? runUpAll : runDownAll;
  const runN: RunN = direction === 'up' ? runUpN : runDownN;

  await client.connect();
  
  await ensureMigrationTable(client, args);

  const files = await getMigrationFilesToRun(args);

  if (!files.length) {
    console.log('[nomadic]: No migrations to run');
  } else {
    // get highest run migration in migrations table
    if (isCountAll(countOrAll)) {
      await runAll(files,client, args);
    } else {
      await runN(files,countOrAll, client, args);
    }
    
    console.log('[nomadic]:',direction === 'down' ?
      'Rolled back' : 'Completed',countOrAll,'migrations.');
  }

  await client.end();
}