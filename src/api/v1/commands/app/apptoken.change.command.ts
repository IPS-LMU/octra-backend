import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {UserRole} from '../../obj/database.types';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../obj/http-codes/client.codes';
import {CreateAppTokenRequest} from '../../obj/request.types';

export class AppTokenChangeCommand extends ApiCommand {
    constructor() {
        super('changeAppToken', '/app', RequestType.PUT, '/tokens/:id', true,
            [
                UserRole.administrator
            ]);

        this._description = 'Changes an app token.';
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
                },
                registrations: {
                    type: 'boolean'
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
                        },
                        registrations: {
                            type: 'boolean'
                        }
                    }
                }
            }
        };
    }

    async do(req, res) {
        const answer = ApiCommand.createAnswer();
        const validation = this.validate(req.params, req.body);
        const data: CreateAppTokenRequest = req.body;
        // do something
        if (validation.length === 0) {
            if (req.params && req.params.id) {
                try {
                    answer.data = await DatabaseFunctions.changeAppToken({
                        ...data,
                        id: req.params.id
                    });
                    this.checkAndSendAnswer(res, answer);
                } catch (e) {
                    ApiCommand.sendError(res, InternalServerError, e);
                }
            } else {
                ApiCommand.sendError(res, BadRequest, 'Missing app token id.');
            }
        } else {
            ApiCommand.sendError(res, BadRequest, validation);
        }

        return;
    }
}
