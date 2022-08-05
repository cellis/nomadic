import { migrate } from './migrate/migrate';
import { Nomadic } from './nomadic';

export async function down(countOrAll: string | number, args: Nomadic.ConfigArgs) {
  await migrate(countOrAll, args, 'down');
}