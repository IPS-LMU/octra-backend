import {ApiCommand, RequestType} from '../api.command';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../obj/http-codes/client.codes';
import {AddUploadItemRequest, MediaUploadResponse, UserRole} from '@octra/db';
import * as multer from 'multer';

export class MediaUploadCommand extends ApiCommand {
  constructor() {
    super('uploadMediaItem', '/media', RequestType.POST, '/upload', true,
      [
        UserRole.administrator,
        UserRole.projectAdministrator,
        UserRole.dataDelivery
      ]);

    this._description = 'Uploads a new media file and returns its URL.';
    this._acceptedContentType = 'multipart/form-data';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {};

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
    console.log(`DOO`);
    const answer = ApiCommand.createAnswer() as MediaUploadResponse;
    const validation = this.validate(req.params, req.body);
    const upload = multer({dest: this.settings.api.files.uploadPath});

    // do something
    if (validation.length === 0) {
      const body: AddUploadItemRequest = req.body;
      try {

        if (req.headers['content-type'].indexOf('multipart/form-data') === 0) {
          console.log(`FORM DATA FOUND!`);
        }

        await upload.any()(req, res, (err) => {
          console.log('error: -');
          console.log(err);
          if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            ApiCommand.sendError(res, InternalServerError, 'Could not upload media item.');
          } else if (err) {
            // An unknown error occurred when uploading.
            ApiCommand.sendError(res, InternalServerError, 'Could not upload media item.');
          } else {
            console.log(`file:`);
            answer.data = {
              url: 'zashdiuahsdi'
            }
            this.checkAndSendAnswer(res, answer);
          }
        });
      } catch (e) {
        ApiCommand.sendError(res, InternalServerError, e);
      }
    } else {
      ApiCommand.sendError(res, BadRequest, validation);
    }

    return;
  }
}
