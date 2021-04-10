import {ApiCommand, RequestType} from '../api.command';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {DatabaseFunctions} from '../../obj/database.functions';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../obj/http-codes/client.codes';

export class UserExistsHashCommand extends ApiCommand {
    constructor() {
        super('existsWithHash', '/users', RequestType.GET, '/v1/hash', false,
            []);

        this._description = 'Returns a boolean if user with the hash exists.';
        this._acceptedContentType = 'application/json';
        this._responseContentType = 'application/json';

        // relevant for reference creation
        this._requestStructure = {
            type: 'object',
            properties: {
                hash: {
                    type: 'string',
                    required: true
                }
            }
        };

        // relevant for reference creation
        this._responseStructure = {
            ...this.defaultRequestSchema,
            properties: {
                ...this.defaultResponseSchema.properties,
                data: {
                    type: 'array',
                    items: {
                        type: 'boolean',
                        required: true
                    }
                }
            }
        };
    }

    async do(req, res) {
        const answer = ApiCommand.createAnswer();
        const validation = this.validate(req.params, req.body, req.query);

        if (validation.length === 0) {
            try {
                answer.data = await DatabaseFunctions.getUserByHash(req.query.hash);
                this.checkAndSendAnswer(res, answer, false);
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
