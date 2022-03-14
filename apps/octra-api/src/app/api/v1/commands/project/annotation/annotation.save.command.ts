import {SaveAnnotationRequest, TranscriptAddResponse, UserRole} from '@octra/db';
import {ApiCommand, RequestType} from '../../api.command';
import {DatabaseFunctions} from '../../../obj/database.functions';
import {InternalServerError} from '../../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../../obj/http-codes/client.codes';
import {InternRequest} from '../../../obj/types';
import {Response} from 'express';

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
      properties: {
        ...this.defaultRequestSchema.properties,
        transcript: {
          type: 'object',
          description: 'AnnotJSON as JSON object',
          required: true
        },
        comment: {
          type: 'string'
        },
        assessment: {
          type: 'string'
        },
        log: {
          type: 'array',
          items: {
            type: 'object'
          },
          description: 'Array of log items'
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
              type: 'array',
              items: {
                type: 'object'
              },
              description: 'Array of log items'
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

  async do(req: InternRequest, res: Response) {
    const answer = ApiCommand.createAnswer() as TranscriptAddResponse;
    const validation = this.validate(req);
    const tokenData = req.decoded;


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
        const result = await DatabaseFunctions.saveAnnotation(body, Number(req.params.project_id), req.params.id, tokenData);
        if (result) {
          try {
            result.transcript = JSON.parse(result.transcript);
            result.log = JSON.parse(result.log);
          } catch (e) {
            ApiCommand.sendError(res, InternalServerError, e);
            return;
          }
          answer.data = result;
          this.checkAndSendAnswer(res, answer);
          return;
        }
        this.checkAndSendAnswer(res, answer);
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
