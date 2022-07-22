import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  MethodNotAllowedException,
  NotFoundException
} from '@nestjs/common';
import {AppService} from '../../../app.service';
import {readFile, unlink} from 'fs-extra';
import {InternRequest} from '../../../obj/types';
import {ConfigService} from '@nestjs/config';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {TaskChangeDto, TaskProperties, TaskType, TaskUploadDto} from './task.dto';
import * as Path from 'path';
import {join} from 'path';
import {FileSystemHandler} from '../../../obj/filesystem-handler';
import {FileHashStorage} from '../../../obj/file-hash-storage';
import {TaskInputOutputCreatorType, TaskStatus} from '@octra/api-types';
import {DatabaseService} from '../../../database.service';
import {SaveAnnotationDto} from '../annotations/annotation.dto';
import {
  FileProjectEntity,
  removeNullAttributes,
  removeProperties,
  TaskEntity,
  TaskInputOutputEntity
} from '@octra/server-side';
import {ForbiddenResource} from '../../../obj/exceptions';
import {FileProjectCreateDto} from '../../files/file.project.dto';

interface ReqData {
  real_filename?: string;
  path?: string;
}

@Injectable()
export class TasksService {
  constructor(private appService: AppService,
              private configService: ConfigService,
              @InjectRepository(TaskEntity)
              private taskRepository: Repository<TaskEntity>,
              @InjectRepository(FileProjectEntity)
              private fileProjectRepository: Repository<FileProjectEntity>,
              private databaseService: DatabaseService) {
  }

  async uploadTaskData(project_id: string, body: TaskUploadDto, req: InternRequest): Promise<TaskEntity> {
    const inputs = body.inputs;
    const mediaFile = inputs?.find(a => a.mimetype === 'audio/wave');
    const transcriptFile = inputs?.find(a => a.mimetype === 'application/json' || a.mimetype === 'text/plain');
    let taskProperties: TaskProperties = body?.properties;
    taskProperties = (taskProperties && typeof taskProperties === 'string') ? JSON.parse(taskProperties as any) : taskProperties;
    if (!mediaFile && !taskProperties.media?.url) {
      await this.removeTempFiles(inputs);
      throw new HttpException('You have to either upload an audio file or set an url in properties.media.url.', HttpStatus.BAD_REQUEST);
    }

    if (mediaFile && !(/.+(\.wav)/g).exec(mediaFile.originalName)) {
      await this.removeTempFiles(inputs);
      throw new HttpException('Only WAVE files supported.', HttpStatus.BAD_REQUEST);
    }

    let reqData: ReqData = {
      real_filename: undefined
    }

    const {
      real_filename,
      dbFile
    } = await this.checkMediaFile(project_id, req, mediaFile, reqData, taskProperties, body.properties.files_destination);

    if (transcriptFile) {
      //read transcript file
      body.transcript = await readFile(transcriptFile.path, 'utf-8');
    }


    reqData = {
      real_filename,
      path: dbFile.path ?? dbFile.url
    }

    taskProperties.status = TaskStatus.draft;
    const id = await this.addChangeNewTask(project_id, body, dbFile, reqData, taskProperties);
    return this.getTask(project_id, id);
  }

  async changeTaskData(project_id: string, task_id: string, body: TaskUploadDto | TaskChangeDto, req: InternRequest): Promise<TaskEntity> {
    const task = req.task;
    const inputs = body.inputs;
    const mediaFile = inputs?.find(a => a.mimetype === 'audio/wave');
    const transcriptFile = inputs?.find(a => a.mimetype === 'application/json' || a.mimetype === 'text/plain');
    const taskProperties: TaskProperties = body?.properties;

    if (!task) {
      throw new HttpException('Task not found.', HttpStatus.NOT_FOUND);
    }

    if (mediaFile && !(/.+(\.wav)/g).exec(mediaFile.originalName)) {
      await this.removeTempFiles(inputs);
      throw new HttpException('Only WAVE files supported.', HttpStatus.BAD_REQUEST);
    }

    let reqData: ReqData = {
      real_filename: undefined,
      path: undefined
    }

    let real_filename;
    let dbFile;

    if (mediaFile) {
      const result = await this.checkMediaFile(project_id, req, mediaFile, reqData, taskProperties, body.properties.files_destination);
      real_filename = result.real_filename;
      dbFile = result.dbFile;
    }

    if (transcriptFile) {
      //read transcript file
      body.transcript = await readFile(transcriptFile.path, 'utf-8');
    }

    reqData = {
      real_filename,
      path: ''
    }

    await this.addChangeNewTask(project_id, body, dbFile, reqData, taskProperties, task);
    return this.getTask(project_id, task_id);
  }

  public async removeTask(project_id: string, task_id: string) {
    return this.databaseService.transaction<void>(async (manager) => {
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
      const result = await manager.delete(TaskEntity, {
        id: task_id
      });

      if (result.affected !== 1) {
        throw new HttpException('Task not found.', HttpStatus.NOT_FOUND);
      }
      return;
    });
  }

  private async addChangeNewTask(project_id: string, body: TaskUploadDto | TaskChangeDto, audioDBFile: FileProjectEntity, reqData: ReqData, taskProperties: TaskProperties, task?: TaskEntity): Promise<string> {
    return await this.databaseService.transaction<string>(async (manager) => {
      let task_id = task?.id;
      const audioFileProject = {
        ...audioDBFile,
        id: undefined,
        project_id,
        real_name: reqData.real_filename,
        url: reqData.path
      } as FileProjectEntity;
      const newTaskProperties = removeNullAttributes({
        pid: taskProperties.pid,
        orgtext: taskProperties.orgtext,
        assessment: taskProperties.assessment,
        priority: taskProperties.priority,
        status: taskProperties.status ?? 'DRAFT',
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
        throw Error('task_id is undefined.');
      }

      const transcriptInputDB = task?.inputsOutputs?.find(a => a.label === 'transcript' && a.type === 'input');
      const audioInputDB = task?.inputsOutputs?.find(a => a.label === 'audio' && a.type === 'input');
      if (audioDBFile) {
        // insert or update audioFileDB
        if (audioInputDB) {
          // update input reference only
          await manager.update(TaskInputOutputEntity, {
            id: audioInputDB.id,
            task_id
          }, {
            file_project_id: audioDBFile.id,
            creator_type: TaskInputOutputCreatorType.user,
            label: 'audio'
          });
        } else {
          // add new input file for audio file
          await manager.insert(TaskInputOutputEntity, {
            task_id,
            file_project_id: audioDBFile.id,
            type: 'input',
            creator_type: TaskInputOutputCreatorType.user,
            label: 'audio'
          });
        }
      }

      if (body.transcript) {
        const newTranscript = {
          task_id,
          type: 'input',
          creator_type: TaskInputOutputCreatorType.user,
          label: 'transcript',
          content: body.transcript,
          content_type: body.content_type
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

  private async checkMediaFile(project_id: string, req: InternRequest, mediaFile: FileHashStorage, reqData: any, taskProperties: TaskProperties, filesDestination?: string): Promise<{
    dbFile: FileProjectEntity;
    real_filename: string;
  }> {
    let dbFile: FileProjectEntity;
    let virtual_filename: string;

    if (mediaFile) {
      let uploadPath = this.appService.pathBuilder.getAbsoluteProjectFilesPath(project_id);
      filesDestination = filesDestination ? filesDestination.replace(/(\.+\/+)|(\.+\\+)/g, '') : undefined;
      uploadPath = filesDestination ? join(uploadPath, filesDestination) : uploadPath;
      await FileSystemHandler.createDirIfNotExists(uploadPath);
      dbFile = await this.getFileItemByHash(project_id, mediaFile.hash);
      const newFilePath = Path.join(uploadPath, `${Path.basename(mediaFile.path)}`);
      const newProjectFilesPath = filesDestination ? join('{projects}', `project_${project_id}`, filesDestination) : undefined;
      const folder = dbFile?.path ? Path.parse(dbFile.path).dir : '';

      if (!dbFile || ((!dbFile.url || dbFile.url.trim() === '') && filesDestination && folder !== newProjectFilesPath)) {
        // file doesn't exists in DB
        await FileSystemHandler.moveFile(mediaFile.path, newFilePath);
        const audioInformation = await FileSystemHandler.readAudioFileInformation(newFilePath);

        dbFile = await this.fileProjectRepository.save({
          project_id,
          hash: mediaFile.hash,
          metadata: audioInformation,
          real_name: mediaFile.originalName,
          size: mediaFile.size,
          type: mediaFile.mimetype,
          uploader_id: req.user.userId,
          path: join('{projects}', newFilePath
            .replace(this.appService.pathBuilder.projectsPath, ''))
        });
      } else {
        // file already exists, remove temp file
        await unlink(mediaFile.path);
      }
    } else {
      // no media file uploaded
      const url = taskProperties.media.url;
      if (!this.appService.pathBuilder.isURL(url)) {
        throw new BadRequestException('Can\'t find url in url property');
      }

      const originalName = this.appService.pathBuilder.extractFileNameFromURL(url);
      if (this.appService.pathBuilder.isEncryptedURL(url)) {
        // is intern link
        const relativePath = reqData.file.url.replace(/^.+links\/([/]+)\/(.+)/g, (g0, g1, g2) => {
          return `${this.appService.pathBuilder.decryptFilePath(g1)}/${g2}`;
        });

        dbFile = await this.getFileItemByUrl(project_id, relativePath);
        if (!dbFile) {
          //add fileitem
          dbFile = await this.addFileItem({
            project_id,
            real_name: originalName,
            uploader_id: req.user.userId,
            path: join('{projects}', relativePath)
          });
        }
        virtual_filename = this.appService.pathBuilder.extractFileNameFromURL(relativePath);
      } else {
        dbFile = await this.getFileItemByUrl(project_id, url);
        if (!dbFile) {
          //add fileitem
          const urlInfo = await this.appService.pathBuilder.getInformationFomURL(url);
          dbFile = await this.addFileItem({ // TODO fix files are added multiple times!
            project_id,
            size: urlInfo.size,
            type: urlInfo.type,
            real_name: originalName,
            uploader_id: req.user.userId,
            url
          });
        }

        virtual_filename = this.appService.pathBuilder.extractFileNameFromURL(url);
      }
    }

    return {
      real_filename: dbFile.real_name,
      dbFile
    };
  }

  public async getTask(project_id: string, task_id: string): Promise<TaskEntity> {
    return this.taskRepository.findOne({
      where: {
        id: task_id,
        project_id
      },
      relations: ['inputsOutputs', 'inputsOutputs.file_project']
    });
  }

  public async listTasks(project_id: string): Promise<TaskEntity[]> {
    return this.taskRepository.find({
      where: {
        project_id
      },
      relations: ['inputsOutputs', 'inputsOutputs.file_project']
    });
  }

  public async giveNextFreeTaskToAccount(project_id: string, worker_id: string): Promise<TaskEntity> {
    // TODO how to handle tasks that are referenced by another tasks in nexttask_id?
    return this.databaseService.transaction<TaskEntity>(async (manager) => {
      const task = await manager.findOne(TaskEntity, {
        where: [
          {worker_id, project_id, status: TaskStatus.free, type: TaskType.annotation},
          {project_id, status: TaskStatus.free, type: TaskType.annotation},
        ]
      });

      if (!task) {
        throw new NotFoundException('Can\'t find a free task.');
      }

      const updateResult = await manager.update(TaskEntity, {
        id: task.id
      }, {
        status: TaskStatus.busy,
        startdate: new Date().toISOString(),
        worker_id
      });

      if (updateResult.affected < 1) {
        throw new InternalServerErrorException('Can\'t update task status to \'BUSY\'.');
      }
      return await manager.findOne(TaskEntity, {
        where: {
          id: task.id
        },
        relations: ['inputsOutputs', 'inputsOutputs.file_project'],
      });
    });
  }

  public async saveAnnotationData(project_id: string, task_id: string, worker_id: string, dto: SaveAnnotationDto, req: InternRequest): Promise<TaskEntity> {
    return this.databaseService.transaction<TaskEntity>(async (manager) => {
      const task = req.task;

      if (task.status === TaskStatus.finished) {
        throw new BadRequestException('You can\'t save an annotation of an finished task');
      }

      if (task.status === TaskStatus.busy && task.worker_id.toString() !== worker_id) {
        throw new BadRequestException('You can\'t overwrite an annotation that is busy and is edited by another worker.');
      }

      await manager.insert(TaskInputOutputEntity, {
        task_id: task.id,
        type: 'output',
        content: dto.transcript,
        content_type: dto.content_type,
        creator_type: TaskInputOutputCreatorType.user,
        label: 'transcript'
      });

      const updateResult = await manager.update(TaskEntity, {
        id: task.id
      }, {
        ...removeProperties(dto, ['transcript', 'content_type']),
        status: TaskStatus.finished,
        enddate: new Date().toISOString(),
        worker_id
      });

      if (updateResult.affected < 1) {
        throw new InternalServerErrorException('Can\'t save annotation to task.');
      }
      return await manager.findOne(TaskEntity, {
        where: {id: task.id},
        relations: ['inputsOutputs', 'inputsOutputs.file_project'],
      });
    });
  }

  public async freeTask(worker_id: string, req: InternRequest): Promise<TaskEntity> {
    return this.databaseService.transaction<TaskEntity>(async (manager) => {
      const task = req.task;

      if (task.worker_id.toString() !== worker_id) {
        throw new ForbiddenResource();
      }

      const updateResult = await manager.update(TaskEntity, {
        id: task.id
      }, {
        status: TaskStatus.free
      });

      if (updateResult.affected < 1) {
        throw new InternalServerErrorException('Can\'t free annotation.');
      }
      return await manager.findOne(TaskEntity, {
        where: {id: task.id},
        relations: ['inputsOutputs', 'inputsOutputs.file_project'],
      });
    });
  }

  public async continueTask(worker_id: string, req: InternRequest): Promise<TaskEntity> {
    return this.databaseService.transaction<TaskEntity>(async (manager) => {
      const task = req.task;

      if (task.worker_id && task.worker_id.toString() !== worker_id.toString()) {
        throw new MethodNotAllowedException('You can\'t resume a task that is edited by another worker.');
      }

      if (task.status !== TaskStatus.busy) {
        throw new MethodNotAllowedException('You can\'t continue a task that is not \'BUSY\'.');
      }

      // don't change status because there's no need.
      return await manager.findOne(TaskEntity, {
        where: {id: task.id},
        relations: ['inputsOutputs', 'inputsOutputs.file_project'],
      });
    });
  }

  public async resumeTask(worker_id: string, req: InternRequest): Promise<TaskEntity> {
    return this.databaseService.transaction<TaskEntity>(async (manager) => {
      const task = req.task;
      if (task.worker_id && task.worker_id.toString() !== worker_id) {
        throw new MethodNotAllowedException('You can\'t resume a task that is edited by another worker.');
      }

      if (task.status !== TaskStatus.finished) {
        throw new MethodNotAllowedException('You can\'t continue a task that is not \'BUSY\'.');
      }

      // don't change status because there's no need.
      return await manager.findOne(TaskEntity, {
        where: {id: task.id},
        relations: ['inputsOutputs', 'inputsOutputs.file_project'],
      });
    });
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

  private async getFileItemByHash(project_id: string, hash: string): Promise<FileProjectEntity> {
    return this.fileProjectRepository.findOneBy({
      project_id,
      hash
    });
  }

  private async getFileItemByUrl(project_id: string, url: string): Promise<FileProjectEntity> {
    return this.fileProjectRepository.findOneBy({
      project_id,
      url
    });
  }

  private async addFileItem(fileItem: FileProjectCreateDto): Promise<FileProjectEntity> {
    return this.fileProjectRepository.save(fileItem);
  }

  public getURLForInputOutPut(io: TaskInputOutputEntity) {
    return (io.url && io.url.trim() !== '') ? io.url : ((io.file_project && io.file_project.path?.trim() !== '') ? this.appService.pathBuilder.getEncryptedFileURL(io.file_project?.path) : io.file_project?.url);
  }
}
