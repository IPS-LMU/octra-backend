import {Injectable} from '@nestjs/common';
import {AppService} from '../../../app.service';
import {unlink} from 'fs-extra';
import {Express} from 'express';
import {InternRequest} from '../../../obj/types';
import {ConfigService} from '@nestjs/config';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {FileEntity} from '../../files/file.entity';
import {TaskEntity} from '../task.entity';
import {FileCreateDto} from '../../files/file.dto';
import {TaskUploadDto} from './task.dto';

interface ReqData {
  project_id: string;
  file?: {
    url: string;
    file_id: number;
    virtual_folder_path?: string;
    virtual_filename: string;
  },
  orgtext?: string;
  log: any;
  transcript?: any;
}

@Injectable()
export class TasksService {
  constructor(private appService: AppService,
              private configService: ConfigService,
              @InjectRepository(TaskEntity)
              private taskRepository: Repository<TaskEntity>,
              @InjectRepository(FileEntity)
              private fileRepository: Repository<FileEntity>) {
  }

  async uploadTaskData(body: TaskUploadDto, req: InternRequest) {
    /*
    if (inputs.length !== 1) {
      await this.removeTempFiles(inputs);
      throw new HttpException('number of inputs must be bigger than 0', HttpStatus.BAD_REQUEST);
    }

    const mediaPath = Path.join(this.configService.get('api.files.uploadPath'), 'temp');
    const mediaFile = inputs[0];
    const taskProperties = req.body?.properties ? JSON.parse(req.body.properties) : undefined;
    const taskTranscript = req.body?.transcript ? JSON.parse(req.body.transcript) : undefined;

    if (!(/.+(\.wav)/g).exec(inputs[0].originalname)) {
      await this.removeTempFiles(inputs);
      throw new HttpException('Only WAVE files supported.', HttpStatus.BAD_REQUEST);
    }

    // TODO validate taskProperties and taskTranscript

    let reqData: ReqData = {
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
      const uploadPath = this.appService.pathBuilder.getAbsoluteUploadPath();
      await FileSystemHandler.createDirIfNotExists(uploadPath);
      let dbFile = await this.getFileItemByHash(mediaFile.hash);
      if (!dbFile) {
        // file doesn't exists in DB
        const fileExt = Path.extname(mediaFile.originalname);
        const newFilePath = Path.join(uploadPath, `${mediaFile.filename}${fileExt}`);
        await FileSystemHandler.moveFile(mediaFile.path, newFilePath);
        const audioInformation = await FileSystemHandler.readAudioFileInformation(newFilePath);

        dbFile = await this.fileRepository.save({
          hash: mediaFile.hash,
          metadata: audioInformation,
          original_name: mediaFile.originalname,
          size: mediaFile.size,
          type: mediaFile.mimetype,
          uploader_id: req.user.userId,
          url: newFilePath
            .replace(this.appService.pathBuilder.uploadPath, '')
            .replace(/^\//g, '')
        });
        const t = '';
      } else {
        // file already exists, remove temp file
        await unlink(mediaFile.path);
      }

      publicURL = this.appService.pathBuilder.getEncryptedUploadURL(dbFile.url);
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

      const regex = new RegExp(`^${Path.join(this.configService.get('api.url'), 'v1/links')}`);

      const originalName = this.appService.pathBuilder.extractFileNameFromURL(url);
      if (regex.exec(url)) {
        // is intern link
        const relativePath = reqData.file.url.replace(/^.+links\/([\/]+)\/(.+)/g, (g0, g1, g2) => {
          return `${this.appService.pathBuilder.decryptFilePath(g1)}/${g2}`;
        });

        let dbFile = await this.getFileItemByUrl(relativePath);
        if (!dbFile) {
          //add fileitem
          dbFile = await this.addFileItem({
            original_name: originalName,
            uploader_id: req.user.userId,
            url: relativePath
          });
        }
        reqData.file = {
          virtual_filename: this.appService.pathBuilder.extractFileNameFromURL(relativePath),
          virtual_folder_path: '',
          file_id: dbFile.id,
          url: dbFile.url
        };
      } else {
        let dbFile = await this.getFileItemByUrl(url);
        if (!dbFile) {
          //add fileitem
          const urlInfo = await this.appService.pathBuilder.getInformationFomURL(url);
          dbFile = await this.addFileItem({
            size: urlInfo.size,
            type: urlInfo.type,
            original_name: originalName,
            uploader_id: req.user.userId,
            url
          });
        }

        publicURL = url;
        reqData.file = {
          virtual_filename: this.appService.pathBuilder.extractFileNameFromURL(url),
          virtual_folder_path: '',
          file_id: dbFile.id,
          url: dbFile.url
        };
      }
    }
    return reqData;

     */
    return undefined;
  }

  private async removeTempFiles(mediaFiles: Express.Multer.File[]) {
    try {
      for (const mediaFile of mediaFiles) {
        await unlink(mediaFile.path);
      }
      return;
    } catch (e) {
      console.log(`Error: Can't remove mediaFile or JSONFile`);
    }
  }

  private async getFileItemByHash(hash: string): Promise<FileEntity> {
    return this.fileRepository.findOne({
      hash
    });
  }

  private async getFileItemByUrl(url: string): Promise<FileEntity> {
    return this.fileRepository.findOne({
      url
    });
  }

  private async addFileItem(fileItem: FileCreateDto): Promise<FileEntity> {
    return this.fileRepository.save(fileItem);
  }

  private async addTask(reqData: ReqData): Promise<TaskEntity> {
    return this.taskRepository.save({});
  }
}
