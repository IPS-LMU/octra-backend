import {TokenData, TranscriptAddResponse, UserRole} from '@octra/db';
import {ApiCommand, RequestType} from '../../api.command';
import {DatabaseFunctions} from '../../../obj/database.functions';
import {InternalServerError} from '../../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../../obj/http-codes/client.codes';

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
      try {
        const result = await DatabaseFunctions.continueAnnotation(req.params.project_id, req.params.id, tokenData);
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
