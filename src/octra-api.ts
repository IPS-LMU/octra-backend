import * as express from 'express';
import {Express} from 'express';
import * as bodyParser from 'body-parser';
import {APIV1} from './api/v1/api';
import * as path from 'path';
import {ApiCommand} from './api/v1/commands/api.command';
import {createTerminus} from '@godaddy/terminus';
import * as fsExtra from 'fs-extra';
import * as ejs from 'ejs';
import {Validator} from 'jsonschema';
import * as fs from 'fs';
import {APIModule} from './octra-api.module';

export class OctraApi {
    get appPath(): string {
        return this._appPath;
    }

    get activeAPIs(): APIV1[] {
        return this._activeAPIs;
    }

    private _activeAPIs = [];

    private _appPath: string;
    private settings: any;
    private name = 'OCTRA';
    private version = '0.0.1';
    private environment: 'development' | 'production';

    constructor() {
        this._appPath = __dirname;
        this._activeAPIs = APIModule.activeAPIs;
    }

    public init(environment: 'development' | 'production'): Express {
        this.environment = environment;

        // loadSettings
        const settingsJSON = fs.readFileSync(this._appPath + '/config.json',
            {
                encoding: 'utf-8'
            }
        );

        this.settings = JSON.parse(settingsJSON);
        this.settings.appPath = this._appPath;

        const app = express();
        app.set('view engine', 'ejs');
        app.engine('ejs', ejs.__express); //<-- this

        const router = express.Router();

        for (const api of this._activeAPIs) {
            api.init(app, router, environment, this.settings);
        }

        const validator = new Validator();
        const instance = 'ok';
        const schema = {'type': 'number'};
        console.log(`validation`);
        console.log(validator.validate(instance, schema).valid);
        console.log(validator.validate(instance, schema));

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

        // TODO convert API object to Class
        // TODO add static instance to API Class

        app.all('/v1/*', (req, res, next) => {
            let authorization = req.get('Authorization');

            if (authorization) {
                authorization = authorization.replace('Bearer ', '');
                const isValidKey = this.settings.apiKeys.findIndex((a) => {
                    return a.key === authorization;
                }) > -1;

                if (authorization !== '' && isValidKey) {
                    next();
                } else {
                    const answer = ApiCommand.createAnswer();
                    answer.status = 'error';
                    answer.message = 'Invalid authorization key';
                    res.status(403).json(answer);
                }
            } else {
                const answer = ApiCommand.createAnswer();
                answer.status = 'error';
                answer.message = `Missing 'Authorization' Header`;
                res.status(403).json(answer);
            }
        });

        //set port
        const port = process.env.PORT || this.settings.port;

        if (this.settings.debugging) {
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
        const server = app.listen(port, this.settings.hostname, () => {
            console.log(`\nStarted ${this.name} REST API (v${this.version}) on http://localhost:${this.settings.port}!\n`);
            console.log(`Active APIs:`);
            for (const api of this._activeAPIs) {
                console.log(`|- ${api.information.apiSlug}`);
                console.log(`|-- Reference: http://localhost:${this.settings.port}/${api.information.apiSlug}/reference\n\n`);
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
                    resolve(null);
                });
            }
        })

        return app;
    }
}
