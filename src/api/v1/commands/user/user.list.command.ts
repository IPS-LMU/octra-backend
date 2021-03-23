import {ApiCommand, RequestType} from '../api.command';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {DatabaseFunctions} from '../../obj/database.functions';

export class UserListCommand extends ApiCommand {
    constructor() {
        super('listUsers', RequestType.GET, '/v1/user/', true);

        this._description = 'Returns a list of users.';
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
                        required: ['id', 'username', 'createdate', 'active'],
                        properties: {
                            id: {
                                type: 'number'
                            },
                            username: {
                                type: 'string'
                            },
                            createdate: {
                                type: 'string'
                            },
                            active: {
                                type: 'boolean'
                            },
                            training: {
                                type: 'string'
                            },
                            comment: {
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
                answer.data = await DatabaseFunctions.listUsers();
                this.checkAndSendAnswer(res, answer);
            } catch (e) {
                console.log(e);
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
