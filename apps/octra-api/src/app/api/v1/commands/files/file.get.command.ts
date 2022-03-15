import {ApiCommand, RequestType} from '../api.command';
import {UserRole} from '@octra/db';
import * as Path from 'path';
import {pathExists} from 'fs-extra';

export class FileGetCommand extends ApiCommand {
  constructor() {
    super('getFile', '/files', RequestType.GET, '/public/:encryptedPath/:fileName', true,
      [
        UserRole.administrator,
        UserRole.projectAdministrator,
        UserRole.dataDelivery,
        UserRole.transcriber
      ]);

    this._description = 'Uploads a new media file and returns its URL.';
    this._acceptedContentType = 'application/json';
    this._responseContentType = '';

    // relevant for reference creation
    this._requestStructure = {
      type: 'object',
      required: true,
      properties: {
        link: {
          type: 'string',
          required: true
        }
      }
    };

    // relevant for reference creation
    this._responseStructure = {
      properties: {
        ...this.defaultResponseSchema.properties,
        data: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              required: true
            }
          }
        }
      }
    };
  }

  async do(req, res) {
    try {
      let decryptedPath = Path.join(req.pathBuilder.decryptFilePath(req.params.encryptedPath), req.params.fileName);
      decryptedPath = req.pathBuilder.readPublicURL(decryptedPath);
      if (await pathExists(decryptedPath)) {
        res.sendFile(decryptedPath);
      } else {
        res.sendStatus(404);
      }
    } catch (e) {
      FileGetCommand.sendError(res, 400, 'Bad Request.');
    }
    return;
  }
}
