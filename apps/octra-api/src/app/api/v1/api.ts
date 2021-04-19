/***
 * This class contains a list of API commands and a call() method to use a command from list
 */
import {Express, Router} from 'express';
import * as bodyParser from 'body-parser';
import {SampleCommand} from './commands/sample.command';
import {APIV1Module} from './api.module';
import {AppConfiguration} from '../../obj/app-config/app-config';
import {DatabaseFunctions} from './obj/database.functions';
import {CommandModule} from './commands/command.module';
import {DBManager} from '../../db/db.manager';

export class APIV1 {
    get modules(): CommandModule[] {
        return this._modules;
    }

    get appPath(): string {
        return this._appPath;
    }

    public get information() {
        return {
            name: 'OCTRA',
            version: '0.2.7',
            apiSlug: 'v1'
        }
    }

    private _modules: CommandModule[] = [];

    public get instance(): APIV1 {
        if (APIV1.instance === undefined) {
            return new APIV1();
        }
        return APIV1.instance;
    }

    private _appPath: string;
    private static instance: APIV1;

    /***
     * initializes API
     * @param app Express server
     * @param environment 'production' or 'development'
     * @param settings
     * @param dbManager
     */
    public init(app: Express, environment: 'production' | 'development', settings: AppConfiguration, dbManager: DBManager) {
        DatabaseFunctions.init(dbManager, settings);
        this._appPath = process.cwd();
        const v1Router = Router();

        v1Router.use(bodyParser.urlencoded({extended: false}));
        v1Router.use(bodyParser.json());

        this._modules = APIV1Module.modules;
        // register all commands
        for (let i = 0; i < this._modules.length; i++) {
            const module = this._modules[i];
            module.init(v1Router, environment, settings);
        }

        const commandsArray = APIV1Module.modules.map(a => a.commands).reduce((acc, x) => {
            return acc.concat(x, []);
        }).map((a) => {
            return {
                ...a,
                _requestStructure: JSON.stringify(a.requestStructure, null, 2),
                _responseStructure: JSON.stringify(a.responseStructure, null, 2),
                _url: `/${this.information.apiSlug}${a.root}${a.url}`
            }
        });
        commandsArray.sort((a, b) => {
            if ((a as any)._name > (b as any)._name) {
                return 1;
            } else if ((a as any)._name < (b as any)._name) {
                return -1;
            }
            return 0;
        });

        v1Router.route(`/reference`).get((req, res) => {
            // const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
            res.render(`api/${this.information.apiSlug}/index.ejs`, {
                commands: commandsArray,
                apiDefaultResponseSchema: JSON.stringify(new SampleCommand().defaultResponseSchema, null, 2),
                apiInformation: this.information,
                appSettings: settings,
                url: settings.api.url
            });
        });

        app.use(`/${this.information.apiSlug}`, v1Router);
    }
}
