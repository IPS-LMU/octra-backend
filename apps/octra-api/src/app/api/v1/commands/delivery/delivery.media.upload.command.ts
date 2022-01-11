import {ApiCommand, RequestType} from '../api.command';
import {DatabaseFunctions} from '../../obj/database.functions';
import {InternalServerError} from '../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../obj/http-codes/client.codes';
import {DeliverNewMediaRequest, DeliveryMediaAddResponse, UserRole} from '@octra/db';
import {InternRequest} from '../../obj/types';
import {Validator} from 'jsonschema';
import * as Path from 'path';
import * as multer from 'multer';
import {mkdirp, pathExists, readJSONSync} from 'fs-extra';
import {FileSystemHandler} from '../../filesystem-handler';

export class DeliveryMediaUploadCommand extends ApiCommand {
  constructor() {
    super('uploadMediaForTranscription', '/delivery', RequestType.POST, '/media/upload', true,
      [
        UserRole.administrator,
        UserRole.dataDelivery
      ]
    );

    this._description = 'Uploads one audio file for a given project. Optionally the transcription data to this audio file can be added. The media is going to be transcribed with a Tool e.g. Octra.';
    this._acceptedContentType = 'multipart/form-data';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {
      type: 'array',
      required: true,
      items: {
        type: 'object',
        minItems: 1,
        properties: {
          fieldname: {
            type: 'string',
            required: true
          }
        }
      }
    };

    // relevant for reference creation
    this._responseStructure = {
      ...this.defaultResponseSchema,
      properties: {
        ...this.defaultResponseSchema.properties,
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              required: true
            },
            pid: {
              type: 'string'
            },
            orgtext: {
              type: 'string'
            },
            transcript: {
              type: 'string'
            },
            assessment: {
              type: 'string'
            },
            priority: {
              type: 'number'
            },
            status: {
              type: 'string'
            },
            code: {
              type: 'string'
            },
            creationdate: {
              type: 'date-time'
            },
            startdate: {
              type: 'date-time'
            },
            enddate: {
              type: 'date-time'
            },
            log: {
              type: 'string'
            },
            comment: {
              type: 'string'
            },
            tool_id: {
              type: 'number'
            },
            transcriber_id: {
              type: 'number'
            },
            mediaitem: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  required: true
                },
                type: {
                  type: 'string'
                },
                size: {
                  type: 'number'
                },
                metadata: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    };
  }

  async do(req, res) {
    const answer = ApiCommand.createAnswer() as DeliveryMediaAddResponse;
    const currentTime = Date.now();
    const mediaPath = Path.join(this.settings.api.files.uploadPath, 'temp', `temp_${currentTime}`);
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
      await upload.any()(req, res, async (err) => {
        const validation = this.validate(req, req.files);
        if (validation.length === 0) {
          if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            ApiCommand.sendError(res, InternalServerError, 'Could not upload media item.');
          } else if (err) {
            // An unknown error occurred when uploading.
            ApiCommand.sendError(res, InternalServerError, 'Could not upload media item.');
          } else {
            // success

            try {

              const mediaFile = req.files.find(a => a.fieldname === 'media');
              const jsonFile = req.files.find(a => a.fieldname === 'data');
              const reqData = jsonFile.content as DeliverNewMediaRequest;
              const projectFilesPath = req.pathBuilder.getProjectFilestPath(reqData.project_id);
              await FileSystemHandler.createDirIfNotExists(projectFilesPath);

              //move from temp to project folder
              await FileSystemHandler.moveFile(Path.join(mediaPath, mediaFile.originalname), Path.join(projectFilesPath, mediaFile.originalname));
              await FileSystemHandler.removeFolder(mediaPath);

              // fill in file information
              const fileInformation = await FileSystemHandler.readFileInformation(Path.join(projectFilesPath, mediaFile.originalname));

              reqData.media = {
                url: Path.join('files', mediaFile.originalname),
                size: fileInformation.size,
                type: fileInformation.type
              }
              const data = await DatabaseFunctions.deliverNewMedia(reqData);
              const publicURL = Path.join(this.settings.api.url, '/v1/files', req.pathBuilder.encryptFilePath(Path.join('projects', `project_${reqData.project_id}`, 'files')), mediaFile.originalname);

              answer.data = {
                ...data,
                mediaitem: {
                  ...data.mediaitem,
                  url: publicURL
                }
              };
            } catch (e) {
              console.log(e);
              ApiCommand.sendError(res, InternalServerError, e);
              await FileSystemHandler.removeFolder(mediaPath);
            }
            this.checkAndSendAnswer(res, answer);
          }
        } else {
          ApiCommand.sendError(res, BadRequest, validation);
          await FileSystemHandler.removeFolder(mediaPath);
        }
      });
    } catch (e) {
      ApiCommand.sendError(res, InternalServerError, e);
      await FileSystemHandler.removeFolder(mediaPath);
    }

    return;
  }

  override validate(req: InternRequest, formData?: any): any[] {
    const result = super.validate(req, formData);

    if (result.length === 0) {
      const mediaFile = formData.find(a => a.fieldname === 'media');
      const jsonFile = formData.find(a => a.fieldname === 'data');
      if (formData.length > 1 && mediaFile && jsonFile) {
        const schema = {
          properties: {
            project_id: {
              type: 'number',
              required: true
            },
            orgtext: {
              type: 'string'
            },
            transcript: {
              type: 'string'
            }
          }
        };

        const validator = new Validator();
        jsonFile.content = readJSONSync(jsonFile.path);
        const validationResult = validator.validate(jsonFile, jsonFile.content);
        if (!validationResult.valid) {
          result.push({
            section: (req.query && req.query !== {}) ? 'GET params' : 'Request payload',
            errors: validationResult.errors.map(a => a.path.join('.') + ' ' + a.message)
          });
        }
      } else {
        result.push({
          section: 'FormData',
          errors: 'Missing item with fieldname \'data\'.'
        });
      }
    }

    return result;
  }
}
