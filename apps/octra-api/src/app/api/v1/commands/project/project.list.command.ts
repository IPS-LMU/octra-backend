import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../obj/http-codes/client.codes';
import {ProjectListResponse, UserRole} from '@octra/db';
import {ProjectSchema} from './project.json.schema';

export class ProjectListCommand extends ApiCommand {
  constructor() {
    super('listProjects', '/projects', RequestType.GET, '/', true,
      [
        UserRole.administrator,
        UserRole.transcriber
      ]);

    this._description = 'List projects.';
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
          items: ProjectSchema
        }
      }
    };
  }

  async do(req, res) {
    const answer = ApiCommand.createAnswer() as ProjectListResponse;
    const validation = this.validate(req);

    // do something
    if (validation.length === 0) {
      try {
        answer.data = await DatabaseFunctions.listProjects();

        answer.data = answer.data.map(a => {
          if (a.configuration) {
            try {
              a.configuration = JSON.parse(a.configuration);
            } catch (e) {
              console.error(e);
              a.configuration = {};
            }
          } else {
            a.configuration = {};
          }
          return a;
        });

        if (req.decoded && req.decoded.accessRights.find(a => a !== UserRole.transcriber) > -1) {
          // is not administrator, remove data
          answer.data = answer.data.filter(a => a.active);

          for (const projectRow of answer.data) {
            delete projectRow.enddate;
            delete projectRow.startdate;
            delete projectRow.active;
          }

          // show only active projects
          answer.data = answer.data.filter(a => a.active);
        }

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
