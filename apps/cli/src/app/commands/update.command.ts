import * as yargs from 'yargs';
import {Argv} from 'yargs';
import {OctraCLICommand} from './command';
import {ScriptRunner} from '../script-runner';
import {GlobalVariables} from '../types';

export class UpdateCommand extends OctraCLICommand {
  override init(argv: yargs.Argv, globals: GlobalVariables): yargs.Argv {
    argv = super.init(argv, globals);
    return argv.command('update', 'Updates the Octra-DB on the given connection in config.json.', this.update);
  }

  private update = async (args: Argv) => {
    console.log('Run migrations...');
    await ScriptRunner.run(`${this.globals.typeORMPath} migration:run`, true);
    console.log('Update complete.');
  }
}
