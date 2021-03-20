import {ApiCommand} from '../api.command';
import {Express, Router} from 'express';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {Database} from '../../obj/database';

export class AppTokenCreateCommand extends ApiCommand {
    constructor() {
        super('createAppToken', 'POST', '/v1/app/token/', true);

        this._description = 'Registers an app and returns a new App Token.';
        this._acceptedContentType = 'application/json';
        this._responseContentType = 'application/json';

        // relevant for reference creation
        this._requestStructure = {
            properties: {
                ...this.defaultRequestSchema.properties,
                name: {
                    type: 'string',
                    required: true
                },
                domain: {
                    type: 'string'
                },
                description: {
                    type: 'string'
                }
            }
        };

        // relevant for reference creation
        this._responseStructure = {
            properties: {
                ...this.defaultResponseSchema.properties
            }
        };
    }

    register(app: Express, router: Router, environment, settings: AppConfiguration,
             dbManager) {
        super.register(app, router, environment, settings, dbManager);
        router.route(this.url).post((req, res) => {
            this.do(req, res, settings);
        });
    };

    do(req, res, settings: AppConfiguration) {
        const answer = ApiCommand.createAnswer();
        const validation = this.validate(req.params, req.body);

        // do something
        if (validation === '') {
            const body: RequestStructure = req.body;
            try {
                Database.createAppToken(body).then((result) => {
                    if (result.length === 1) {
                        answer.data = result[0];
                    }
                    return res.status(200).send(answer);
                }).catch((error) => {
                    answer.status = 'error';
                    answer.message = error;
                    return res.status(400).send(answer);
                });
            } catch (e) {
                answer.status = 'error';
                answer.message = e;
                return res.status(400).send(answer);
            }
        } else {
            answer.status = 'error';
            answer.message = validation;
            return res.status(400).send(answer);
        }
    }
}

interface RequestStructure {
    name: string;
    domain?: string;
    description?: string;
}
