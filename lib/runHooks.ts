import colors from 'colors';
import { Client } from 'pg';
import { Nomadic } from './nomadic';
import getConfigFromOptions from './util/getConfigFromOptions';

export default async function runHooks(options: Nomadic.Options, action: 'up' | 'down' | 'create') {

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

    if (options.hooks.create && action === 'create') {
      console.log(colors.magenta('[nomadic]: Running hooks for after create…'));
      await options.hooks.create(client);
    }

    if (options.hooks.up && action === 'up') {
      console.log(colors.magenta('[nomadic]: Running hooks for after up…'));
      await options.hooks.up(client);
    }

    if (options.hooks.down && action === 'down') {
      console.log(colors.magenta('[nomadic]: Running hooks for after down…'));
      await options.hooks.down(client);
    }

    await client.end();
  }
}