import * as yargs from 'yargs';
import {GlobalVariables} from '../types';

export class OctraCLICommand {
  protected globals: GlobalVariables;

  public init(argv: yargs.Argv, globals: GlobalVariables): yargs.Argv {
    this.globals = globals;
    return argv;
  };
}
