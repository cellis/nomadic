import { migrate } from './migrate/migrate';

export async function down(countOrAll: string | number, args: Nomadic.ConfigArgs) {
  await migrate(countOrAll, args, 'down');
}