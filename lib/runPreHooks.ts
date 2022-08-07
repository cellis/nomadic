import colors from 'colors';
import { Client } from 'pg';
import { Nomadic } from './nomadic';
import getConfigFromOptions from './util/getConfigFromOptions';

export default async function runPreHooks(options: Nomadic.Options, action: Nomadic.Action) {
  if (options.preHooksFile) {
    // eslint-disable-next-line
    const preHooksFile = require(options.preHooksFile);
    options.preHooks = { ...options.preHooks, ...preHooksFile };
  }

  if (options.preHooks) {
    const args = await getConfigFromOptions(options);
    const client = new Client({
      database: args.database,
      host: args.host,
      port: args.port,
      user: args.user,
      password: args.password,
    });

    await client.connect();

    if (options.preHooks.create && action === 'create') {
      console.log(colors.cyan('[nomadic]: Running preHooks for before create…'));
      await options.preHooks.create(client);
    }

    if (options.preHooks.up && action === 'up') {
      console.log(colors.cyan('[nomadic]: Running preHooks for before up…'));
      await options.preHooks.up(client);
    }

    if (options.preHooks.down && action === 'down') {
      console.log(colors.cyan('[nomadic]: Running preHooks for before down…'));
      await options.preHooks.down(client);
    }

    await client.end();
  }

}