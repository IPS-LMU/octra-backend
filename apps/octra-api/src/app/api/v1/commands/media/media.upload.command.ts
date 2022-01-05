import {ApiCommand, RequestType} from '../api.command';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../obj/http-codes/client.codes';
import {MediaUploadResponse, UserRole} from '@octra/db';
import * as multer from 'multer';
import * as Path from 'path';
import {mkdirp, pathExists} from 'fs-extra';

export class MediaUploadCommand extends ApiCommand {
  constructor() {
    super('uploadMediaItem', '/media', RequestType.POST, '/upload', true,
      [
        UserRole.administrator,
        UserRole.projectAdministrator
      ]);

    this._description = 'Uploads a new media file and returns its URL.';
    this._acceptedContentType = 'multipart/form-data';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {
      type: 'array',
      required: true,
      items: {
        type: 'object',
        properties: {
          fieldname: {
            type: 'string',
            pattern: 'media'
          }
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
    const answer = ApiCommand.createAnswer() as MediaUploadResponse;
    const mediaPath = Path.join(this.settings.api.files.uploadPath, 'media');
    const storage = multer.diskStorage({
      destination: async (req, file, callback) => {
        if (!(await pathExists(mediaPath))) {
          await mkdirp(mediaPath);
        }
        return callback(null, mediaPath);
      },
      filename: (req, file, callback) => {
        return callback(null, file.originalname);
      }
    });
    const upload = multer({storage: storage});
    try {
      await upload.any()(req, res, (err) => {
        const validation = this.validate(req, req.files);
        if (validation.length === 0) {
          if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            ApiCommand.sendError(res, InternalServerError, 'Could not upload media item.');
          } else if (err) {
            // An unknown error occurred when uploading.
            ApiCommand.sendError(res, InternalServerError, 'Could not upload media item.');
          } else {
            answer.data = {
              url: Path.join(this.settings.api.url, '/v1/files', req.pathBuilder.encryptFilePath('media'), req.files[0].originalname)
            }
            this.checkAndSendAnswer(res, answer);
          }
        } else {
          ApiCommand.sendError(res, BadRequest, validation);
        }
      });
    } catch (e) {
      ApiCommand.sendError(res, InternalServerError, e);
    }

    return;
  }
}
