import { migrate } from './migrate/migrate';
import debug from 'debug';

const log = debug('nomadic');

export async function down(countOrAll: string | number, args: Nomadic.ConfigArgs) {
  await migrate(countOrAll, args, 'down');

  log('completed down %s migration', countOrAll);
  console.log('[NOMADIC]: Rolled back',countOrAll,'migrations.');
}