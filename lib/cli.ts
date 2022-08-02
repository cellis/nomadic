#!/usr/bin/env node
import colors from 'colors';
import { Command } from 'commander';
import figlet from 'figlet';
import { create } from './create';
import { down } from './down';
import { up } from './up';
import { skipOption, withDefaultOptions } from './util/input';
import { setupConfigAndRun } from './setupConfigAndRun';

console.log(colors.magenta(figlet.textSync('nomadic')));

const program = new Command();

withDefaultOptions(program.command('create'))
  .addOption(skipOption)
  .description('create a new migration')
  .argument('<name>', 'name of the migration')
  .action((name: string, options: Nomadic.Options) => {
    console.log('Creating migration', name);
    setupConfigAndRun(options, (args) => create(name, args));
  });
  
withDefaultOptions(program.command('up', {
  isDefault: true,
}))
.addOption(skipOption)
.argument('[count]', 'count to go up', 'all')
.action((count, options: Nomadic.Options) => {
  console.log('Running up', count, 'migration');
  setupConfigAndRun(options, (args) => up(count, args));
});

withDefaultOptions(program.command('down'))
.addOption(skipOption)
.description('migrate database down')
.argument('[count]', 'count to go down', 1)
.action((count, options: Nomadic.Options) => {
  setupConfigAndRun(options, (args) => down(count, args));
});

program.parse(process.argv);


