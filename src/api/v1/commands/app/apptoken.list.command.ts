import {ApiCommand, RequestType} from '../api.command';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {DatabaseFunctions} from '../../obj/database.functions';
import {UserRole} from '../../obj/database.types';

export class AppTokenListCommand extends ApiCommand {
    constructor() {
        super('listAppTokens', RequestType.GET, '/v1/app/token/', true,
            [
                UserRole.administrator
            ]);

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

        if (validation === '') {
            try {
                answer.data = await DatabaseFunctions.listAppTokens();
                this.checkAndSendAnswer(res, answer);
            } catch (e) {
                ApiCommand.sendError(res, 400, e);
            }
        } else {
            ApiCommand.sendError(res, 400, validation);
        }

        return;
    }
}
