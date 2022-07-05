import * as yargs from 'yargs';
import {OctraCLIArgv, OctraCLICommand} from './command';
import {ScriptRunner} from '../script-runner';
import {GlobalVariables} from '../types';
import {readJSON, writeJSON} from 'fs-extra';
import {Configuration, getRandomString, IAppConfiguration} from '@octra/server-side';
import {join} from 'path';
import * as chalk from 'chalk';

export class InstallationCommand extends OctraCLICommand {
  override init(argv: yargs.Argv, globals: GlobalVariables): yargs.Argv {
    argv = super.init(argv, globals);
    return argv.command('install', 'Installs a new Octra-DB on the given connection in config.json.', this.install as any);
  }

  private install = async (args: OctraCLIArgv) => {
    if (args.argv.help) {
      return;
    }

    let configFile: IAppConfiguration = await this.readJSON(join(process.env['configPath'], 'config.json'));
    if (!configFile) {
      throw new Error('Can\'t read config file');
    }

    const answer = await this.askQuestion(() => {
      console.log(chalk.blue(`Are you sure to install the database to the destination given in the config.json? All existing data in the database is going to be deleted.
`));
      console.log(chalk.red(`------------------------------------------------------------------
! All data from the following connection are going to be deleted permanently:
  type: ${configFile.database.dbType}
  name: ${configFile.database.dbName}
  host: ${configFile.database.dbHost}
  port: ${configFile.database.dbPort}

! All secret keys from the config.json file are going to be re-generated.
  Path to config file:
  ${join(process.env['configPath'], 'config.json')}

  If you don't want to lose these data make sure to create a backup before doing a fresh installation.
------------------------------------------------------------------
`));
      console.log(chalk.blue(`-> Press "y" for "Yes" or "n" for "No" and press ENTER.`))
    });

    if (answer === 'y') {
      let confirmedAdminName = '';
      while (confirmedAdminName === '') {
        const adminName = await this.askQuestion('\n-> Please choose a user name for the new administrator account and press ENTER:');
        if (adminName.trim().length < 3) {
          console.log(`The admin name must have more than 3 letters. Please try again:\n`);
        } else {
          confirmedAdminName = adminName;
        }
      }
      process.env['ADMIN_NAME'] = confirmedAdminName;

      let confirmedEmail = '';
      while (confirmedEmail === '') {
        const adminMail = await this.askQuestion('\n-> Please set an e-mail address for the new administrator account and press ENTER:');
        if (adminMail.trim().length < 3 || !(/[^@]+@[^.]+\.[^.]+/g.exec(adminMail))) {
          console.log(`The admin email address must be valid. Please try again:\n`);
        } else {
          confirmedEmail = adminMail;
        }
      }
      process.env['ADMIN_MAIL'] = confirmedEmail;

      let confirmedPassword = '';
      while (confirmedPassword === '') {
        const adminPassword = await this.askPassword('\n-> Please set a password for the new administrator account and press ENTER (your input is hidden):');
        const adminPassword2 = await this.askPassword('\n-> Please repeat the password and press ENTER (your input is hidden)');

        if (adminPassword !== adminPassword2) {
          console.log(chalk.red(`Both passwords must be equal. Please try again:\n`));
        } else {
          confirmedPassword = adminPassword;
        }
      }
      process.env['ADMIN_PW'] = confirmedPassword;

      let webBackendURL = '';

      if (!configFile.api.plugins?.webBackend?.url) {
        webBackendURL = await this.askQuestion(`\n-> What is the public URL of the web-backend? (full URL incl. 'https://') Leave empty if you don't want to use the web-backend`);
      }

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
              enabled: true,
              windowURL: '',
              secret: getRandomString(30),
              uuidSalt: getRandomString(30)
            }
          }
        }
      };

      if (configFile.api.plugins?.webBackend?.url || (webBackendURL && webBackendURL.trim() !== '')) {
        configFile = {
          ...configFile,
          api: {
            ...configFile.api,
            plugins: {
              ...configFile.api.plugins,
              webBackend: {
                ...configFile.api.plugins.webBackend,
                enabled: true,
                url: configFile.api.plugins?.webBackend?.url ?? webBackendURL,
                appToken: configFile.api.plugins?.webBackend?.appToken ?? getRandomString(30)
              }
            }
          }
        }
      }

      await writeJSON(join(process.env['configPath'], 'config.json'), configFile, {
        spaces: 2
      });
      Configuration.overwrite(configFile);

      try {
        console.log('\n\n* Start installation of octra-db...');
        console.log('... Remove all existing tables');
        await ScriptRunner.run(`${this.globals.typeORMPath} schema:drop`, args.argv.verbose);
        console.log('... Removed database');
        console.log('... Initialize database');
        await ScriptRunner.run(`${this.globals.typeORMPath} migration:run`, args.argv.verbose);
        console.log('... Installation completed successfully!\n');
      } catch (e) {
        console.log(chalk.red(`EROOR: Installation failed.`));
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
