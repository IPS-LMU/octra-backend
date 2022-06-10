import {exec} from 'child_process';

export class ScriptRunner {
  public static async run(scriptPath, showOutput) {
    return new Promise<void>((resolve, reject) => {
      const process = exec(scriptPath);
      if (showOutput) {
        console.log(`run ${scriptPath}`);
      }
      process.stdout.on('data', (data) => {
        if (showOutput) {
          console.log(data.toString());
        }
      });

      process.stderr.on('data', (data) => {
        reject(data.toString());
      });
      // what to do when the command is done
      process.on('exit', (code) => {
        resolve();
      });
    });
  }
}
