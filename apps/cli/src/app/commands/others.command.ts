import * as yargs from 'yargs';
import {OctraCLICommand} from './command';
import {GlobalVariables} from '../types';

export class OtherCommands extends OctraCLICommand {
  override init(argv: yargs.Argv, globals: GlobalVariables): yargs.Argv {
    argv = super.init(argv, globals);
    return argv.command('currDir', 'Retrieves the current path.', (args) => {
      console.log(__dirname);
    })/* .command('ls [path]', 'shows the files and folders within the pkg snapshot.', (yargs) => {
      yargs.positional('path', {
        type: 'string',
        default: '',
        describe: 'List files'
      });
      console.log((yargs as any).argv);
      console.log(fs.readdirSync(Path.join((yargs.argv as any).path)));
    })
      .command('cmd [command]', 'Runs a command in the context of the pkg snapshot. (for testing only)', async (yargs) => {
        yargs.positional('command', {
          type: 'string',
          default: '',
          describe: 'Run command'
        });
        await ScriptRunner.run((yargs.argv as any).command, undefined);
      }) */;
  }
}
