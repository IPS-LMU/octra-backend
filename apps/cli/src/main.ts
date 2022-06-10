import {environment} from './environments/environment';
import {dirname, join} from 'path';
import {GlobalVariables} from './app/types';
import * as yargs from 'yargs';
import {OctraCLICommand} from './app/commands/command';
import {InstallationCommand} from './app/commands/installation.command';
import {UpdateCommand} from './app/commands/update.command';
import {OtherCommands} from './app/commands/others.command';
import {version} from '../package.json';

const globals: GlobalVariables = {
  nodeModulesPath: './node_modules/',
  basePath: './dist/apps/cli/',
  dataSorceFile: 'datasource.js',
  typeORMPath: ''
};

console.log(`Environment: ${environment.production}`)
if (environment.production) {
  console.log('IS PRODUCTION MODE!');
  process.env['configPath'] = dirname(process.execPath);
  globals.nodeModulesPath = '/snapshot/octra-backend/node_modules/';
  globals.basePath = '/snapshot/octra-backend/dist/apps/cli/';
  globals.dataSorceFile = 'datasource.prod.js';
}

globals.typeORMPath = `node ${join(globals.nodeModulesPath, '.bin/typeorm')} --config ${join(globals.basePath, globals.dataSorceFile)}`;

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
argv = yargv.argv;



