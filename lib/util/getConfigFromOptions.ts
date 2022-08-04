import colors from 'colors';
import debug from 'debug';
import path from 'path';

const log = debug('nomadic');

export default async function 
  getConfigFromOptions(options: Nomadic.Options): Promise<Nomadic.ConfigArgs> {
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
  const keys = ['database', 'user', 'password', 'host', 'migrations', 'port'];
  
  keys.forEach((key: string) => {
    if (!config[key as keyof Nomadic.ConfigArgs]) {
      console.log(colors.cyan(
        `${passErr}\`${key}\` with -${key.charAt(0)} ${orAdd}`
      ));
      keyErr = true;
    }
  });

  if (keyErr) {
    process.exit();
  }

  return config as Nomadic.ConfigArgs;
}