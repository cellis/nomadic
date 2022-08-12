#!/usr/bin/env node
import colors from 'colors';
import { Command } from 'commander';
import figlet from 'figlet';
import { create } from './create';
import { down } from './down';
import { up } from './up';
import { migrationsOpt, portOpt, skipOption, withDefaultOptions } from './util/input';
import { setupConfigAndRun } from './setupConfigAndRun';
import getConfigFromOptions from './util/getConfigFromOptions';
import runHooks from './runHooks';
import createJSFromSqlFiles from './scripts/createJSFromSqlFiles';
import { Nomadic } from './nomadic';
import runPreHooks from './runPreHooks';

console.log(colors.magenta(figlet.textSync('nomadic')));

const program = new Command();

withDefaultOptions(program.command('create'))
  .addOption(skipOption)
  .description('create a new migration')
  .argument('<name>', 'name of the migration')
  .action(async (name: string, options: Nomadic.Options) => {
    const args = await getConfigFromOptions(options, false);



    if (!args.skip) {
      await runPreHooks(args, 'create');
    } else {
      console.log(colors.cyan('[nomadic]: Skipping prehooks'));
    }

    await create(name, args);
    console.log(colors.cyan(`[nomadic]: Created migration ${name}`));

    if (!args.skip) {
      await runHooks(args, 'create');
    } else {
      console.log(colors.cyan('[nomadic]: Skipping hooks'));
    }
  });
  
withDefaultOptions(program.command('up', {
  isDefault: true,
}))
.addOption(skipOption)
.addOption(portOpt)
.argument('[count]', 'count to go up', 'all')
.action((count, options: Nomadic.Options) => {
  console.log('[nomadic]: Migrating up', count, 
    (count === 'all' || count > 1) ? 'migrations…' : 'migration…');
  setupConfigAndRun(options, (args) => up(count, args), 'up');
});

withDefaultOptions(program.command('down'))
.addOption(skipOption)
.addOption(portOpt)
.description('migrate database down')
.argument('[count]', 'count to go down', 1)
.action((count, options: Nomadic.Options) => {
  console.log('[nomadic]: Rolling back', count, 
    (count === 'all' || count > 1) ? 'migrations…' : 'migration…');
  setupConfigAndRun(options, (args) => down(count, args), 'down');
});

program.command('generate-from-sql')
  .description('Create nomadic js migration files from sql file names')
  .addOption(migrationsOpt)
  .action((options: Nomadic.Options) => {
    createJSFromSqlFiles(options);
  });

program.parse(process.argv);


