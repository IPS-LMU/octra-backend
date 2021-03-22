import {ApiCommand, RequestType} from '../api.command';
import {Express, Router} from 'express';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {Database} from '../../obj/database';

export class AppTokenListCommand extends ApiCommand {
    constructor() {
        super('listAppTokens', RequestType.GET, '/v1/app/token/', true);

        this._description = 'Returns a list of app tokens';
        this._acceptedContentType = 'application/json';
        this._responseContentType = 'application/json';

        // relevant for reference creation
        this._requestStructure = {
            properties: {}
        };

        // relevant for reference creation
        this._responseStructure = {
            properties: {
                ...this.defaultResponseSchema.properties,
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['id', 'name', 'domain', 'description'],
                        properties: {
                            id: {
                                type: 'number'
                            },
                            name: {
                                type: 'string'
                            },
                            key: {
                                type: 'string'
                            },
                            domain: {
                                type: 'string'
                            },
                            description: {
                                type: 'string'
                            }
                        }
                    }
                }
            }
        };
    }

    register(app: Express, router: Router, environment, settings: AppConfiguration,
             dbManager) {
        super.register(app, router, environment, settings, dbManager);
    };

    async do(req, res, settings: AppConfiguration) {
        const answer = ApiCommand.createAnswer();
        const validation = this.validate(req.params, req.body);

        if (validation === '') {
            try {
                answer.data = await Database.listAppTokens();
                const responseValidation = this.validateAnswer(answer);
                if (responseValidation === '') {
                    res.status(200).send(answer);
                } else {
                    console.log(answer);
                    ApiCommand.sendError(res, 400, 'Response validation failed: ' + responseValidation);
                }
            } catch (e) {
                ApiCommand.sendError(res, 400, e);
            }
        } else {
            ApiCommand.sendError(res, 400, validation);
        }

        return;
    }
}

interface RequestStructure {
    name: string;
    domain?: string;
    description?: string;
}
