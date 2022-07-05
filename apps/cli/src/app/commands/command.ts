import * as yargs from 'yargs';
import {GlobalVariables} from '../types';
import * as readline from 'readline';
import {Writable} from 'stream';
import * as chalk from 'chalk';

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

  public async askQuestion(query: (string | (() => void))): Promise<string> {
    if (typeof query === 'function') {
      query();
    } else {
      console.log(chalk.blue(query));
    }
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise(resolve => rl.question('>> ', ans => {
      rl.close();
      resolve(ans);
    }));
  }

  public async askPassword(query): Promise<string> {
    if (typeof query === 'function') {
      query();
    } else {
      console.log(chalk.blue(query));
    }

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

    const promise = new Promise(resolve => rl.question('>> ', ans => {
      resolve(ans);
      rl.close();
    }));
    muted = true;

    return promise as Promise<string>;
  }
}
