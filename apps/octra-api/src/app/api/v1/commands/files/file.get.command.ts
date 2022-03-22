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
    this._requestStructure = {};

    // relevant for reference creation
    this._responseStructure = {
      type: 'file',
      description: 'The file is directly served. If the file doesn\'t exists, this API call returns 404 error.'
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
