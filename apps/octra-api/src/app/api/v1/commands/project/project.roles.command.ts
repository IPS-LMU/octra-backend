import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../obj/http-codes/client.codes';
import {AssignProjectUserRolesRequestItem, UserRole} from '@octra/db';

export class ProjectAssignUserRolesCommand extends ApiCommand {
  constructor() {
    super('assignProjectUserRoles', '/projects', RequestType.POST, '/:project_id/roles', true,
      [
        UserRole.administrator,
        UserRole.projectAdministrator
      ]);

    this._description = 'Assigns a list of user roles to a specific project. If an entry already exists it will be overwritten.';
    this._acceptedContentType = 'application/json';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          userID: {
            type: 'number',
            required: true
          },
          role: {
            enum: ['project_admin', 'transcriber', 'data_delivery'],
            required: true
          }
        }
      }
    };

    // relevant for reference creation
    this._responseStructure = {
      properties: {
        ...this.defaultResponseSchema.properties
      }
    };

    delete this._responseStructure.properties.data;
  }

  async do(req, res) {
    const answer = ApiCommand.createAnswer();
    const validation = this.validate(req);
    const body: AssignProjectUserRolesRequestItem[] = req.body;

    // do something
    if (validation.length === 0) {
      if (!req.params.project_id) {
        ApiCommand.sendError(res, InternalServerError, 'Missing project_id in URL.');
        return;
      }

      try {
        answer.data = await DatabaseFunctions.assignUserRolesProject(req.params.project_id, body);
        this.checkAndSendAnswer(res, answer);
        return;
      } catch (e) {
        ApiCommand.sendError(res, InternalServerError, e);
      }
    } else {
      ApiCommand.sendError(res, BadRequest, validation);
    }

    return;
  }
}
