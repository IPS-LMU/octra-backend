import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../obj/http-codes/client.codes';
import {AssignUserRoleRequest, UserAssignRolesResponse, UserRole} from '@octra/db';

export class UserAssignRolesCommand extends ApiCommand {

  constructor() {
    super('assignUserRoles', '/users', RequestType.POST, '/:id/roles', true,
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
            type: 'object',
            required: ['role'],
            properties: {
              role: {
                type: 'string',
                enum: ['administrator', 'transcriber', 'data_delivery', 'project_admin']
              },
              project_id: {
                type: 'number'
              }
            }
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

  async do(req, res) {
    const validation = this.validate(req);
    // do something
    if (validation.length === 0) {
      const userData: AssignUserRoleRequest = req.body;
      userData.accountID = req.params.id;
      try {
        const answer = ApiCommand.createAnswer() as UserAssignRolesResponse;
        await DatabaseFunctions.assignUserRolesToUser(userData);
        this.checkAndSendAnswer(res, answer, false);
      } catch (e) {
        console.log(e);
        ApiCommand.sendError(res, InternalServerError, 'Could not assign user role.', false);
      }
    } else {
      ApiCommand.sendError(res, BadRequest, validation, false);
    }

    return;
  }
}
