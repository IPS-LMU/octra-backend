import {ApiCommand, RequestType} from '../api.command';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {DatabaseFunctions} from '../../obj/database.functions';
import {AssignUserRoleRequest} from '../../obj/request.types';

export class UserAssignRoleCommand extends ApiCommand {

    constructor() {
        super('assignUserRole', RequestType.POST, '/v1/user/roles/assign', true);

        this._description = 'Assign user role for given account id.';
        this._acceptedContentType = 'application/json';
        this._responseContentType = 'application/json';

        // relevant for reference creation
        this._requestStructure = {
            ...this.defaultRequestSchema,
            type: 'object',
            properties: {
                ...this.defaultRequestSchema.properties,
                accountID: {
                    required: true,
                    type: 'string'
                },
                role: {
                    type: 'string',
                    required: true
                }
            }
        };

        // relevant for reference creation
        this._responseStructure = {
            properties: {
                ...this.defaultResponseSchema.properties,
                data: undefined
            }
        };
    }

    async do(req, res, settings: AppConfiguration) {
        const validation = this.validate(req.params, req.body);

        // do something
        if (validation === '') {
            const userData: AssignUserRoleRequest = req.body;

            try {
                const answer = ApiCommand.createAnswer();
                await DatabaseFunctions.assignUserRole(userData);
                this.checkAndSendAnswer(res, answer, false);
            } catch (e) {
                console.log(e);
                ApiCommand.sendError(res, 400, 'Could not assign user role.', false);
            }
        } else {
            ApiCommand.sendError(res, 400, validation, false);
        }

        return;
    }
}
