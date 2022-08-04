import colors from 'colors';
import runHooks from './runHooks';
import getConfigFromOptions from './util/getConfigFromOptions';

// eslint-disable-next-line


type MigrateCallback = (args: Nomadic.ConfigArgs) => Promise<void>
export async function setupConfigAndRun(
  options: Nomadic.Options,
  callback: MigrateCallback,
  action: 'up' | 'down' | 'create'
) {
  const config = await getConfigFromOptions(options);

  await callback(config);

  if (config.skip) {
    console.log(colors.cyan('[nomadic]: Skipping after hooks'));
  } else {
    console.log('[nomadic]: Running hooks...');
    await runHooks({ ...options, ...config }, action);
  }
}