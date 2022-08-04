#!/usr/bin/env node
import colors from 'colors';
import { Command } from 'commander';
import figlet from 'figlet';
import { create } from './create';
import { down } from './down';
import { up } from './up';
import { portOpt, skipOption, withDefaultOptions } from './util/input';
import { setupConfigAndRun } from './setupConfigAndRun';
import getConfigFromOptions from './util/getConfigFromOptions';

console.log(colors.magenta(figlet.textSync('nomadic')));

const program = new Command();

withDefaultOptions(program.command('create'))
  .addOption(skipOption)
  .description('create a new migration')
  .argument('<name>', 'name of the migration')
  .action(async (name: string, options: Nomadic.Options) => {
    const args = await getConfigFromOptions(options, false);
    await create(name, args);
    console.log(colors.cyan(`[nomadic]: Created migration ${name}`));
  });
  
withDefaultOptions(program.command('up', {
  isDefault: true,
}))
.addOption(skipOption)
.addOption(portOpt)
.argument('[count]', 'count to go up', 'all')
.action((count, options: Nomadic.Options) => {
  console.log('[nomadic]: Running up', count, 
    count === 'all' ? 'migrations' : 'migration');
  setupConfigAndRun(options, (args) => up(count, args));
});

withDefaultOptions(program.command('down'))
.addOption(skipOption)
.addOption(portOpt)
.description('migrate database down')
.argument('[count]', 'count to go down', 1)
.action((count, options: Nomadic.Options) => {
  console.log('[nomadic]: Rolling back', count, 
    count === 'all' ? 'migrations' : 'migration');
  setupConfigAndRun(options, (args) => down(count, args));
});

program.parse(process.argv);


