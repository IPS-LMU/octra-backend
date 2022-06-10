import * as yargs from 'yargs';
import {Argv} from 'yargs';
import {OctraCLICommand} from './command';
import {ScriptRunner} from '../script-runner';
import {GlobalVariables} from '../types';
import {readJSON} from 'fs-extra';

export class InstallationCommand extends OctraCLICommand {
  override init(argv: yargs.Argv, globals: GlobalVariables): yargs.Argv {
    argv = super.init(argv, globals);
    return argv.command('install', 'Installs a new Octra-DB on the given connection in config.json.', this.install);
  }

  private install = async (args: Argv) => {
    const answer = await this.askQuestion('Are you sure to install the database to the destination given in the config.json? All existing data in the database is going to be deleted.\n(Yes = y, No = n)\n');

    if (answer === 'y') {
      const adminName = await this.askQuestion('Please choose a user name for the new administrator account and press ENTER:\n');
      process.env['ADMIN_NAME'] = adminName;

      const adminEmail = await this.askQuestion('Please set an e-mail address for the new administrator account and press ENTER:\n');
      process.env['ADMIN_MAIL'] = adminEmail;

      const adminPassword = await this.askPassword('Please set a password for the new administrator account and press ENTER:\n');
      const adminPassword2 = await this.askPassword('Please repeat the password and press ENTER:\n');

      if (adminPassword !== adminPassword2) {
        console.log(`Both passwords must be equal. Aborting...`);
        return;
      }
      process.env['ADMIN_PW'] = adminPassword;

      // TODO create salts
      /*
      let configFile = await this.readJSON(process.env['configPath']);
      configFile = {
        ...configFile,
        api: {
          ...configFile.api,
          passwordSalt: getRandomString(30),
          secret: getRandomString(30),
          jwtSalt: getRandomString(30),
          files: {
            ...configFile.api.files,
            urlEncryption: {
              ...configFile.api.files.urlEncryption,
              salt: getRandomString(30)
            }
          }
        }
      };
      await writeJSON(process.env['configPath'], configFile, {
        spaces: 2
      });

       */
      console.log('Remove all existing tables...');
      await ScriptRunner.run(`${this.globals.typeORMPath} schema:drop`, false);
      console.log('Removed Database.');
      console.log('Initialize database...');
      await ScriptRunner.run(`${this.globals.typeORMPath} migration:run`, true);
      console.log('Installation complete.');
    } else {
      console.log('Did nothing.');
    }
  }

  private async readJSON(file: string): Promise<any> {
    new Promise<any>((resolve, reject) => {
      readJSON(file, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      })
    });
  }
}
