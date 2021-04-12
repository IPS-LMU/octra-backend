import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {UserRole} from '../../obj/database.types';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../obj/http-codes/client.codes';

export class UserListCommand extends ApiCommand {
    constructor() {
        super('listUsers', '/users', RequestType.GET, '/', true,
            [
                UserRole.administrator
            ]);

        this._description = 'Returns a list of users.';
        this._acceptedContentType = 'application/json';
        this._responseContentType = 'application/json';

        // relevant for reference creation
        this._requestStructure = {};

        // relevant for reference creation
        this._responseStructure = {
            ...this.defaultRequestSchema,
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
                            roles: {
                                type: 'array',
                                items: {
                                    type: 'string'
                                }
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

    async do(req, res) {
        const answer = ApiCommand.createAnswer();
        const validation = this.validate(req.params, req.body);

        if (validation.length === 0) {
            try {
                answer.data = await DatabaseFunctions.listUsers();
                this.checkAndSendAnswer(res, answer);
            } catch (e) {
                console.log(e);
                ApiCommand.sendError(res, InternalServerError, e);
            }
        } else {
            ApiCommand.sendError(res, BadRequest, validation);
        }

        return;
    }
}