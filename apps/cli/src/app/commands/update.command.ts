import * as yargs from 'yargs';
import {OctraCLIArgv, OctraCLICommand} from './command';
import {ScriptRunner} from '../script-runner';
import {GlobalVariables} from '../types';

export class UpdateCommand extends OctraCLICommand {
  override init(argv: yargs.Argv, globals: GlobalVariables): yargs.Argv {
    argv = super.init(argv, globals);
    return argv.command('update', 'Updates the Octra-DB on the given connection in config.json.', this.update as any);
  }

  private update = async (args: OctraCLIArgv) => {
    if (args.argv.help) {
      return;
    }

    console.log('Run updates...');
    await ScriptRunner.run(`${this.globals.typeORMPath} migration:run`, args.argv.verbose);
    console.log('Update complete.');
  }
}
