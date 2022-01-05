import {CreateGuidelinesRequest, GuidelinesSaveResponse, UserRole} from '@octra/db';
import {ApiCommand, RequestType} from '../../api.command';
import {InternalServerError} from '../../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../../obj/http-codes/client.codes';
import {InternRequest} from '../../../obj/types';
import {Response} from 'express';
import {FileSystemHandler} from '../../../filesystem-handler';
import {PathBuilder} from '../../../path-builder';
import {isNumber} from '../../../../../obj/functions';
import * as path from 'path';

export class GuidelinesSaveCommand extends ApiCommand {
  constructor() {
    super('saveGuidelines', '/projects', RequestType.PUT, '/:project_id/guidelines/', true,
      [
        UserRole.administrator,
        UserRole.projectAdministrator
      ]);

    this._description = 'Changes the guidelines for a specific project.';
    this._acceptedContentType = 'application/json';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {
      type: 'array',
      items: [{
        type: 'object',
        properties: {
          language: {
            type: 'string'
          },
          json: {
            type: 'object'
          }
        }
      }]
    };

    // relevant for reference creation
    this._responseStructure = {
      properties: {
        ...this.defaultResponseSchema.properties
      }
    };
  }

  async do(req: InternRequest, res: Response) {
    const answer = ApiCommand.createAnswer() as GuidelinesSaveResponse;
    const validation = this.validate(req);

    if (!req.params.project_id || !isNumber(req.params.project_id)) {
      ApiCommand.sendError(res, BadRequest, 'Missing project_id in URI.');
      return;
    }

    // do something
    if (validation.length === 0) {
      const body: CreateGuidelinesRequest[] = req.body;
      try {
        const pathBuilder = new PathBuilder(this.settings.api);
        const guidelinesPath = pathBuilder.getGuidelinesPath(Number(req.params.project_id));
        await FileSystemHandler.removeFolder(guidelinesPath);

        for (const createGuidelinesRequest of body) {
          await FileSystemHandler.saveFileAsync(path.join(guidelinesPath, `guidelines_${createGuidelinesRequest.language}.json`), JSON.stringify(createGuidelinesRequest.json, null, 2), {
            encoding: 'utf-8'
          });
        }

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
