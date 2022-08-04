import { migrate } from './migrate/migrate';

import debug from 'debug';

const log = debug('nomadic');

export async function up(countOrAll: string | number, args: Nomadic.ConfigArgs) {
  await migrate(countOrAll, args, 'up');

  log('completed up %s migration', countOrAll);
  console.log('[NOMADIC]: Completed',countOrAll,'migrations.');
}