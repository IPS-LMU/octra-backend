import {ApiCommand, RequestType} from '../api.command';
import {Express, Router} from 'express';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {DatabaseFunctions} from '../../obj/database.functions';

export class AppTokenCreateCommand extends ApiCommand {
    constructor() {
        super('createAppToken', RequestType.POST, '/v1/app/token/', true);

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
                ...this.defaultResponseSchema.properties,
                data: {
                    type: 'object',
                    required: ['name', 'key'],
                    properties: {
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
        };
    }

    async do(req, res, settings: AppConfiguration) {
        const answer = ApiCommand.createAnswer();
        const validation = this.validate(req.params, req.body);

        // do something
        if (validation === '') {
            const body: RequestStructure = req.body;
            try {
                const result = await DatabaseFunctions.createAppToken(body);
                if (result.length === 1) {
                    answer.data = result[0];

                    this.checkAndSendAnswer(res, answer);
                }
                ApiCommand.sendError(res, 400, 'Could not create app token.');
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
