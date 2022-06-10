import {environment} from '../environments/environment';
import {dirname, join} from 'path';
import * as yargs from 'yargs';
import {version} from '../../package.json';
import {OctraCLICommand} from './commands/command';
import {GlobalVariables} from './types';
import {InstallationCommand} from './commands/installation.command';
import {OtherCommands} from './commands/others.command';
import {UpdateCommand} from './commands/update.command';

export class OctraCLI {

  private globals: GlobalVariables = {
    nodeModulesPath: './node_modules/',
    basePath: './dist/apps/cli/',
    dataSorceFile: 'datasource.js',
    typeORMPath: ''
  };

  argv: yargs.Argv;

  private commands: OctraCLICommand[] = [
    new InstallationCommand(),
    new UpdateCommand(),
    new OtherCommands()
  ];

  constructor() {
    if (environment.production) {
      process.env['configPath'] = dirname(process.execPath);
      this.globals.nodeModulesPath = '/snapshot/octra-backend/node_modules/';
      this.globals.basePath = '/snapshot/octra-backend/dist/apps/cli/';
      this.globals.dataSorceFile = 'datasource.prod.js';
    }
    this.globals.typeORMPath = `node ${join(this.globals.nodeModulesPath, '.bin/typeorm')} --config ${join(this.globals.basePath, this.globals.dataSorceFile)}`;
  }

  private registerCommands() {
    this.argv = yargs.version(version).help().alias('help', 'h');
    for (const command of this.commands) {
      this.argv = command.init(this.argv, this.globals);
    }
    const argv = this.argv.argv;
  }

  public run() {
    this.registerCommands();
  }
}
