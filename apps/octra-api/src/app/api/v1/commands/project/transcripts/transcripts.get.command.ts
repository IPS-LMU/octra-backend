import {ApiCommand, RequestType} from '../../api.command';
import {DatabaseFunctions} from '../../../obj/database.functions';
import {InternalServerError} from '../../../../../obj/http-codes/server.codes';
import {ProjectTranscriptsGetResponse, UserRole} from '@octra/db';
import {TranscriptSchema} from './transcript.json.schema';

export class TranscriptsGetCommand extends ApiCommand {
  constructor() {
    super('getProjectTranscripts', '/projects', RequestType.GET, '/:project_id/transcripts', true,
      [
        UserRole.administrator,
        UserRole.projectAdministrator,
        UserRole.dataDelivery
      ]);

    this._description = 'Returns all transcripts of a given project.';
    this._acceptedContentType = 'application/json';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {};

    // relevant for reference creation
    this._responseStructure = {
      properties: {
        ...this.defaultResponseSchema.properties,
        data: {
          type: 'array',
          items: TranscriptSchema
        }
      }
    };
  }

  async do(req, res) {
    const answer = ApiCommand.createAnswer() as ProjectTranscriptsGetResponse;
    const validation = this.validate(req);
    // do something
    if (validation.length === 0) {
      if (!req.params.project_id) {
        ApiCommand.sendError(res, InternalServerError, 'Missing project_id in URL.');
        return;
      }
      try {
        answer.data = await DatabaseFunctions.getTranscriptsByProjectID(Number(req.params.project_id));
        this.checkAndSendAnswer(res, answer);
        return;
      } catch (e) {
        console.log(e);
        ApiCommand.sendError(res, InternalServerError, e);
      }
    } else {
      ApiCommand.sendError(res, InternalServerError, validation);
    }
    return;
  }
}
