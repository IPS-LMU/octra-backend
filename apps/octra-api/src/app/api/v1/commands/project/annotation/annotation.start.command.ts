import {AnnotationStartResponse, StartAnnotationRequest, UserRole} from '@octra/db';
import {ApiCommand, RequestType} from '../../api.command';
import {DatabaseFunctions} from '../../../obj/database.functions';
import {InternalServerError} from '../../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../../obj/http-codes/client.codes';
import {InternRequest} from '../../../obj/types';
import {Response} from 'express';

export class AnnotationStartCommand extends ApiCommand {
  constructor() {
    super('startAnnotation', '/projects', RequestType.POST, '/:project_id/annotations/start', true,
      [
        UserRole.transcriber
      ]);

    this._description = 'Starts a new annotation.';
    this._acceptedContentType = 'application/json';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {};

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
              }
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
            },
            transcripts_free_count: {
              type: 'number',
              required: true
            }
          }
        }
      }
    };
  }

  async do(req: InternRequest, res: Response) {
    const answer = ApiCommand.createAnswer() as AnnotationStartResponse;
    const validation = this.validate(req);
    const tokenData = req.decoded;


    if (!req.params.project_id) {
      ApiCommand.sendError(res, BadRequest, 'Missing project_id in URI.');
      return;
    }

    // do something
    if (validation.length === 0) {
      const body: StartAnnotationRequest = req.body;
      try {
        const result = await DatabaseFunctions.startAnnotation(body, Number(req.params.project_id), tokenData);
        if (result) {
          answer.data = {
            ...result,
            log: (result.log !== undefined && result.log !== '') ? JSON.parse(result.log) : [],
            transcript: (result.transcript !== undefined && result.transcript !== '') ? JSON.parse(result.transcript) : undefined,
            transcripts_free_count: result.transcripts_free_count
          };
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
