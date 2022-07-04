import * as yargs from 'yargs';
import {GlobalVariables} from '../types';
import * as readline from 'readline';
import {Writable} from 'stream';

export interface OctraCLIArgv {
  argv: {
    verbose?: boolean;
    help?: string;
  }
}

export class OctraCLICommand {
  protected globals: GlobalVariables;

  public init(argv: yargs.Argv, globals: GlobalVariables): yargs.Argv {
    this.globals = globals;
    return argv;
  };

  public async askQuestion(query): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
      rl.close();
      resolve(ans);
    }));
  }

  public async askPassword(query): Promise<string> {
    let muted = false;
    const mutableStdout = new Writable({
      write: function (chunk, encoding, callback) {
        if (!muted)
          process.stdout.write(chunk, encoding);
        callback();
      }
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: mutableStdout,
      terminal: true
    });

    const promise = new Promise(resolve => rl.question(query, ans => {
      resolve(ans);
      rl.close();
    }));
    muted = true;

    return promise as Promise<string>;
  }
}
