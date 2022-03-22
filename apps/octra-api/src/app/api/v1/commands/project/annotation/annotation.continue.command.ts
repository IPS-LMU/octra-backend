import {TranscriptAddResponse, UserRole} from '@octra/db';
import {ApiCommand, RequestType} from '../../api.command';
import {DatabaseFunctions} from '../../../obj/database.functions';
import {InternalServerError} from '../../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../../obj/http-codes/client.codes';
import {InternRequest} from '../../../obj/types';
import {Response} from 'express';
import {AnnotationSchema} from './annotation.json.schema';

export class AnnotationContinueCommand extends ApiCommand {
  constructor() {
    super('continueAnnotation', '/projects', RequestType.POST, '/:project_id/annotations/:id/continue', true,
      [
        UserRole.user,
        UserRole.projectAdministrator,
        UserRole.administrator
      ]);

    this._description = 'Continue a given annotation by its id.';
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
    const answer = ApiCommand.createAnswer() as TranscriptAddResponse;
    const validation = this.validate(req);
    const tokenData = req.decoded;

    // TODO restrict annotation to list of transcribers if available

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
