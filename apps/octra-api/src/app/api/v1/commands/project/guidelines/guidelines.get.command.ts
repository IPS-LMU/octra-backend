import {GuidelinesGetResponse, UserRole} from '@octra/db';
import {ApiCommand, RequestType} from '../../api.command';
import {InternalServerError} from '../../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../../obj/http-codes/client.codes';
import {InternRequest} from '../../../obj/types';
import {Response} from 'express';
import {FileSystemHandler} from '../../../filesystem-handler';
import {PathBuilder} from '../../../path-builder';
import {isNumber} from '../../../../../obj/functions';

export class GuidelinesGetCommand extends ApiCommand {
  constructor() {
    super('getGuidelines', '/projects', RequestType.GET, '/:project_id/guidelines/', true,
      [
        UserRole.administrator,
        UserRole.projectAdministrator,
        UserRole.transcriber
      ]);

    this._description = 'Retrieves a list of guidelines for this specific project.';

    // relevant for reference creation
    this._requestStructure = {};

    // relevant for reference creation
    this._responseStructure = {
      properties: {
        ...this.defaultResponseSchema.properties,
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              language: {
                type: 'string',
                pattern: '[a-z]{2}'
              },
              json: {
                type: 'object'
              }
            }
          }
        }
      }
    };
  }

  async do(req: InternRequest, res: Response) {
    const answer = ApiCommand.createAnswer() as GuidelinesGetResponse;
    const validation = this.validate(req);

    if (!req.params.project_id || !isNumber(req.params.project_id)) {
      ApiCommand.sendError(res, BadRequest, 'Missing project_id in URI.');
      return;
    }

    // do something
    if (validation.length === 0) {
      try {
        const pathBuilder = new PathBuilder(this.settings.api);
        const guidelinesPath = pathBuilder.getAbsoluteGuidelinesPath(Number(req.params.project_id));
        const files = await FileSystemHandler.listFiles(guidelinesPath);
        answer.data = files.map(a => {
          let json;
          try {
            json = JSON.parse(a.content);
          } catch (e) {
            console.error(e);
          }

          return {
            language: a.fileName.replace(/guidelines_([^.]+)\.json/g, '$1'),
            json
          };
        });
        this.checkAndSendAnswer(res, answer);
      } catch (e) {
        console.log(e);
        ApiCommand.sendError(res, InternalServerError, 'Can\'t save guidelines');
      }
    } else {
      ApiCommand.sendError(res, BadRequest, validation);
    }

    return;
  }
}
