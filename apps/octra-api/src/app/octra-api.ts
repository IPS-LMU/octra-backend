import {Express, NextFunction, Request, Response} from 'express';
import * as bodyParser from 'body-parser';
import {APIV1} from './api/v1/api';
import * as path from 'path';
import * as Path from 'path';
import {ApiCommand} from './api/v1/commands/api.command';
import {createTerminus} from '@godaddy/terminus';
import * as fsExtra from 'fs-extra';
import * as ejs from 'ejs';
import * as fs from 'fs';
import * as cors from 'cors';
import {APIModule} from './octra-api.module';
import {AppConfiguration, IDBConfiguration} from './obj/app-config/app-config';
import {DBManager} from './db/DBManager';
import {PostgreSQLManager} from './db/postgreSQL.manager';
import express = require('express');
import * as cookieParser from 'cookie-parser';
import {SHA256} from 'crypto-js';
import {ShibbolethAuthenticator} from './authenticators/shibboleth/shibboleth.authenticator';

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
  private version = '0.2.7';
  private environment: 'development' | 'production';
  private dbManager: DBManager;

  constructor() {
    this._activeAPIs = APIModule.activeAPIs;
  }

  public init(environment: 'development' | 'production'): Express {
    this.environment = environment;
    if (environment === 'development') {
      this._executionPath = __dirname;
    } else {
      this._executionPath = path.dirname(process.execPath);
    }
    this._appPath = __dirname;

    // loadSettings
    const settingsJSON = fs.readFileSync(path.join(this._executionPath, 'config.json'),
      {
        encoding: 'utf-8'
      }
    );

    const appConfiguration = new AppConfiguration(JSON.parse(settingsJSON));
    this.settings = appConfiguration;
    this.settings.appPath = this._appPath;
    this.settings.executionPath = this._executionPath;
    this.settings.api.authenticator = {
      appToken: SHA256(Date.now() + '2634872h3gr692seß0d').toString()
    }

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
          next(); // make sure we go to the next routes and don't stop here
        });
      }

      console.log(`static is ${path.join(this._appPath, 'static')}`);
      app.use(express.static(path.join(this._appPath, 'static')));
      app.use('/', router);

      // TODO add this to the ShibbolethAuthenticator class
      router.route(`/authShibboleth`).get((req, res) => {
        const authenticator = new ShibbolethAuthenticator(this.settings.api.url, req.cookies);
        res.render(`authenticators/shibboleth/index.ejs`, {
          appToken: this.settings.api.authenticator.appToken,
          shibbolethUID: authenticator.uid
        });
      });

      router.route('*').all((req, res) => {
        ApiCommand.sendError(res, 400, `This route does not exist. Please check your URL again. ${req.url}`);
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
              console.log(`\t\t\t- ${command.root}${command.url} => ${command.name}`);
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
