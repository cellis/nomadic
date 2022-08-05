import { migrate } from './migrate/migrate';
import { Nomadic } from './nomadic';

export async function up(countOrAll: string | number, args: Nomadic.ConfigArgs) {
  await migrate(countOrAll, args, 'up');
}