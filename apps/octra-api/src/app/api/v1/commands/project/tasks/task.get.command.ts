import {Response} from 'express';
import {ApiCommand, RequestType} from '../../api.command';
import {ProjectTranscriptsGetResponseDataItem, TranscriptGetResponse, UserRole} from '@octra/db';
import {InternRequest} from '../../../obj/types';
import {DatabaseFunctions} from '../../../obj/database.functions';
import {InternalServerError} from '../../../../../obj/http-codes/server.codes';
import {TaskSchema} from './task.json.schema';

export class ProjectTranscriptGetCommand extends ApiCommand {
  constructor() {
    super('getProjectTask', '/projects', RequestType.GET, '/:project_id/tasks/:transcript_id', true,
      [
        UserRole.administrator,
        UserRole.projectAdministrator,
        UserRole.dataDelivery
      ]);

    this._description = 'Returns a transcript object by transcript ID and project ID.';
    this._acceptedContentType = 'application/json';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {};

    // relevant for reference creation
    this._responseStructure = {
      properties: {
        ...this.defaultResponseSchema.properties,
        data: TaskSchema
      }
    };
  }

  async do(req: InternRequest, res: Response) {
    const answer = ApiCommand.createAnswer() as TranscriptGetResponse;
    const validation = this.validate(req);
    // do something
    if (validation.length === 0) {
      try {
        answer.data = await DatabaseFunctions.getTaskByID(Number(req.params.transcript_id));
        this.reduceDataForUser(req, answer)
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
    }
  }
}
