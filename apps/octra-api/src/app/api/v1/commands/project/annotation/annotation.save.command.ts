import {SaveAnnotationRequest, TokenData, TranscriptAddResponse, UserRole} from '@octra/db';
import {ApiCommand, RequestType} from '../../api.command';
import {DatabaseFunctions} from '../../../obj/database.functions';
import {InternalServerError} from '../../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../../obj/http-codes/client.codes';

export class AnnotationSaveCommand extends ApiCommand {
  constructor() {
    super('saveAnnotation', '/projects', RequestType.POST, '/:project_id/annotations/:id/save', true,
      [
        UserRole.transcriber
      ]);

    this._description = 'Saves the transcript and sets its status to \'ANNOTATED\'.';
    this._acceptedContentType = 'application/json';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {
      required: ['transcript', 'tool_id'],
      properties: {
        ...this.defaultRequestSchema.properties,
        transcript: {
          type: 'string'
        },
        comment: {
          type: 'string'
        },
        assessment: {
          type: 'string'
        },
        log: {
          type: 'string'
        },
        tool_id: {
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
            orgtext: {
              type: 'string'
            },
            transcript: {
              type: 'string'
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
              type: 'string'
            },
            startdate: {
              type: 'string'
            },
            enddate: {
              type: 'string'
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
            project_id: {
              type: 'number'
            },
            mediaitem: {
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
                metadata: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    };
  }

  async do(req, res) {
    const answer = ApiCommand.createAnswer() as TranscriptAddResponse;
    const validation = this.validate(req.params, req.body);
    const tokenData = req.decoded as TokenData;


    if (!req.params.project_id) {
      ApiCommand.sendError(res, BadRequest, 'Missing project_id in URI.');
      return;
    }
    if (!req.params.id) {
      ApiCommand.sendError(res, BadRequest, 'Missing id in URI.');
      return;
    }

    // do something
    if (validation.length === 0) {
      const body: SaveAnnotationRequest = req.body;
      try {
        const result = await DatabaseFunctions.saveAnnotation(body, req.params.project_id, req.params.id, tokenData);
        if (result) {
          answer.data = result;
          this.checkAndSendAnswer(res, answer);
          return;
        }
        ApiCommand.sendError(res, InternalServerError, 'Can not start new annotation.');
      } catch (e) {
        console.log(e);
        ApiCommand.sendError(res, InternalServerError, e);
      }
    } else {
      ApiCommand.sendError(res, BadRequest, validation);
    }

    return;
  }
}
