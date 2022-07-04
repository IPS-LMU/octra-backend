import {ConfigLoader} from './config-loader';
import {join} from 'path';
import * as yargs from 'yargs';
import {Options} from 'yargs';
import {OctraCLICommand} from './app/commands/command';
import {InstallationCommand} from './app/commands/installation.command';
import {UpdateCommand} from './app/commands/update.command';
import {OtherCommands} from './app/commands/others.command';
import {version} from '../package.json';

const globals = ConfigLoader.globals;
globals.typeORMPath = `node ${join(globals.nodeModulesPath, '.bin/typeorm')} --dataSource ${join(globals.basePath, globals.dataSorceFile)}`;

let argv: any;

const commands: OctraCLICommand[] = [
  new InstallationCommand(),
  new UpdateCommand(),
  new OtherCommands()
];

// register commands
let yargv = yargs.version(version).help().alias('help', 'h');
for (const command of commands) {
  yargv = command.init(yargv, globals);
}
yargv.option<{ verbose: Options }>({
  'verbose': {
    alias: 'v',
    default: false,
    type: 'boolean',
    description: 'show console outputs while running commands'
  }
});

argv = yargv.argv;



