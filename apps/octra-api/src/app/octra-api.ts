import {Express, NextFunction, Request, Response} from 'express';
import * as bodyParser from 'body-parser';
import {APIV1} from './api/v1/api';
import * as path from 'path';
import * as Path from 'path';
import {ApiCommand} from './api/v1/commands/api.command';
import {createTerminus} from '@godaddy/terminus';
import * as ejs from 'ejs';
import * as fs from 'fs';
import * as cors from 'cors';
import {APIModule} from './octra-api.module';
import {AppConfiguration, IDBConfiguration} from './obj/app-config/app-config';
import {DBManager} from './db/db.manager';
import {PostgreSQLManager} from './db/postgreSQL.manager';
import * as cookieParser from 'cookie-parser';
import * as jwt from 'jsonwebtoken';
import {UserRole} from '@octra/db';
import {SHA256} from 'crypto-js';
import {DatabaseFunctions} from './api/v1/obj/database.functions';
import {TokenData} from './api/v1/obj/types';
import express = require('express');

export class OctraApi {
  get appPath(): string {
    return this._appPath;
  }

  get executionPath(): string {
    return this._executionPath;
  }

  get activeAPIs(): APIV1[] {
    return this._activeAPIs;
  }

  private _activeAPIs: APIV1[] = [];

  private _executionPath: string;
  private _appPath: string;
  private settings: AppConfiguration;
  private name = 'OCTRA';
  private version = '0.3.0';
  private environment: 'development' | 'production';
  private dbManager: DBManager;

  constructor() {
    this._activeAPIs = APIModule.activeAPIs;
  }

  public init(environment: 'development' | 'production', configPath = ''): Express {
    this.environment = environment;
    if (environment === 'development') {
      this._executionPath = __dirname;
    } else {
      this._executionPath = path.dirname(process.execPath);
    }
    this._appPath = __dirname;
    // loadSettings
    if (configPath === '') {
      configPath = path.join(this._executionPath, 'config.json');
    }
    const settingsJSON = fs.readFileSync(configPath,
      {
        encoding: 'utf-8'
      }
    );

    const appConfiguration = new AppConfiguration(JSON.parse(settingsJSON));
    this.settings = appConfiguration;
    this.settings.appPath = this._appPath;
    this.settings.executionPath = this._executionPath;

    if (this.settings.validation.valid) {
      const app = express();
      app.set('view engine', 'ejs');
      app.engine('ejs', ejs.__express); //<-- this

      app.set('views', path.join(this._appPath, 'views'));

      // use bodyParser in order to parse JSON data
      app.use(bodyParser.urlencoded({extended: true}));
      app.use(bodyParser.json());
      app.use(cors());
      app.use(cookieParser());

      const router = express.Router();
      this.dbManager = this.getDBWrapper(this.settings.database);

      router.route('*').all((req: Request, res: Response, next: NextFunction) => {
        res.removeHeader('x-powered-by');
        req['appSettings'] = {
          ...this.settings
        };
        delete req['appSettings'].configuration.database;
        next();
      });

      for (const api of this._activeAPIs) {
        api.init(app, environment, this.settings, this.dbManager);
      }

      app.get('/robots.txt', function (req, res) {
        res.type('text/plain');
        res.send('User-agent: *\nDisallow: /');
      });


      console.log(`app path is ${Path.join(this._appPath, '/views/index.ejs')}`);
      app.get('/', (req, res) => {
        res.render('index.ejs', {
          activeAPIs: this._activeAPIs,
          settings: this.settings,
          url: this.settings.api.url
        });
      });

      //set port
      let port = 0;
      if (process.env.PORT) {
        port = Number(process.env.PORT);
      } else {
        port = this.settings.api.port
      }

      if (this.settings.api.debugging) {
        router.use(function (req, res, next) {
          // do logging
          console.log(`Got new request`);
          console.log(JSON.stringify(req.headers));
          next(); // make sure we go to the next routes and don't stop here-
        });
      }

      console.log(`static is ${path.join(this._appPath, 'static')}`);
      app.use(express.static(path.join(this._appPath, 'static')));
      app.use('/', router);

      router.route(`/confirmShibboleth`).post((req, res) => {
        jwt.verify(req.body.shibToken, this.settings.api.shibboleth.secret, (err, tokenBody) => {
          console.log(tokenBody);
          if (err) {
            ApiCommand.sendError(res, 401, 'Invalid Web Token. Please authenticate again.', false);
          } else {
            if (!((tokenBody.userInformation.mail && tokenBody.userInformation.mail.trim() !== '') ||
              (tokenBody.userInformation.oidEduPersonPrincipalName || tokenBody.userInformation.oidEduPersonPrincipalName.trim() !== ''))) {
              ApiCommand.sendError(res, 401, 'Shibboleth response does not contain eduPrincipalName or mail attributes.', false);
              return;
            }

            // generate UUID
            let UUID = '';
            if (tokenBody.userInformation.oidEduPersonPrincipalName && tokenBody.userInformation.oidEduPersonPrincipalName !== '') {
              UUID = tokenBody.userInformation.oidEduPersonPrincipalName;
            } else if (tokenBody.userInformation.mail && tokenBody.userInformation.mail !== '') {
              UUID = tokenBody.userInformation.mail;
            }

            if (UUID !== '') {
              // save user
              UUID = SHA256(UUID).toString();
              console.log(`UUID is ${UUID}`);
              // check if user exists
              DatabaseFunctions.getUserInfo({
                name: '',
                email: '',
                hash: UUID
              }).then((user) => {
                const redirectWithToken = (id: number, roles: UserRole[]) => {
                  const tokenData: TokenData = {
                    id,
                    role: roles
                  };
                  const token = jwt.sign(tokenData, this.settings.api.secret, {
                    expiresIn: 86400 // expires in 24 hours
                  });

                  res.render(`authenticators/confirmShibboleth.ejs`, {
                    userName: '',
                    email: '',
                    token: token,
                    windowURL: req.query.windowURL
                  });
                }

                if (user) {
                  console.log(`user exists`);
                  redirectWithToken(user.id, user.role);
                } else {
                  console.log(`user does not exist`);

                  if (req.body) {
                    const userName = (tokenBody.userInformation.displayName && tokenBody.userInformation.displayName.trim() !== '')
                      ? tokenBody.userInformation.displayName : req.body.userName;

                    const email = (tokenBody.userInformation.mail && tokenBody.userInformation.mail.trim() !== '')
                      ? tokenBody.userInformation.mail : req.body.email;

                    console.log(`userName: ${userName}, email: ${email}`);
                    if (userName && userName.trim() !== '' && email && email.trim() !== '') {
                      // save user
                      DatabaseFunctions.createUser({
                        name: userName,
                        email: email,
                        password: UUID,
                        loginmethod: 'shibboleth'
                      }).then((newUser) => {
                        console.log(`user created with id ${newUser.id}`);
                        redirectWithToken(newUser.id, newUser.roles);
                      }).catch((error) => {
                        ApiCommand.sendError(res, 401, error, false);
                      });
                    } else {
                      res.render(`authenticators/confirmShibboleth.ejs`, {
                        userName: tokenBody.userInformation.displayName,
                        email: tokenBody.userInformation.mail,
                        shibToken: req.body.shibToken,
                        token: '',
                        windowURL: ''
                      });
                    }
                  }
                }
              }).catch((e) => {
                console.error(e);
                ApiCommand.sendError(res, 500, 'Can not create User.', false);
              })
            } else {
              ApiCommand.sendError(res, 500, 'Can not generate UUID.', false);
              return;
            }
          }
        });
      });

      router.route('*').all((req, res) => {
        ApiCommand.sendError(res, 400, `This route does not exist. Please check your URL again. ${req.url}`, false);
      });

      // Start listening!
      const server = app.listen(port, this.settings.api.host, () => {
        console.log(`\nStarted ${this.name} REST API (v${this.version}) on http://localhost:${this.settings.api.port}!\n`);
        console.log(`Active APIs:`);
        for (const api of this._activeAPIs) {
          console.log(`|- ${api.information.apiSlug}`);
          console.log(`\t|- Reference: http://localhost:${this.settings.api.port}/${api.information.apiSlug}/reference`);

          console.log(`\t|- API methods (order is equal to routing order)`);
          for (const module of api.modules) {
            console.log(`\t\t[Module] ${module.url}`);
            for (const command of module.commands) {
              console.log(`\t\t\t- ${command.root}${command.url} => ${command.name} (${command.type})`);
            }
          }
        }
      });

      createTerminus(server, {
        signal: 'SIGINT',
        onSignal: () => {
          return new Promise<any>((resolve) => {
            console.log(`\nClose database...`);
            this.dbManager.close().then(() => {
              console.log(`Database closed.`);
              resolve(null);
            }).catch((error) => {
              console.log(error);
              resolve(null);
            });
          });
        }
      })

      return app;
    } else {
      // invalid config
      console.log(`The config file is invalid:`);
      console.log(this.settings.validation.errors.map(a => `-> Error: ${a.stack}`).join('\n'));
      return null;
    }
  }

  private getDBWrapper(dbConfiguration: IDBConfiguration): DBManager {
    switch (dbConfiguration.dbType) {
      case 'PostgreSQL':
        return new PostgreSQLManager(dbConfiguration);
    }

    return null;
  }
}
