import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../obj/http-codes/client.codes';
import {CreateProjectRequest, ProjectCreateResponse, UserRole} from '@octra/db';

export class ProjectCreateCommand extends ApiCommand {
  constructor() {
    super('createProject', '/projects', RequestType.POST, '/', true,
      [
        UserRole.administrator
      ]);

    this._description = 'Creates a new transcription project.';
    this._acceptedContentType = 'application/json';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {
      properties: {
        ...this.defaultRequestSchema.properties,
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
            project_admins: {
              type: 'array',
              required: true
            }
          }
        }
      }
    };
  }

  async do(req, res) {
    const answer = ApiCommand.createAnswer() as ProjectCreateResponse;
    const validation = this.validate(req);

    // do something
    if (validation.length === 0) {
      const body: CreateProjectRequest = req.body;
      try {
        const result = await DatabaseFunctions.createProject(body, req.decoded.id);
        if (result.length === 1) {
          answer.data = result[0];
          if (answer.data.configuration) {
            try {
              answer.data.configuration = JSON.parse(answer.data.configuration);
            } catch (e) {
              console.error(e);
            }
          }

          this.checkAndSendAnswer(res, answer);
          return;
        }

        ApiCommand.sendError(res, InternalServerError, 'Could not create project.');
      } catch (e) {
        ApiCommand.sendError(res, InternalServerError, e);
      }
    } else {
      ApiCommand.sendError(res, BadRequest, validation);
    }

    return;
  }
}
