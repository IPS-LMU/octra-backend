import {ApiCommand, RequestType} from '../../api.command';
import {DatabaseFunctions} from '../../../obj/database.functions';
import {InternalServerError} from '../../../../../obj/http-codes/server.codes';
import {BadRequest} from '../../../../../obj/http-codes/client.codes';
import {DeliverNewMediaRequest, DeliveryMediaAddResponse, UserRole} from '@octra/db';
import {InternRequest} from '../../../obj/types';
import {Validator} from 'jsonschema';
import * as Path from 'path';
import * as path from 'path';
import * as multer from 'multer';
import {mkdirp, pathExists, readJSONSync} from 'fs-extra';
import {FileSystemHandler} from '../../../filesystem-handler';
import {isNumber} from '../../../../../obj/functions';

export class TranscriptUploadCommand extends ApiCommand {
  constructor() {
    super('uploadTranscriptData', '/projects', RequestType.POST, '/:project_id/transcripts/upload', true,
      [
        UserRole.administrator,
        UserRole.projectAdministrator,
        UserRole.dataDelivery
      ]
    );

    this._description = 'Uploads a transcript with an media file for a given project. ' +
      'This request is made via form data: You have to add at least a media file or an transcript file (text file). ' +
      'You can add both, too.You can append the media file with a "media" field and the transcript with a "data" field.';
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
                session: {
                  type: 'string',
                  required: true
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

    if (!req.params.project_id || !isNumber(req.params.project_id)) {
      TranscriptUploadCommand.sendError(res, 400, 'project_id must be of type number.');
      return;
    }

    const currentTime = Date.now();
    const mediaPath = Path.join(this.settings.api.files.uploadPath, 'temp', `temp_${req.decoded.id}_${currentTime}`);
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
      upload.any()(req, res, async (err) => {
        const validation = this.validate(req, req.files);
        if (validation.length === 0) {
          if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            ApiCommand.sendError(res, InternalServerError, 'Could not upload transcript.');
            await FileSystemHandler.removeFolder(mediaPath);
          } else if (err) {
            // An unknown error occurred when uploading.
            ApiCommand.sendError(res, InternalServerError, 'Could not upload transcript.');
            await FileSystemHandler.removeFolder(mediaPath);
          } else {
            // success
            try {
              const mediaFile = req.files.find(a => a.fieldname === 'media');
              const jsonFile = req.files.find(a => a.fieldname === 'data');
              let reqData: DeliverNewMediaRequest = {
                project_id: req.params.project_id,
                media: undefined
              }

              if (jsonFile) {
                reqData = {
                  ...reqData,
                  ...jsonFile.content
                }
              }

              // TODO check if session name is correct
              // TODO test this cloass
              const sanitizedSessionName = req.pathBuilder.sanitizeFileName(jsonFile.content.media.session);
              const projectFilesPath = req.pathBuilder.getProjectSessionPath(req.params.project_id, jsonFile.content.media.session);
              await FileSystemHandler.createDirIfNotExists(projectFilesPath);
              let fileInformation;

              let publicURL = "";
              if (mediaFile) {
                //move from temp to project folder
                const sanitizedFileName = req.pathBuilder.sanitizeFileName(Path.basename(mediaFile.originalname)) + Path.extname(mediaFile.originalname);
                await FileSystemHandler.moveFile(Path.join(mediaPath, mediaFile.originalname), Path.join(projectFilesPath, sanitizedFileName));
                await FileSystemHandler.removeFolder(mediaPath);
                // fill in file information
                fileInformation = await FileSystemHandler.readFileInformation(Path.join(projectFilesPath, sanitizedFileName));
                reqData.media = {
                  session: jsonFile.content.media.session,
                  url: Path.join(`session_${sanitizedSessionName}`, sanitizedFileName),
                  size: fileInformation.size,
                  type: fileInformation.type,
                  originalname: mediaFile.originalname
                };
                publicURL = req.pathBuilder.getEncryptedProjectFileURL(req.params.project_id, path.basename(reqData.media.url));
              } else {
                const regex = new RegExp(`^${Path.join(this.settings.api.url, 'v1/links')}`);

                let originalName = undefined;
                if (regex.exec(reqData.media.url)) {
                  reqData.media.url = reqData.media.url.replace(/^.+links\/([\/]+)\/(.+)/g, (g0, g1, g2) => {
                    originalName = g2;
                    return `${req.pathBuilder.decryptFilePath(g1)}/${g2}`;
                  });

                  if (!(await pathExists(Path.join(this.settings.uploadPath, reqData.media.url)))) {
                    ApiCommand.sendError(res, InternalServerError, 'The file referenced by this URL doesn\'t exist.');
                  }
                } else {
                  originalName = reqData.media.url.replace(/.+\/(.+)/g, (g0, g1) => {
                    return g1;
                  });
                  publicURL = reqData.media.url;
                }
                reqData.media.originalname = originalName;
              }

              const data = await DatabaseFunctions.deliverNewMedia(reqData);

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

      // TODO transcript mediaitem is a n:1 relation

      if (mediaFile) {
        if (path.extname(mediaFile.originalname) !== '.wav') {
          result.push({
            section: 'FormData',
            errors: 'The media file must be of type WAVE.'
          });
          return result;
        }
      }

      if (formData.length > 0 && jsonFile) {
        // TODO we need global instances of schemas
        let schema = {
          properties: {
            orgtext: {
              type: 'string'
            },
            transcript: {
              type: 'string'
            },
            media: {
              type: "object",
              required: true,
              properties: {
                session: {
                  type: 'string',
                  pattern: ".{3, 60}",
                  required: true
                }
              }
            }
          }
        };

        if (!mediaFile) {
          schema.properties["media"].properties["url"] = {
            type: 'string',
            required: true,
            pattern: '^https?:\/\/',
            description: 'Public URL to the media file'
          };
        }

        const validator = new Validator();
        jsonFile.content = readJSONSync(jsonFile.path);
        const validationResult = validator.validate(jsonFile.content, schema);
        if (!validationResult.valid) {
          result.push({
            section: 'Request payload',
            errors: validationResult.errors.map(a => a.path.join('.') + ' ' + a.message)
          });
        }
      } else {
        result.push({
          section: 'FormData',
          errors: 'There must be at least one of the fields "media" or "data".'
        });
      }
    }

    return result;
  }
}
