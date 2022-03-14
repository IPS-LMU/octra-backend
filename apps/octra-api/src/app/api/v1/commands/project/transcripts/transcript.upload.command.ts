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
import {mkdirp, pathExists, readJSONSync, unlink} from 'fs-extra';
import {FileSystemHandler} from '../../../filesystem-handler';
import {isNumber} from '../../../../../obj/functions';
import {MulterStorageHashing} from '../../../../../obj/multer-storage-hashing';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
  hash: string;
  content?: any;
}

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
              type: 'object'
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
              type: 'array'
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
                  type: 'object',
                  properties: {
                    duration: {
                      type: 'object',
                      properties: {
                        samples: {
                          type: 'number'
                        },
                        seconds: {
                          type: 'number'
                        }
                      }
                    },
                    sampleRate: {
                      type: 'number'
                    },
                    bitRate: {
                      type: 'number'
                    },
                    numberOfChannels: {
                      type: 'number'
                    },
                    container: {
                      type: 'string'
                    },
                    codec: {
                      type: 'string'
                    },
                    losless: {
                      type: 'boolean'
                    }
                  }
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

    const mediaPath = Path.join(this.settings.api.files.uploadPath, 'temp');
    const storage = new MulterStorageHashing({
      destination: async (req, file, callback) => {
        if (!(await pathExists(mediaPath))) {
          await mkdirp(mediaPath);
        }
        return callback(null, mediaPath);
      }
    });
    const upload = multer({storage: storage});
    try {

      // TODO formData values doesn't need to be files
      // TODO generate hash on client side => check it with other function => upload only if hash doesn't exist
      upload.any()(req, res, async (err) => {
        const validation = this.validate(req, req.files);
        const mediaFile = (req.files as MulterFile[]).find(a => a.fieldname === 'media');
        const jsonFile = (req.files as MulterFile[]).find(a => a.fieldname === 'data');

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
              let reqData: DeliverNewMediaRequest = {
                project_id: req.params.project_id,
                file: undefined
              }

              if (jsonFile) {
                reqData = {
                  ...reqData,
                  ...(jsonFile as any).content
                }
              }

              let publicURL = undefined;
              if (mediaFile) {
                const uploadPath = req.pathBuilder.getAbsoluteUploadPath();
                await FileSystemHandler.createDirIfNotExists(uploadPath);
                let dbFile = await DatabaseFunctions.getFileItemByHash(mediaFile.hash);

                if (!dbFile) {
                  const fileExt = Path.extname(mediaFile.originalname);
                  const newFilePath = Path.join(uploadPath, `${mediaFile.filename}${fileExt}`);
                  await FileSystemHandler.moveFile(mediaFile.path, newFilePath);
                  const audioInformation = await FileSystemHandler.readAudioFileInformation(newFilePath);
                  dbFile = await DatabaseFunctions.addFileItem({
                    hash: mediaFile.hash,
                    metadata: audioInformation,
                    original_name: mediaFile.originalname,
                    size: mediaFile.size,
                    type: mediaFile.mimetype,
                    uploader_id: req.decoded.id,
                    url: newFilePath
                      .replace(req.pathBuilder.uploadPath, '')
                      .replace(/^\//g, '')
                  });
                } else {
                  // remove temp file
                  await unlink(mediaFile.path);
                }

                publicURL = req.pathBuilder.getEncryptedUploadURL(dbFile.url);
                // fill in file information
                reqData.file = {
                  virtual_filename: mediaFile.originalname,
                  virtual_folder_path: '',
                  file_id: dbFile.id,
                  url: dbFile.url
                };
              } else {
                // no media file uploaded
                const url = jsonFile.content.media.url;
                if (!url || url.trim() === '' || !(new RegExp('^https?://').exec(url))) {
                  throw new Error('Can\'t find url in url property');
                }

                const regex = new RegExp(`^${Path.join(this.settings.api.url, 'v1/links')}`);

                const originalName = req.pathBuilder.extractFileNameFromURL(url);
                if (regex.exec(url)) {
                  // is intern link
                  const relativePath = reqData.file.url.replace(/^.+links\/([\/]+)\/(.+)/g, (g0, g1, g2) => {
                    return `${req.pathBuilder.decryptFilePath(g1)}/${g2}`;
                  });

                  let dbFile = await DatabaseFunctions.getFileItemByURL(relativePath);
                  if (dbFile) {
                    reqData.file = {
                      virtual_filename: req.pathBuilder.extractFileNameFromURL(relativePath),
                      virtual_folder_path: '',
                      file_id: dbFile.id,
                      url: dbFile.url
                    };
                  } else {
                    //add fileitem
                    dbFile = await DatabaseFunctions.addFileItem({
                      original_name: originalName,
                      uploader_id: req.decoded.id,
                      url: relativePath
                    });
                  }
                } else {
                  let dbFile = await DatabaseFunctions.getFileItemByURL(url);
                  if (!dbFile) {
                    //add fileitem
                    const urlInfo = await req.pathBuilder.getInformationFomURL(url);
                    dbFile = await DatabaseFunctions.addFileItem({
                      size: urlInfo.size,
                      type: urlInfo.type,
                      original_name: originalName,
                      uploader_id: req.decoded.id,
                      url
                    });
                  }

                  publicURL = url;
                  reqData.file = {
                    virtual_filename: req.pathBuilder.extractFileNameFromURL(url),
                    virtual_folder_path: '',
                    file_id: dbFile.id,
                    url: dbFile.url
                  };
                }
              }

              const data = await DatabaseFunctions.deliverNewMedia(reqData);
              delete data.file_id;
              answer.data = {
                ...data,
                file: {
                  ...data.file,
                  url: publicURL
                }
              };

              if (jsonFile) {
                await unlink(jsonFile.path);
              }
            } catch (e) {
              console.log(e);
              this.removeMediaFileAndJSON(mediaFile, jsonFile);
              ApiCommand.sendError(res, InternalServerError, e);
            }
            this.checkAndSendAnswer(res, answer);
          }
        } else {
          this.removeMediaFileAndJSON(mediaFile, jsonFile);
          ApiCommand.sendError(res, BadRequest, validation);
        }
      });
    } catch (e) {
      ApiCommand.sendError(res, InternalServerError, e);
    }

    // return;
  }

  override validate(req: InternRequest, formData?: any): any[] {
    const result = super.validate(req, formData);

    if (result.length === 0) {
      const mediaFile = formData.find(a => a.fieldname === 'media');
      const jsonFile = formData.find(a => a.fieldname === 'data');

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
              type: 'object'
            },
            media: {
              type: 'object',
              required: true,
              properties: {}
            }
          }
        };

        if (!mediaFile) {
          schema.properties['media'].properties['url'] = {
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

  private async removeMediaFileAndJSON(mediaFile: any, jsonFile: any) {
    try {
      if (mediaFile) {
        await unlink(mediaFile.path);
      }
      if (jsonFile) {
        await unlink(jsonFile.path);
      }
      return;
    } catch (e) {
      console.log(`Error: Can't remove mediaFile or JSONFile`);
    }
  }
}
