import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../obj/http-codes/client.codes';
import {ProjectListResponse, UserRole} from '@octra/db';

export class ProjectListCommand extends ApiCommand {
  constructor() {
    super('listProjects', '/projects', RequestType.GET, '/', true,
      [
        UserRole.public,
        UserRole.administrator
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
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'number',
                required: true
              },
              name: {
                type: 'string',
                required: true
              },
              shortname: {
                type: 'string'
              },
              description: {
                type: 'string'
              },
              configuration: {
                type: 'json'
              },
              startdate: {
                type: 'date-time'
              },
              enddate: {
                type: 'date-time'
              },
              active: {
                type: 'boolean'
              },
              admin_id: {
                type: 'number'
              }
            }
          }
        }
      }
    };
  }

  async do(req, res) {
    const answer = ApiCommand.createAnswer() as ProjectListResponse;
    const validation = this.validate(req.params, req.body);

    // do something
    if (validation.length === 0) {
      try {
        answer.data = await DatabaseFunctions.listProjects();

        if (!req.decoded) {
          console.log(req.decoded);
          console.log(`IS PUBLIC`);
          // is public
          answer.data = answer.data.filter(a => a.active);

          for (const projectRow of answer.data) {
            delete projectRow.enddate;
            delete projectRow.admin_id;
            delete projectRow.configuration;
            delete projectRow.startdate;
            delete projectRow.active;
          }
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