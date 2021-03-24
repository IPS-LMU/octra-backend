import {ApiCommand, RequestType} from '../api.command';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {DatabaseFunctions} from '../../obj/database.functions';
import {UserRole} from '../../obj/database.types';

export class UserRemoveCommand extends ApiCommand {
    constructor() {
        super('removeUser', RequestType.DELETE, '/v1/user/:id', true,
            [
                UserRole.administrator
            ]);

        this._description = 'Removes a user by id.';
        this._acceptedContentType = 'application/json';
        this._responseContentType = 'application/json';

        // relevant for reference creation
        this._requestStructure = {};

        // relevant for reference creation
        this._responseStructure = {
            properties: {
                ...this.defaultResponseSchema.properties,
                data: {
                    type: 'object',
                    properties: {
                        removedRows: {
                            type: 'number'
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
            if (req.params.hasOwnProperty('id')) {
                try {
                    await DatabaseFunctions.removeUserByID(req.params.id);
                    answer.data = {};
                    this.checkAndSendAnswer(res, answer);
                } catch (e) {
                    console.log(e);
                    ApiCommand.sendError(res, 400, e);
                }
            } else {
                ApiCommand.sendError(res, 400, 'Missing ID in URI');
            }
        } else {
            ApiCommand.sendError(res, 400, validation);
        }

        return;
    }
}
