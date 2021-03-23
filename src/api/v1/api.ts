/***
 * This class contains a list of API commands and a call() method to use a command from list
 */
import {Express, Router} from 'express';
import * as bodyParser from 'body-parser';
import {ApiCommand} from './commands/api.command';
import {SampleCommand} from './commands/sample.command';
import {APIV1Module} from './api.module';
import {AppConfiguration} from '../../obj/app-config/app-config';
import {DBManager} from '../../db/DBManager';
import {DatabaseFunctions} from './obj/database.functions';

export class APIV1 {
    get appPath(): string {
        return this._appPath;
    }

    get commands(): any[] {
        return this._commands;
    }

    public get information() {
        return {
            name: 'OCTRA',
            version: '0.0.1',
            apiSlug: 'v1'
        }
    }

    public get instance(): APIV1 {
        if (APIV1.instance === undefined) {
            return new APIV1();
        }
        return APIV1.instance;
    }

    private _commands: ApiCommand[] = [];
    private _appPath: string;
    private static instance: APIV1;

    private dbManager: DBManager<any>;

    /***
     * initializes API
     * @param app Express server
     * @param router Express router
     * @param environment 'production' or 'development'
     * @param settings
     */
    public init(app: Express, router: Router, environment: 'production' | 'development', settings: AppConfiguration,
                dbManager: DBManager<any>) {
        this._appPath = process.cwd();
        this.dbManager = dbManager;
        DatabaseFunctions.init(this.dbManager, settings);

        router.use(bodyParser.urlencoded({extended: false}));
        router.use(bodyParser.json());

        // list of supported commands
        this._commands = APIV1Module.commands;

        // register all commands
        for (let i = 0; i < this._commands.length; i++) {
            const command = this._commands[i];
            command.register(app, router, environment, settings, dbManager);
        }

        const commandsArray = [];

        for (let i = 0; i < this.commands.length; i++) {
            const command = this.commands[i];
            commandsArray.push(command.getInformation());
        }

        app.get(`/${this.information.apiSlug}/reference`, (req, res) => {
            // const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
            res.render(`api/${this.information.apiSlug}/index.ejs`, {
                commands: commandsArray,
                apiDefaultResponseSchema: JSON.stringify(new SampleCommand().defaultResponseSchema, null, 2),
                apiInformation: this.information,
                appSettings: settings,
                url: settings.api.url
            });
        });

    }
}
