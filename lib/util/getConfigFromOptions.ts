import colors from 'colors';
import debug from 'debug';
import path from 'path';
import { Nomadic } from '../nomadic';

const log = debug('nomadic');

export default async function 
  getConfigFromOptions(options: Nomadic.Options, fail = true): Promise<Nomadic.ConfigArgs> {
  let config: Partial<Nomadic.ConfigArgs> = {};
  try {
    if (options.config) {
      // eslint-disable-next-line
      const { config: _, ...optionsWithoutConfig } = options;
      config = { ...require(path.resolve(options.config)), ...optionsWithoutConfig };
      log('Loaded -c config from %s %o',options.config,config);
    } else {
      // try to load config
      try {
        const configPath = path.join(process.cwd(), 'nomadic.config');
        // eslint-disable-next-line
        const loaded = require(configPath);

        log('Loaded config from %s',configPath);
        config = { ...options,...loaded };
      } catch (error) {
        log('Could not load config');
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
  const keys = ['database', 'user', 'password', 'host', 'migrations', 'port'];
  
  const flags: Record<string,string> = {
    'database': '-d', 
    'user': '-u', 
    'password': '-p', 
    'host': '-h', 
    'migrations': '-m', 
    'port': '--port',
  };

  keys.forEach((key: string) => {
    const val = config[key as keyof Nomadic.ConfigArgs];
    if (fail && (val === null || val === undefined)) {
      
      console.log(colors.cyan(
        `${passErr}\`${key}\` with ${flags[key]} ${orAdd}`
      ));
      keyErr = true;
    }
  });

  if (keyErr && fail) {
    process.exit();
  }

  return config as Nomadic.ConfigArgs;
}