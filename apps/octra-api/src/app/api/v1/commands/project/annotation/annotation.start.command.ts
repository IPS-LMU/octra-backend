import {AnnotationStartResponse, StartAnnotationRequest, UserRole} from '@octra/db';
import {ApiCommand, RequestType} from '../../api.command';
import {DatabaseFunctions} from '../../../obj/database.functions';
import {InternalServerError} from '../../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../../obj/http-codes/client.codes';
import {InternRequest} from '../../../obj/types';
import {Response} from 'express';
import {AnnotationSchema} from './annotation.json.schema';

export class AnnotationStartCommand extends ApiCommand {
  constructor() {
    super('startAnnotation', '/projects', RequestType.POST, '/:project_id/annotations/start', true,
      [
        UserRole.user,
        UserRole.projectAdministrator,
        UserRole.administrator,
      ]);

    this._description = 'Starts a new annotation.';
    this._acceptedContentType = 'application/json';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {
      type: 'object',
      properties: {
        tool_id: {
          type: 'number',
          required: true
        }
      }
    };

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

    // TODO restrict annotation to list of transcribers if available

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
            log: result.log ?? [],
            transcripts_free_count: result.transcripts_free_count
          };
          this.checkAndSendAnswer(res, answer);
          return;
        }
        // return empty message if no new transcript
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
