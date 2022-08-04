import colors from 'colors';
import { Client } from 'pg';
import getConfigFromOptions from './util/getConfigFromOptions';

export default async function runHooks(options: Nomadic.Options) {

  if (options.hooksFile) {
    // eslint-disable-next-line
    const hooksFile = require(options.hooksFile);
    options.hooks = { ...options.hooks, ...hooksFile };
  }

  if (options.hooks) {
    const args = await getConfigFromOptions(options);
    const client = new Client({
      database: args.database,
      host: args.host,
      port: args.port,
      user: args.user,
      password: args.password,
    });

    await client.connect();

    if (options.hooks.create) {
      console.log(colors.magenta('[NOMADIC]: Running hooks for after create…'));
      await options.hooks.create(client);
    }

    if (options.hooks.up) {
      console.log(colors.magenta('[NOMADIC]: Running hooks for after up…'));
      await options.hooks.up(client);
    }

    if (options.hooks.down) {
      console.log(colors.magenta('[NOMADIC]: Running hooks for after down…'));
      await options.hooks.down(client);
    }
  }
}