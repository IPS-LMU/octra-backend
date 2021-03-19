import * as express from 'express';
import {Express} from 'express';
import * as bodyParser from 'body-parser';
import {APIV1} from './api/v1/api';
import * as path from 'path';
import {ApiCommand} from './api/v1/commands/api.command';
import {createTerminus} from '@godaddy/terminus';
import * as fsExtra from 'fs-extra';
import * as ejs from 'ejs';
import * as fs from 'fs';
import {APIModule} from './octra-api.module';
import {AppConfiguration, IDBConfiguration} from './obj/app-config/app-config';
import {DBManager} from './db/DBManager';
import {PostgreSQLManager} from './db/postgreSQL.manager';

export class OctraApi {
    get appPath(): string {
        return this._appPath;
    }

    get activeAPIs(): APIV1[] {
        return this._activeAPIs;
    }

    private _activeAPIs = [];

    private _appPath: string;
    private settings: AppConfiguration;
    private name = 'OCTRA';
    private version = '0.0.1';
    private environment: 'development' | 'production';
    private dbManager: DBManager<any, any>;

    constructor() {
        this._appPath = __dirname;
        this._activeAPIs = APIModule.activeAPIs;
    }

    public async init(environment: 'development' | 'production'): Promise<Express> {
        this.environment = environment;

        // loadSettings
        const settingsJSON = fs.readFileSync(this._appPath + '/config.json',
            {
                encoding: 'utf-8'
            }
        );

        const appConfiguration = new AppConfiguration(JSON.parse(settingsJSON));
        this.settings = appConfiguration;
        this.settings.appPath = this._appPath;

        if (this.settings.validation.valid) {
            const app = express();
            app.set('view engine', 'ejs');
            app.engine('ejs', ejs.__express); //<-- this

            const router = express.Router();

            this.dbManager = this.getDBWrapper(this.settings.database);

            for (const api of this._activeAPIs) {
                api.init(app, router, environment, this.settings, this.dbManager);
            }

            app.get('/robots.txt', function (req, res) {
                res.type('text/plain');
                res.send('User-agent: *\nDisallow: /');
            });

            // use bodyParser in order to parse JSON data
            app.use(bodyParser.urlencoded({extended: true}));
            app.use(bodyParser.json());

            app.get('/', (req, res) => {
                res.render(this._appPath + '/views/backend/index.ejs');
            });

            app.get('/login', (req, res) => {
                res.render(this._appPath + '/views/backend/login/index.ejs');
            });

            //set port
            let port = 0;
            if (process.env.PORT) {
                port = Number(process.env.PORT);
            } else {
                this.settings.api.port
            }

            if (this.settings.api.debugging) {
                router.use(function (req, res, next) {
                    // do logging
                    console.log(`Got new request`);
                    console.log(JSON.stringify(req.headers));
                    next(); // make sure we go to the next routes and don't stop here
                });
            }

            console.log(`LOAD static: ${path.join(this._appPath, 'static')}`);
            app.use(express.static(path.join(this._appPath, 'static')));
            app.use('/', router);

            router.route('*').all((req, res) => {
                const answer = ApiCommand.createAnswer();
                answer.status = 'error';
                answer.message = 'This route does not exist. Please check your URL again.';

                res.status(400).send(answer);
            });

            // Start listening!
            const server = app.listen(this.settings.api.port, this.settings.api.host, () => {
                console.log(`\nStarted ${this.name} REST API (v${this.version}) on http://localhost:${this.settings.api.port}!\n`);
                console.log(`Active APIs:`);
                for (const api of this._activeAPIs) {
                    console.log(`|- ${api.information.apiSlug}`);
                    console.log(`|-- Reference: http://localhost:${this.settings.api.port}/${api.information.apiSlug}/reference\n\n`);
                }
            });

            createTerminus(server, {
                signal: 'SIGINT',
                onSignal: () => {
                    return new Promise<any>((resolve) => {
                        if (this.environment === 'development') {
                            console.log(`\nDev mode: Clear auto generated folders...`);
                            fsExtra.removeSync('./build');
                        }
                        this.dbManager.close().then(() => {
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
        }
    }

    private getDBWrapper(dbConfiguration: IDBConfiguration): DBManager<any, any> {
        switch (dbConfiguration.dbType) {
            case 'PostgreSQL':
                return new PostgreSQLManager(dbConfiguration);
        }

        return null;
    }
}
