import * as yargs from 'yargs';
import {Argv} from 'yargs';
import {OctraCLICommand} from './command';
import {ScriptRunner} from '../script-runner';
import {GlobalVariables} from '../types';

export class InstallationCommand extends OctraCLICommand {
  override init(argv: yargs.Argv, globals: GlobalVariables): yargs.Argv {
    argv = super.init(argv, globals);
    return argv.command('install', 'Installs a new Octra-DB on the given connection in config.json.', this.install);
  }

  private install = async (args: Argv) => {
    console.log('Remove all existing tables...')
    await ScriptRunner.run(`${this.globals.typeORMPath} schema:drop`, false);
    console.log('Removed Database.');
    console.log('Initialize database...');
    await ScriptRunner.run(`${this.globals.typeORMPath} migration:run`, true);
    console.log('Installation complete.');
  }
}
