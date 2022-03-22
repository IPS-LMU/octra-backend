import {AnnotationStartResponse, StartAnnotationRequest, UserRole} from '@octra/db';
import {ApiCommand, RequestType} from '../../api.command';
import {DatabaseFunctions} from '../../../obj/database.functions';
import {InternalServerError} from '../../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../../obj/http-codes/client.codes';
import {InternRequest} from '../../../obj/types';
import {Response} from 'express';
import {AnnotationSchema} from './annotation.json.schema';

export class AnnotationFreeCommand extends ApiCommand {
  constructor() {
    super('freeAnnotation', '/projects', RequestType.POST, '/:project_id/annotations/:id/free', true,
      [
        UserRole.transcriber
      ]);

    this._description = 'Resets an busy annotation and sets status from \'BUSY\' to \'FREE\'';
    this._acceptedContentType = 'application/json';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {};

    // relevant for reference creation
    this._responseStructure = {
      properties: {
        ...this.defaultResponseSchema.properties,
        data: AnnotationSchema
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

    if (!req.params.id) {
      ApiCommand.sendError(res, BadRequest, 'Missing id in URI.');
      return;
    }

    // do something
    if (validation.length === 0) {
      const body: StartAnnotationRequest = req.body;
      try {
        const result = await DatabaseFunctions.freeAnnotation(Number(req.params.project_id), Number(req.params.id), tokenData);
        if (result) {
          answer.data = {
            ...result,
            log: (result.log !== undefined && result.log !== '') ? JSON.parse(result.log) : [],
            transcripts_free_count: result.transcripts_free_count
          };
          this.checkAndSendAnswer(res, answer);

          return;
        }
        ApiCommand.sendError(res, InternalServerError, 'Can not free annotation.');
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
