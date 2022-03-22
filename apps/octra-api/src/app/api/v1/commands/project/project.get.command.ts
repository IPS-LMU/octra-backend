import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../obj/http-codes/client.codes';
import {ProjectCreateResponse, UserRole} from '@octra/db';
import {ProjectSchema} from './project.json.schema';

export class ProjectGetCommand extends ApiCommand {
  constructor() {
    super('getProject', '/projects', RequestType.GET, '/:project_id', true,
      [
        UserRole.administrator
      ]);

    this._description = 'Returns information about a project.';
    this._acceptedContentType = 'application/json';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {};

    // relevant for reference creation
    this._responseStructure = {
      properties: {
        ...this.defaultResponseSchema.properties,
        data: ProjectSchema
      }
    };
  }

  async do(req, res) {
    const answer = ApiCommand.createAnswer() as ProjectCreateResponse;
    const validation = this.validate(req);

    // do something
    if (validation.length === 0) {
      if (!req.params.project_id) {
        ApiCommand.sendError(res, InternalServerError, 'Missing id in URL.');
        return;
      }
      try {
        answer.data = await DatabaseFunctions.getProject(req.params.project_id);
        if (answer.data.configuration) {
          try {
            answer.data.configuration = JSON.parse(answer.data.configuration);
          } catch (e) {
            console.error(e);
          }
        }
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
