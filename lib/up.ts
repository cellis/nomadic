import { migrate } from './migrate/migrate';

export async function up(countOrAll: string | number, args: Nomadic.ConfigArgs) {
  await migrate(countOrAll, args, 'up');

  console.log('[NOMADIC]: Completed',countOrAll,'migrations.');
}