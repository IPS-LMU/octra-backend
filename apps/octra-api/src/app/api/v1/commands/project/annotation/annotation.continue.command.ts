import {TranscriptAddResponse, UserRole} from '@octra/db';
import {ApiCommand, RequestType} from '../../api.command';
import {DatabaseFunctions} from '../../../obj/database.functions';
import {InternalServerError} from '../../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../../obj/http-codes/client.codes';
import {InternRequest} from '../../../obj/types';
import {Response} from 'express';

export class AnnotationContinueCommand extends ApiCommand {
  constructor() {
    super('continueAnnotation', '/projects', RequestType.POST, '/:project_id/annotations/:id/continue', true,
      [
        UserRole.transcriber
      ]);

    this._description = 'Continue an old annotation.';
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
      try {
        const result = await DatabaseFunctions.continueAnnotation(Number(req.params.project_id), Number(req.params.id), tokenData);
        if (result) {
          answer.data = result;
          this.checkAndSendAnswer(res, answer);
          return;
        }
        ApiCommand.sendError(res, InternalServerError, 'Can not continue the old annotation.');
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
