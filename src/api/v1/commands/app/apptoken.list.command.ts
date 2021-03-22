import {ApiCommand} from '../api.command';
import {Express, Router} from 'express';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {Database} from '../../obj/database';

export class AppTokenListCommand extends ApiCommand {
    constructor() {
        super('listAppTokens', 'GET', '/v1/app/token/', true);

        this._description = 'Returns a list of app tokens';
        this._acceptedContentType = 'application/json';
        this._responseContentType = 'application/json';

        // relevant for reference creation
        this._requestStructure = {
            properties: {
            }
        };

        // relevant for reference creation
        this._responseStructure = {
            properties: {
                ...this.defaultResponseSchema.properties,
            }
        };
        // TODO change response structure
    }

    register(app: Express, router: Router, environment, settings: AppConfiguration,
             dbManager) {
        // TODO make get/post/delete method calls related to class type
        super.register(app, router, environment, settings, dbManager);
        router.route(this.url).get((req, res) => {
            this.do(req, res, settings);
        });
    };

    do(req, res, settings: AppConfiguration) {
        const answer = ApiCommand.createAnswer();
        const validation = this.validate(req.params, req.body);

        // do something
        if (validation === '') {
            try {
                Database.listAppTokens().then((result) => {
                    answer.data = result;
                    res.status(200).send(answer);
                }).catch((error) => {
                    ApiCommand.sendError(res, 400, error);
                });
            } catch (e) {
                ApiCommand.sendError(res, 400, e);
            }
        } else {
            ApiCommand.sendError(res, 400, validation);
        }
    }
}

interface RequestStructure {
    name: string;
    domain?: string;
    description?: string;
}
