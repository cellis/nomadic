import colors from 'colors';
import { Nomadic } from './nomadic';
import runHooks from './runHooks';
import runPreHooks from './runPreHooks';
import getConfigFromOptions from './util/getConfigFromOptions';

type MigrateCallback = (args: Nomadic.ConfigArgs) => Promise<void>
export async function setupConfigAndRun(
  options: Nomadic.Options,
  callback: MigrateCallback,
  action: Nomadic.Action
) {
  const config = await getConfigFromOptions(options);

  await runPreHooks(config, action);

  await callback(config);

  if (config.skip) {
    console.log(colors.cyan('[nomadic]: Skipping after hooks'));
  } else {
    console.log('[nomadic]: Running hooks…');
    await runHooks({ ...options, ...config }, action);
  }
}