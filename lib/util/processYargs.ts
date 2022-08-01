import path from "path";
// eslint-disable-next-line 
// @ts-ignore
const yargs = require("yargs/yargs");

function processYargs(): Nomadic.Args {
  // eslint-disable-next-line
  const { argv } = yargs(process.argv.slice(2))
    .command('nomadic <action> [nameOrCount]', 'welcome to nomadic', (builder: any) => {
      builder.positional('action', {
        type: 'string',
        default: 'up',
        describe: 'the action to take',
      }).positional('nameOrCount', {
        type: 'string',
        default: '1',
        describe: 'If up/down, amount to go in direction. Otherwise the migration name.'
      })
    })
    .options({
      database: {
        describe: 'Database and port to run against',
        default: 'postgres',
        alias: 'd',
        type: 'string',
      },
      password: {
        describe: 'User password for database',
        default: '',
        alias: 'p',
        type: 'string',
      },
      host: {
        describe: 'Database host',
        default: 'localhost',
        alias: 'h',
        type: 'string',
      },
      user: {
        describe: 'Database user',
        type: 'string',
        default: 'postgres',
        alias: 'u'
      },
      config: {
        alias: 'c',
        default: `${path.join(process.cwd(), 'nomadic.config.js')}`,
        type: 'string',
        describe: 'module.exports config values in this file'
      },
      migrations: {
        describe: 'Path to migrations',
        default: `${path.join(process.cwd(), 'migrations')}`,
        alias: 'm',
        type: 'string',
      },
    })
    .help();

  const { host, database, user, action, config, migrations, pathOrCount } = argv;

  return { host, database, user, action, config, migrations, pathOrCount };
}

export default processYargs;
