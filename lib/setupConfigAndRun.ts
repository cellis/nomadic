import colors from 'colors';
import { isNil, omit } from 'lodash';
import path from 'path';

// eslint-disable-next-line
const debug = require('debug');

const log = debug('nomadic');

type MigrateCallback = (args: Nomadic.ConfigArgs) => Promise<void>
export async function setupConfigAndRun(options: Nomadic.Options,callback: MigrateCallback) {
  let config: Partial<Nomadic.ConfigArgs> = {};
  try {
    
    if (options.config) {
      config = { ...require(path.resolve(options.config)), ...omit(options, 'config') };
      log('Loaded -c config from %s %o',options.config,config);
    } else {
      // try to load config
      try {
        const configPath = path.join(process.cwd(), 'nomadic.config.js');
        // eslint-disable-next-line
        const loaded = require(configPath);

        log('Loaded config from %s',configPath);
        config = { ...options,...loaded };
      } catch (error) {
        // don't throw here, we handle later.
        config = options;
      }
    }
  } catch (error) {
    // eslint-disable-next-line 
    // @ts-ignore
    log(`Error: ${error.message}`);  
  }

  const passErr = 'Error: you must either pass a ';
  const orAdd = 'or add it in your nomadic.config.js\n';
  
  let keyErr = false;
  const keys = ['database', 'user', 'password', 'host', 'migrations'];
  
  keys.forEach((key: string) => {
    if (isNil(config[key as keyof Nomadic.ConfigArgs])) {
      console.log(colors.cyan(`${passErr}\`${key}\` with -${key.charAt(0)} ${orAdd}`));
      keyErr = true;
    }
  });

  if (keyErr) {
    process.exit();
  }

  await callback(config as Nomadic.ConfigArgs);

  if (config.skip) {
    console.log('Skipping after hooks');
  }
}