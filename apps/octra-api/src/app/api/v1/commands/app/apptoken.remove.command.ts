import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {UserRole} from '../../obj/database.types';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../obj/http-codes/client.codes';

export class AppTokenRemoveCommand extends ApiCommand {
    constructor() {
        super('removeAppToken', '/app', RequestType.DELETE, '/tokens/:id', true,
            [
                UserRole.administrator
            ]);

        this._description = 'Removes an app token.';
        this._acceptedContentType = 'application/json';
        this._responseContentType = 'application/json';

        // relevant for reference creation
        this._requestStructure = {};

        // relevant for reference creation
        this._responseStructure = {
            properties: {
                ...this.defaultResponseSchema.properties
            }
        };
    }

    async do(req, res) {
        const answer = ApiCommand.createAnswer();
        const validation = this.validate(req.params, req.body);

        // do something
        if (validation.length === 0) {
            try {
                await DatabaseFunctions.removeAppToken(req.params.id);
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
