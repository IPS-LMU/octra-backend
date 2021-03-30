import {ApiCommand, RequestType} from '../api.command';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {DatabaseFunctions} from '../../obj/database.functions';
import {UserRole} from '../../obj/database.types';
import {InternalServerError} from '../../../../obj/htpp-codes/server.codes';
import {BadRequest} from '../../../../obj/htpp-codes/client.codes';

export class AppTokenListCommand extends ApiCommand {
    constructor() {
        super('listAppTokens','Application', RequestType.GET, '/v1/app/tokens/', true,
            [
                UserRole.administrator
            ]);

        this._description = 'Returns a list of app tokens';
        this._acceptedContentType = 'application/json';
        this._responseContentType = 'application/json';

        // relevant for reference creation
        this._requestStructure = {};

        // relevant for reference creation
        this._responseStructure = {
            properties: {
                ...this.defaultResponseSchema.properties,
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['id', 'name', 'key'],
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
                            },
                            registrations: {
                                type: 'boolean'
                            }
                        }
                    }
                }
            }
        };
    }

    async do(req, res, settings: AppConfiguration) {
        const answer = ApiCommand.createAnswer();
        const validation = this.validate(req.params, req.body);

        if (validation.length === 0) {
            try {
                answer.data = await DatabaseFunctions.listAppTokens();
                this.checkAndSendAnswer(res, answer);
            } catch (e) {
                ApiCommand.sendError(res, InternalServerError, e);
            }
        } else {
            ApiCommand.sendError(res, BadRequest, validation);
        }

        return;
    }
}
