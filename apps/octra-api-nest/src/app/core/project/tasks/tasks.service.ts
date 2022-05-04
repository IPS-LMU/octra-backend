import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {AppService} from '../../../app.service';
import {readFile, unlink} from 'fs-extra';
import {InternRequest} from '../../../obj/types';
import {ConfigService} from '@nestjs/config';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {FileEntity} from '../../files/file.entity';
import {TaskEntity, TaskInputOutputEntity} from '../task.entity';
import {FileCreateDto} from '../../files/file.dto';
import {TaskProperties, TaskUploadDto} from './task.dto';
import * as Path from 'path';
import {FileSystemHandler} from '../../../obj/filesystem-handler';
import {FileHashStorage} from '../../../obj/file-hash-storage';
import {AnnotJSONType, TranscriptType} from '../annotations/annotation.dto';
import {TaskInputOutputCreatorType, TaskStatus} from '@octra/octra-api-types';
import {FileProjectEntity} from '../project.entity';
import {removeNullAttributes} from "../../../functions";
import {DatabaseService} from "../../../database.service";

interface ReqData {
  virtual_folder_path?: string;
  virtual_filename: string;
}

@Injectable()
export class TasksService {
  constructor(private appService: AppService,
              private configService: ConfigService,
              @InjectRepository(TaskEntity)
              private taskRepository: Repository<TaskEntity>,
              @InjectRepository(FileEntity)
              private fileRepository: Repository<FileEntity>,
              private databaseService: DatabaseService) {
  }

  async uploadTaskData(project_id: number, body: TaskUploadDto, req: InternRequest): Promise<TaskEntity> {
    // TODO allow empty transcript
    const inputs = body.inputs;
    const mediaFile = inputs?.find(a => a.mimetype === "audio/wave");
    const transcriptFile = inputs?.find(a => a.mimetype === "application/json" || a.mimetype === "text/plain");
    const taskProperties: TaskProperties = body?.properties;

    if (!mediaFile && !taskProperties.media?.url) {
      await this.removeTempFiles(inputs);
      throw new HttpException('You have to either upload an audio file or set an url in properties.media.url.', HttpStatus.BAD_REQUEST);
    }

    if (mediaFile && !(/.+(\.wav)/g).exec(mediaFile.originalName)) {
      await this.removeTempFiles(inputs);
      throw new HttpException('Only WAVE files supported.', HttpStatus.BAD_REQUEST);
    }

    let reqData: ReqData = {
      virtual_filename: undefined,
      virtual_folder_path: undefined
    }

    const {virtual_filename, dbFile} = await this.checkMediaFile(req, mediaFile, reqData, taskProperties);

    if (transcriptFile) {
      //read transcript file
      const content = await readFile(transcriptFile.path, "utf-8");
      if (body.transcriptType === TranscriptType.AnnotJSON) {
        body.transcript = JSON.parse(content);
      } else {
        body.transcript = {
          links: [],
          annotates: mediaFile.originalName,
          name: `${Path.parse(mediaFile.originalName).name}_annot.json`,
          sampleRate: dbFile.metadata.sampleRate,
          levels: [{
            name: "TRN",
            type: AnnotJSONType.SEGMENT,
            items: [{
              sampleStart: 0,
              sampleDur: dbFile.metadata.duration.samples,
              id: 1,
              labels: [{
                name: "TRN",
                value: content
              }]
            }]
          }]
        };
      }
    }


    reqData = {
      virtual_filename,
      virtual_folder_path: ''
    }

    body = await this.adaptConvertedTranscript(body, mediaFile, dbFile);
    taskProperties.status = TaskStatus.draft;
    const id = await this.addChangeNewTask(project_id, body, dbFile, reqData, taskProperties);
    return this.getTask(project_id, Number(id));
  }

  async changeTaskData(project_id: number, task_id: number, body: TaskUploadDto, req: InternRequest): Promise<TaskEntity> {
    const task = await this.taskRepository.findOne(task_id, {relations: ['inputsOutputs', 'inputsOutputs.file_project', 'inputsOutputs.file_project.file']});
    const inputs = body.inputs;
    const mediaFile = inputs?.find(a => a.mimetype === "audio/wave");
    const transcriptFile = inputs?.find(a => a.mimetype === "application/json" || a.mimetype === "text/plain");
    const taskProperties: TaskProperties = body?.properties;

    if (!task) {
      throw new HttpException("Task not found.", HttpStatus.NOT_FOUND);
    }

    if (mediaFile && !(/.+(\.wav)/g).exec(mediaFile.originalName)) {
      await this.removeTempFiles(inputs);
      throw new HttpException('Only WAVE files supported.', HttpStatus.BAD_REQUEST);
    }

    let reqData: ReqData = {
      virtual_filename: undefined,
      virtual_folder_path: undefined
    }

    let virtual_filename;
    let dbFile;

    if (mediaFile) {
      const result = await this.checkMediaFile(req, mediaFile, reqData, taskProperties);
      virtual_filename = result.virtual_filename;
      dbFile = result.dbFile;
    }

    if (transcriptFile) {
      //read transcript file
      const content = await readFile(transcriptFile.path, "utf-8");
      if (body.transcriptType === TranscriptType.AnnotJSON) {
        body.transcript = JSON.parse(content);
      } else {
        body.transcript = {
          links: [],
          annotates: mediaFile.originalName,
          name: `${Path.parse(mediaFile.originalName).name}_annot.json`,
          sampleRate: dbFile.metadata.sampleRate,
          levels: [{
            name: "TRN",
            type: AnnotJSONType.SEGMENT,
            items: [{
              sampleStart: 0,
              sampleDur: dbFile.metadata.duration.samples,
              id: 1,
              labels: [{
                name: "TRN",
                value: content
              }]
            }]
          }]
        };
      }
    }

    reqData = {
      virtual_filename,
      virtual_folder_path: ''
    }

    body = await this.adaptConvertedTranscript(body, mediaFile, dbFile);
    await this.addChangeNewTask(project_id, body, dbFile, reqData, taskProperties, task);
    return this.getTask(project_id, task_id);
  }

  public async removeTask(project_id: number, task_id: number) {
    return this.databaseService.transaction<void>(async (manager) => {
      const project = await manager.findOne(TaskEntity, {
        id: task_id,
        project_id
      });

      if (!project) {
        throw new HttpException("Task not found.", HttpStatus.BAD_REQUEST);
      }

      // set nexttask from other tasks to null
      await manager.update(TaskEntity, {
        nexttask_id: task_id
      }, {
        nexttask_id: null
      });
      // remove input outputs
      await manager.delete(TaskInputOutputEntity, {
        task_id
      });
      const result = await manager.delete(TaskEntity, task_id);

      if (result.affected !== 1) {
        throw new HttpException("Task not found.", HttpStatus.NOT_FOUND);
      }
    });
  }

  private async addChangeNewTask(project_id: number, body: TaskUploadDto, audioDBFile: FileEntity, reqData: ReqData, taskProperties: TaskProperties, task?: TaskEntity): Promise<number> {
    return this.databaseService.transaction<number>(async (manager) => {
      let task_id = task?.id;
      const audioFileProject = {
        file_id: audioDBFile.id,
        project_id,
        virtual_folder_path: reqData.virtual_folder_path,
        virtual_filename: reqData.virtual_filename,
      } as FileProjectEntity;
      const newTaskProperties = removeNullAttributes({
        pid: taskProperties.pid,
        orgtext: taskProperties.orgtext,
        assessment: taskProperties.assessment,
        priority: taskProperties.priority,
        status: taskProperties.status,
        code: taskProperties.code,
        startdate: taskProperties.startdate,
        enddate: taskProperties.enddate,
        log: taskProperties.log,
        comment: taskProperties.comment,
        tool_id: taskProperties.tool_id,
        admin_comment: taskProperties.admin_comment,
        nexttask_id: taskProperties.nexttask_id,
        type: taskProperties.type,
        project_id
      } as TaskEntity);

      if (task) {
        // update task
        await manager.update(TaskEntity, {id: task_id}, newTaskProperties);
      } else {
        // insert new task
        const taskQuery = await manager.insert(TaskEntity, newTaskProperties);
        task_id = taskQuery?.identifiers[0]?.id
      }

      if (!task_id) {
        throw Error("task_id is undefined.");
      }

      const transcriptInputDB = task?.inputsOutputs?.find(a => a.label === "transcript" && a.type === "input");
      const audioInputDB = task?.inputsOutputs?.find(a => a.label === "audio" && a.type === "input");
      if (audioDBFile) {
        // insert or update audioFileDB
        if (audioInputDB) {
          // update reference only
          await manager.update(FileProjectEntity, {
            id: audioInputDB.file_project_id
          }, audioFileProject);
        } else {
          // add new file_project for audio file
          const fileProject = await manager.insert(FileProjectEntity, audioFileProject);
          await manager.insert(TaskInputOutputEntity, {
            task_id: task_id,
            file_project_id: fileProject.identifiers[0].id,
            type: 'input',
            creator_type: TaskInputOutputCreatorType.user,
            label: 'audio'
          } as TaskInputOutputEntity);
        }
      }

      if (body.transcript) {
        const newTranscript = {
          task_id,
          type: 'input',
          creator_type: TaskInputOutputCreatorType.user,
          label: 'transcript',
          content: body.transcript
        } as TaskInputOutputEntity;

        // insert or update transcript
        if (transcriptInputDB) {
          // update task input only
          await manager.update(TaskInputOutputEntity, {
            id: transcriptInputDB.id
          }, newTranscript);
        } else {
          // add new file_project for audio file
          await manager.insert(TaskInputOutputEntity, newTranscript);
        }
      }
      return task_id;
    });
  }

  private async checkMediaFile(req: InternRequest, mediaFile: FileHashStorage, reqData: any, taskProperties: TaskProperties): Promise<{
    dbFile: FileEntity,
    virtual_filename: string
  }> {
    let dbFile: FileEntity;
    let virtual_filename: string;

    if (mediaFile) {
      const uploadPath = this.appService.pathBuilder.getAbsoluteUploadPath();
      await FileSystemHandler.createDirIfNotExists(uploadPath);
      dbFile = await this.getFileItemByHash(mediaFile.hash);

      if (!dbFile) {
        // file doesn't exists in DB
        const newFilePath = Path.join(uploadPath, `${Path.basename(mediaFile.path)}`);
        await FileSystemHandler.moveFile(mediaFile.path, newFilePath);
        const audioInformation = await FileSystemHandler.readAudioFileInformation(newFilePath);

        dbFile = await this.fileRepository.save({
          hash: mediaFile.hash,
          metadata: audioInformation,
          original_name: mediaFile.originalName,
          size: mediaFile.size,
          type: mediaFile.mimetype,
          uploader_id: req.user.userId,
          url: newFilePath
            .replace(this.appService.pathBuilder.uploadPath, '')
            .replace(/^\//g, '')
        });
      } else {
        // file already exists, remove temp file
        await unlink(mediaFile.path);
      }

      virtual_filename = mediaFile.originalName;
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
        const relativePath = reqData.file.url.replace(/^.+links\/([/]+)\/(.+)/g, (g0, g1, g2) => {
          return `${this.appService.pathBuilder.decryptFilePath(g1)}/${g2}`;
        });

        dbFile = await this.getFileItemByUrl(relativePath);
        if (!dbFile) {
          //add fileitem
          dbFile = await this.addFileItem({
            original_name: originalName,
            uploader_id: req.user.userId,
            url: relativePath
          });
        }
        virtual_filename = this.appService.pathBuilder.extractFileNameFromURL(relativePath);
      } else {
        dbFile = await this.getFileItemByUrl(url);
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

        virtual_filename = this.appService.pathBuilder.extractFileNameFromURL(url);
      }
    }

    return {
      virtual_filename,
      dbFile
    };
  }

  public async getTask(project_id: number, task_id: number): Promise<TaskEntity> {
    return this.taskRepository.findOne({
      id: task_id,
      project_id
    }, {relations: ['inputsOutputs', 'inputsOutputs.file_project', 'inputsOutputs.file_project.file']});
  }

  public async listTasks(project_id: number): Promise<TaskEntity[]> {
    return this.taskRepository.find({
      where: {
        project_id
      },
      relations: ['inputsOutputs', 'inputsOutputs.file_project', 'inputsOutputs.file_project.file']
    });
  }

  private async adaptConvertedTranscript(body: TaskUploadDto, mediaFile: FileHashStorage, dbFile: FileEntity) {
    if (body.transcript && body.transcriptType === TranscriptType.Text) {
      // adapt transcript
      body.transcript.annotates = mediaFile.originalName;
      body.transcript.name = `${Path.parse(mediaFile.originalName).name}_annot.json`;
      if (dbFile.metadata.sampleRate && dbFile.metadata.sampleRate > 0) {
        body.transcript.sampleRate = dbFile.metadata.sampleRate;
      }
      if (dbFile.metadata.duration.samples && dbFile.metadata.duration.samples > 0) {
        body.transcript.levels[0].items[0].sampleDur = dbFile.metadata.duration.samples;
      }
      body.transcript.levels[0].name = 'TRN';
    }
    return body;
  }

  private async removeTempFiles(mediaFiles: FileHashStorage[]) {
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
}
