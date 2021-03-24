import {ApiCommand, RequestType} from '../api.command';
import {AppConfiguration} from '../../../../obj/app-config/app-config';
import {DatabaseFunctions} from '../../obj/database.functions';
import {AssignUserRoleRequest} from '../../obj/request.types';
import {UserRole} from '../../obj/database.types';

export class UserAssignRolesCommand extends ApiCommand {

    constructor() {
        super('assignUserRoles', RequestType.POST, '/v1/users/:id/roles', true,
            [
                UserRole.administrator
            ]);
        this._description = 'Assign user role for given account id.';
        this._acceptedContentType = 'application/json';
        this._responseContentType = 'application/json';

        // relevant for reference creation
        this._requestStructure = {
            ...this.defaultRequestSchema,
            type: 'object',
            properties: {
                ...this.defaultRequestSchema.properties,
                roles: {
                    type: 'array',
                    items: {
                        type: 'string',
                        enum: ['administrator', 'transcriber', 'data delivery', 'project administrator']
                    },
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
        if (validation === '' && req.params && req.params.id) {
            const userData: AssignUserRoleRequest = req.body;
            userData.accountID = req.params.id;
            try {
                const answer = ApiCommand.createAnswer();
                await DatabaseFunctions.assignUserRolesToUser(userData);
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
