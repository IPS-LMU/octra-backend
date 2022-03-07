import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../obj/http-codes/client.codes';
import {RemoveProjectRequest, UserRole} from '@octra/db';
import {InternRequest} from '../../obj/types';
import {Response} from 'express';
import {FileSystemHandler} from '../../filesystem-handler';
import {PathBuilder} from '../../path-builder';

export class ProjectRemoveCommand extends ApiCommand {
  constructor() {
    super('removeProject', '/projects', RequestType.DELETE, '/:id/', true,
      [
        UserRole.administrator
      ]);

    this._description = 'Removes a transcription project.';
    this._acceptedContentType = 'application/json';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {
      type: 'object',
      properties: {
        removeAllReferences: {
          enum: ['true', 'false']
        },
        cutAllReferences: {
          enum: ['true', 'false']
        }
      }
    };

    // relevant for reference creation
    this._responseStructure = {
      properties: {
        ...this.defaultResponseSchema.properties
      }
    };
  }

  async do(req: InternRequest, res: Response) {
    const answer = ApiCommand.createAnswer();
    const validation = this.validate(req);

    if (!req.params.id) {
      ApiCommand.sendError(res, BadRequest, 'Missing id parameter in URI.');
      return;
    }
    // do something
    if (validation.length === 0) {
      const reqData: RemoveProjectRequest = {
        removeAllReferences: (req.query.removeAllReferences && req.query.removeAllReferences === 'true'),
        cutAllReferences: (req.query.cutAllReferences && req.query.cutAllReferences === 'true')
      }

      if (reqData.removeAllReferences && reqData.cutAllReferences) {
        ApiCommand.sendError(res, BadRequest, 'You have to choose between removeAllReferences and cutAllReferences.');
        return;
      }

      try {
        const pathBuilder = new PathBuilder(this.settings.api);
        const projectFolder = pathBuilder.getAbsoluteProjectPath(Number(req.params.id));
        await DatabaseFunctions.removeProject(Number(req.params.id), reqData);
        await FileSystemHandler.removeFolder(projectFolder);
        this.checkAndSendAnswer(res, answer);
      } catch (e) {
        ApiCommand.sendError(res, InternalServerError, e);
      }
    } else {
      ApiCommand.sendError(res, BadRequest, validation);
    }

    return;
  }
}
