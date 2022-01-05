import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../obj/http-codes/client.codes';
import {CreateProjectRequest, ProjectCreateResponse, UserRole} from '@octra/db';

export class ProjectChangeCommand extends ApiCommand {
  constructor() {
    super('changeProject', '/projects', RequestType.PUT, '/:id', true,
      [
        UserRole.administrator,
        UserRole.projectAdministrator
      ]);

    this._description = 'Changes a project.';
    this._acceptedContentType = 'application/json';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {
      type: 'object',
      properties: {
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
          type: 'object'
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
    };

    // relevant for reference creation
    this._responseStructure = {
      properties: {
        ...this.defaultResponseSchema.properties,
        data: {
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
              type: 'object'
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
    };
  }

  async do(req, res) {
    const answer = ApiCommand.createAnswer() as ProjectCreateResponse;
    const validation = this.validate(req);
    const body: CreateProjectRequest = req.body;

    // do something
    if (validation.length === 0) {
      if (!req.params.id) {
        ApiCommand.sendError(res, InternalServerError, 'Missing id in URL.');
        return;
      }
      try {
        answer.data = await DatabaseFunctions.changeProject(req.params.id, body);

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
