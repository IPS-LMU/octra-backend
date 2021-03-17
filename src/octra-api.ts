import * as express from 'express';
import * as bodyParser from 'body-parser';
import {API} from './obj/v1/API';
import * as path from 'path';
import {ApiCommand} from './obj/v1/commands/api.command';
import {createTerminus} from '@godaddy/terminus';
import * as fsExtra from 'fs-extra';
import * as ejs from 'ejs';

export class OctraApi {
    constructor(environment: 'development' | 'production') {
        const app = express();
        app.set('view engine', 'ejs');
        app.engine('ejs', ejs.__express); //<-- this

        const router = express.Router();
        API.init(app, router, environment);


        app.get('/robots.txt', function (req, res) {
            res.type('text/plain');
            res.send('User-agent: *\nDisallow: /');
        });

        // use bodyParser in order to parse JSON data
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());

        app.all('/v1/*', (req, res, next) => {
            const authorization = req.get('Authorization');

            if (authorization) {
                const isValidKey = API.settings.apiKeys.findIndex((a) => {
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
        const port = process.env.PORT || API.settings.port;

        if (API.settings.debugging) {
            router.use(function (req, res, next) {
                // do logging
                console.log(`Got new request`);
                console.log(JSON.stringify(req.headers));
                next(); // make sure we go to the next routes and don't stop here
            });
        }

        const commandsArray = [];

        for (let i = 0; i < API.commands.length; i++) {
            const command = API.commands[i];
            commandsArray.push(command.getInformation());
        }

        app.get('/', function (req, res) {
            const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

            res.render(API.appPath + '/views/index.ejs', {
                commands: commandsArray,
                appInformation: API.information,
                appSettings: API.settings,
                url: API.settings.apiURL
            });
        });

        console.log(`LOAD static: ${path.join(API.appPath, 'static')}`);
        app.use(express.static(path.join(API.appPath, 'static')));
        app.use('/', router);

        router.route('*').all((req, res) => {
            const answer = ApiCommand.createAnswer();
            answer.status = 'error';
            answer.message = 'This route does not exist. Please check your URL again.';

            res.status(400).send(answer);
        });

        if (API.settings.debugging) {
            console.log('\nActivated routes:\n-------');
            // output activated commands
            for (let i = 0; i < API.commands.length; i++) {
                const command: ApiCommand = API.commands[i];

                console.log(`Route: ${command.url}`);
            }
        }

        // Start listening!
        const server = app.listen(port, API.settings.hostname, () => {
            console.log(`\nStarted ${API.information.name} REST API (v${API.information.version}) on http://localhost:${API.settings.port}!`);
        });

        createTerminus(server, {
            signal: 'SIGINT',
            onSignal: () => {
                return new Promise<any>((resolve) => {
                    console.log(`\nShutdown...`);
                    fsExtra.removeSync('./static/bootstrap/');
                    resolve(null);
                });
            }
        })
    }
}
