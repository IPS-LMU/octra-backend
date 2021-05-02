import {exec} from 'child_process';

export class Curl {
  public static run(args: string[]): Promise<string> {
    return new Promise<string>((resolve, reject) => {

      const command = `curl ${args.join(' ')}`;
      console.log(`call '${command}'`);

      exec(`curl ${args.join(' ')}`, (error, stdout, stderr) => {
        if (error) {
          reject(error.toString());
          return;
        }

        resolve(stdout.toString());
      });
    });
  }
}
