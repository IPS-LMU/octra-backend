import * as yargs from 'yargs';
import {Argv} from 'yargs';
import {OctraCLICommand} from './command';
import {ScriptRunner} from '../script-runner';
import {GlobalVariables} from '../types';
import {readJSON, writeJSON} from 'fs-extra';
import {Configuration, getRandomString, IAppConfiguration} from '@octra/server-side';
import {join} from 'path';

export class InstallationCommand extends OctraCLICommand {
  override init(argv: yargs.Argv, globals: GlobalVariables): yargs.Argv {
    argv = super.init(argv, globals);
    return argv.command('install', 'Installs a new Octra-DB on the given connection in config.json.', this.install);
  }

  private install = async (args: Argv) => {
    let configFile: IAppConfiguration = await this.readJSON(join(process.env['configPath'], 'config.json'));
    if (!configFile) {
      throw new Error('Can\'t read config file');
    }

    const answer = await this.askQuestion(`Are you sure to install the database to the destination given in the config.json? All existing data in the database is going to be deleted.
------------------------------------------------------------------
! All data from the following connection are going to be deleted: !
  type: ${configFile.database.dbType}
  name: ${configFile.database.dbName}
  host: ${configFile.database.dbHost}
  port: ${configFile.database.dbPort}

! All secret keys from the config.json file are going to be re-generated!
  Path to config file:
  ${join(process.env['configPath'], 'config.json')}
------------------------------------------------------------------

Press "y" for "Yes" or "n" for "No" and press ENTER.
`);

    if (answer === 'y') {
      let confirmedAdminName = '';
      while (confirmedAdminName === '') {
        const adminName = await this.askQuestion('\nPlease choose a user name for the new administrator account and press ENTER:\n');
        if (adminName.trim().length < 3) {
          console.log(`The admin name must have more than 3 letters. Please try again:\n`);
        } else {
          confirmedAdminName = adminName;
        }
      }
      process.env['ADMIN_NAME'] = confirmedAdminName;

      let confirmedEmail = '';
      while (confirmedEmail === '') {
        const adminMail = await this.askQuestion('\nPlease set an e-mail address for the new administrator account and press ENTER:\n');
        if (adminMail.trim().length < 3 || !(/[^@]+@[^.]+\.[^.]+/g.exec(adminMail))) {
          console.log(`The admin email address must be valid. Please try again:\n`);
        } else {
          confirmedEmail = adminMail;
        }
      }
      process.env['ADMIN_MAIL'] = confirmedEmail;

      let confirmedPassword = '';
      while (confirmedPassword === '') {
        const adminPassword = await this.askPassword('\nPlease set a password for the new administrator account and press ENTER:\n');
        const adminPassword2 = await this.askPassword('\nPlease repeat the password and press ENTER:\n');

        if (adminPassword !== adminPassword2) {
          console.log(`Both passwords must be equal. Please try again:\n`);
        } else {
          confirmedPassword = adminPassword;
        }
      }
      process.env['ADMIN_PW'] = confirmedPassword;

      configFile = {
        ...configFile,
        api: {
          ...configFile.api,
          security: {
            keys: {
              password: {
                secret: getRandomString(30),
                salt: getRandomString(30)
              },
              jwt: {
                secret: getRandomString(30),
                salt: getRandomString(30)
              },
              url: {
                secret: getRandomString(30),
                salt: getRandomString(30)
              }
            }
          },
          plugins: {
            ...configFile.api.plugins,
            shibboleth: {
              ...configFile.api.plugins.shibboleth,
              secret: getRandomString(30),
              uuidSalt: getRandomString(30)
            }
          }
        }
      };
      await writeJSON(join(process.env['configPath'], 'config.json'), configFile, {
        spaces: 2
      });
      Configuration.overwrite(configFile);

      try {
        console.log('Remove all existing tables...');
        await ScriptRunner.run(`${this.globals.typeORMPath} schema:drop`, false);
        console.log('Removed Database.');
        console.log('Initialize database...');
        await ScriptRunner.run(`${this.globals.typeORMPath} migration:run`, false);
        console.log('Installation complete.');
      } catch (e) {
        console.log(`EROOR: Installation failed.`);
        console.log(e);
      }
    } else {
      console.log('Did nothing.');
    }
  }

  private async readJSON(file: string): Promise<any> {
    return readJSON(file, {encoding: 'utf-8'});
  }
}
