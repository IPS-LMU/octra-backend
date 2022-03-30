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
import {mkdirp, pathExists, unlink} from 'fs-extra';
import {FileSystemHandler} from '../../../filesystem-handler';
import {isNumber} from '../../../../../obj/functions';
import {MulterStorageHashing} from '../../../../../obj/multer-storage-hashing';
import {TaskUploadSchema} from './task.json.schema';

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

export class TaskUploadCommand extends ApiCommand {
  constructor() {
    super('uploadTaskData', '/projects', RequestType.POST, '/:project_id/tasks/upload', true,
      [
        UserRole.administrator,
        UserRole.projectAdministrator,
        UserRole.dataDelivery
      ]
    );

    this._description = `Uploads the inputs (files) and properties (JSON) to the server and creates a new task with the
    type specified in the properties. The task gets the status "DRAFT" automatically. In order to mark this task for processing
    you should change its status to "FREE" using the changeStatusOfTasks() API call.`;
    this._acceptedContentType = 'multipart/form-data';
    this._responseContentType = 'application/json';

    // relevant for reference creation
    this._requestStructure = {
      type: 'array',
      required: true,
      items: [
        {
          type: 'object',
          required: true,
          description: 'The audio file',
          properties: {
            fieldname: {
              type: 'string',
              pattern: 'input',
              required: true
            },
            originalname: {
              type: 'string',
              pattern: '.*\.wav$',
              required: true
            },
            hash: {
              type: 'string',
              required: true
            }
          }
        }
      ]
    };

    // relevant for reference creation
    this._responseStructure = {
      ...this.defaultResponseSchema,
      properties: {
        ...this.defaultResponseSchema.properties,
        data: TaskUploadSchema
      }
    };
  }

  async do(req, res) {
    const answer = ApiCommand.createAnswer() as DeliveryMediaAddResponse;

    if (!req.params.project_id || !isNumber(req.params.project_id)) {
      TaskUploadCommand.sendError(res, 400, 'project_id must be of type number.');
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

      upload.array('input')(req, res, async (err) => {
        req.body.properties = req.body?.properties ? JSON.parse(req.body.properties) : undefined;
        req.body.transcript = req.body?.transcript ? JSON.parse(req.body.transcript) : undefined;

        const validation = this.validate(req, req.files);
        const mediaFile = (req.files as MulterFile[]).find(a => a.fieldname === 'input');
        const taskProperties = req.body.properties;
        const taskTranscript = req.body.transcript;

        if (!(/.+(\.wav)/g).exec(mediaFile.originalname)) {
          await this.removeTempFiles(req.files);
          ApiCommand.sendError(res, BadRequest, 'Only WAVE files supported.');
          return;
        }

        if (validation.length === 0) {
          if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            ApiCommand.sendError(res, InternalServerError, 'Could not upload task.');
            await FileSystemHandler.removeFolder(mediaPath);
          } else if (err) {
            // An unknown error occurred when uploading.
            ApiCommand.sendError(res, InternalServerError, 'Could not upload task.');
            await FileSystemHandler.removeFolder(mediaPath);
          } else {
            // success
            try {
              let reqData: DeliverNewMediaRequest = {
                project_id: req.params.project_id,
                log: undefined,
                file: undefined
              }

              if (taskProperties) {
                reqData = {
                  ...reqData,
                  ...taskProperties,
                  transcript: taskTranscript
                }
              }
              // TODO continue here, adapt adding transcript to inputs table and connect it to the new task

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
                const url = taskProperties.media.url;
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

              const data = await DatabaseFunctions.createTask(reqData);

              answer.data = data;
            } catch (e) {
              console.log(e);
              await this.removeTempFiles(req.files);
              ApiCommand.sendError(res, InternalServerError, e);
            }
            this.checkAndSendAnswer(res, answer);
          }
        } else {
          await this.removeTempFiles(req.files);
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
      const mediaFile = formData.find(a => a.fieldname === 'input');
      const jsonFile = req.body?.transcript;

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
        let bodySchema = {
          type: 'object',
          properties: {
            properties: {
              type: 'object',
              required: true
            },
            transcript: {
              // TODO add AnnotJSON schema to schema constants and add it here
              type: 'object',
              required: true
            }
          }
        };

        if (!mediaFile) {
          bodySchema.properties.properties['media'].properties['url'] = {
            type: 'string',
            required: true,
            pattern: '^https?:\/\/',
            description: 'Public URL to the media file'
          };
        }

        const validator = new Validator();
        const validationResult = validator.validate(req.body, bodySchema);
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

  private async removeTempFiles(mediaFiles: MulterFile[]) {
    try {
      for (const mediaFile of mediaFiles) {
        await unlink(mediaFile.path);
      }
      return;
    } catch (e) {
      console.log(`Error: Can't remove mediaFile or JSONFile`);
    }
  }
}
