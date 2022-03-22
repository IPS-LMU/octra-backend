import {Response} from 'express';
import {ApiCommand, RequestType} from '../../api.command';
import {
  ProjectTranscriptsChangeStatusRequestItem,
  ProjectTranscriptsGetResponseDataItem,
  TranscriptGetResponse,
  UserRole
} from '@octra/db';
import {InternRequest} from '../../../obj/types';
import {DatabaseFunctions} from '../../../obj/database.functions';
import {InternalServerError} from '../../../../../obj/http-codes/server.codes';

export class ProjectTranscriptsChangeStatusCommand extends ApiCommand {
  constructor() {
    super('changeStatusOfTranscripts', '/projects', RequestType.PUT, '/:project_id/transcripts/status', true,
      [
        UserRole.administrator,
        UserRole.projectAdministrator
      ]);

    this._description = 'Changes the status of a list of transcript IDs.';
    this._acceptedContentType = 'application/json';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            required: true,
            enum: ['DRAFT', 'ANNOTATED', 'FREE', 'BUSY', 'POSTPONED']
          },
          listOfIds: {
            type: 'array',
            items: {
              type: 'number',
              required: true
            }
          }
        }
      }
    };

    // relevant for reference creation
    this._responseStructure = {
      properties: {
        ...this.defaultResponseSchema.properties
      }
    };
    delete this._responseStructure.properties.data;
  }

  async do(req: InternRequest, res: Response) {
    const answer = ApiCommand.createAnswer();
    const validation = this.validate(req);
    const reqBody = req.body as ProjectTranscriptsChangeStatusRequestItem[];

    // do something
    if (validation.length === 0) {
      try {
        answer.data = await DatabaseFunctions.changeTranscriptsStatus(reqBody);
        this.reduceDataForUser(req, answer)
        delete answer.data;
        // TODO change transcript should return new values
        this.checkAndSendAnswer(res, answer);
        return;
      } catch (e) {
        console.log(e);
        ApiCommand.sendError(res, InternalServerError, e.message);
      }
    } else {
      ApiCommand.sendError(res, InternalServerError, validation);
    }
    return;
  }

  reduceDataForUser(req: InternRequest, answer: TranscriptGetResponse) {
    const tokenData = req.decoded;

    if (!tokenData) {
      console.log(`no token data!`);
      return;
    }

    if (!tokenData.accessRights) {
      console.log(`no roles in token data!`);
      return;
    }

    if (tokenData.accessRights.find(a => a.role === UserRole.dataDelivery && a.project_id === answer.data.project_id)) {
      // is data delivery
      const data = answer.data as ProjectTranscriptsGetResponseDataItem;
      delete data.pid;
      delete data.file_id;
    }
  }
}
