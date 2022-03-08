import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {ProjectTranscriptsGetResponse, UserRole} from '@octra/db';

export class ProjectTranscriptsGetCommand extends ApiCommand {
  constructor() {
    super('getProjectTranscripts', '/projects', RequestType.GET, '/:id/transcripts', true,
      [
        UserRole.administrator,
        UserRole.dataDelivery
      ]);

    this._description = 'Returns all transcripts of a given project.';
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
              pid: {
                type: 'string'
              },
              orgtext: {
                type: 'string'
              },
              transcript: {
                type: 'object'
              },
              assessment: {
                type: 'string'
              },
              priority: {
                type: 'number'
              },
              status: {
                type: 'string'
              },
              code: {
                type: 'string'
              },
              creationdate: {
                type: 'date-time'
              },
              startdate: {
                type: 'date-time'
              },
              enddate: {
                type: 'date-time'
              },
              log: {
                type: 'string'
              },
              comment: {
                type: 'string'
              },
              tool_id: {
                type: 'number'
              },
              transcriber_id: {
                type: 'number'
              },
              project_id: {
                type: 'number'
              },
              file_id: {
                type: 'number'
              },
              file: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    required: true
                  },
                  type: {
                    type: 'string'
                  },
                  size: {
                    type: 'number'
                  },
                  filename: {
                    type: 'string'
                  },
                  metadata: {
                    type: 'object'
                  }
                }
              },
              nexttranscript_id: {
                type: 'number'
              }
            }
          }
        }
      }
    };
  }

  async do(req, res) {
    const answer = ApiCommand.createAnswer() as ProjectTranscriptsGetResponse;
    const validation = this.validate(req);
    // do something
    if (validation.length === 0) {
      try {
        answer.data = await DatabaseFunctions.getTranscriptsByProjectID(Number(req.params.id));
        this.checkAndSendAnswer(res, answer);
        return;
      } catch (e) {
        console.log(e);
        ApiCommand.sendError(res, InternalServerError, e);
      }
    } else {
      ApiCommand.sendError(res, InternalServerError, validation);
    }
    return;
  }
}
