/***
 * This class contains a list of API commands and a call() method to use a command from list
 */
import * as fs from 'fs';
import {Express, Router} from 'express';
import * as bodyParser from 'body-parser';
import {RegisterCommand} from './commands/user/register.command';
import {LoginCommand} from './commands/user/login.command';
import {ApiCommand} from './commands/api.command';
import {FileSystemHandler} from './filesystem-handler';

export class API {
    static get appPath(): string {
        return this._appPath;
    }

    static get settings(): any {
        return this._settings;
    }

    static get commands(): any[] {
        return this._commands;
    }

    public static get information() {
        return {
            name: 'OCTRA',
            version: '0.0.1'
        }
    }

    private static _commands: ApiCommand[] = [];
    private static _settings: any;
    private static _appPath: string;

    /***
     * initializes API
     * @param app Express server
     * @param router Express router
     * @param environment 'production' or 'development'
     */
    public static init(app: Express, router: Router, environment: 'production' | 'development') {
        this._appPath = process.cwd();

        router.use(bodyParser.urlencoded({extended: false}));
        router.use(bodyParser.json());

        const settings = fs.readFileSync(this._appPath + '/config.json',
            {
                encoding: 'utf-8'
            }
        );

        API._settings = JSON.parse(settings);

        // list of supported commands
        API._commands = [
            new RegisterCommand(),
            new LoginCommand()
        ];

        // register all commands
        for (let i = 0; i < API._commands.length; i++) {
            const command = API._commands[i];

            command.register(app, router, environment);
        }

        //create data directory
        if (!FileSystemHandler.existsPath(this.settings.uploadPath)) {
            FileSystemHandler.mkDir(this.settings.uploadPath);
        }
    }
}
