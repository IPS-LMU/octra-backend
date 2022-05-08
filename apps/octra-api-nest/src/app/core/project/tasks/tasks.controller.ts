import {ApiBearerAuth, ApiConsumes, ApiTags} from '@nestjs/swagger';
import {TasksService} from './tasks.service';
import {CombinedRoles} from '../../../obj/decorators/combine.decorators';
import {AccountRole} from '@octra/octra-api-types';
import {InternRequest} from '../../../obj/types';
import {AppService} from '../../../app.service';
import {ConfigService} from '@nestjs/config';
import {TaskChangeDto, TaskDto, TaskUploadDto} from './task.dto';
import {FormDataRequest} from 'nestjs-form-data';
import {removeNullAttributes} from '../../../functions';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req
} from '@nestjs/common';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('projects')
export class TasksController {

  constructor(private tasksService: TasksService,
              private appService: AppService,
              private configService: ConfigService) {
  }

  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator, AccountRole.dataDelivery)
  @FormDataRequest()
  @ApiConsumes('multipart/form-data')
  @Post(':project_id/tasks')
  async uploadTaskData(@Param('project_id', ParseIntPipe) id: string, @Req() req: InternRequest, @Body() body: TaskUploadDto): Promise<TaskDto> {
    const createdTask = await this.tasksService.uploadTaskData(id, body, req);
    createdTask.inputsOutputs = createdTask.inputsOutputs.map(a => ({
      ...a,
      url: a.url ?? this.appService.pathBuilder.getEncryptedUploadURL(a.file_project?.file.url, a.file_project?.virtual_filename)
    }));
    let data = new TaskDto(createdTask);
    data = removeNullAttributes(data);
    return data;
  }

  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator, AccountRole.dataDelivery)
  @FormDataRequest()
  @ApiConsumes('multipart/form-data')
  @Put(':project_id/tasks/:task_id')
  async changeTaskData(@Param('project_id', ParseIntPipe) id: string, @Param('task_id', ParseIntPipe) task_id: string, @Req() req: InternRequest, @Body() body: TaskChangeDto): Promise<TaskDto> {
    const createdTask = await this.tasksService.changeTaskData(id, task_id, body, req);
    createdTask.inputsOutputs = createdTask.inputsOutputs.map(a => ({
      ...a,
      url: a.url ?? this.appService.pathBuilder.getEncryptedUploadURL(a.file_project?.file.url, a.file_project?.virtual_filename)
    }));
    let data = new TaskDto(createdTask);
    data = removeNullAttributes(data);
    return data;
  }

  // TODO validate account role according to project access?

  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator, AccountRole.dataDelivery)
  @Delete(':project_id/tasks/:task_id')
  async removeTask(@Param('project_id', ParseIntPipe) project_id: string, @Param('task_id', ParseIntPipe) task_id: string): Promise<void> {
    return this.tasksService.removeTask(project_id, task_id);
  }

  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator, AccountRole.dataDelivery, AccountRole.transcriber)
  @Get(':project_id/tasks/:task_id')
  async getTask(@Param('project_id') project_id: string, @Param('task_id') task_id: string): Promise<TaskDto> {
    // TODO change with pipe
    if (Number(task_id) < 1) {
      throw new HttpException(`Id of task must be greater than 0`, HttpStatus.BAD_REQUEST);
    }
    const createdTask = await this.tasksService.getTask(project_id, task_id);
    if (!createdTask) {
      throw new HttpException(`Can't get task`, HttpStatus.CONFLICT);
    }
    createdTask.inputsOutputs = createdTask.inputsOutputs?.map(a => ({
      ...a,
      url: a.url ?? this.appService.pathBuilder.getEncryptedUploadURL(a.file_project?.file.url, a.file_project?.virtual_filename)
    }));
    let data = new TaskDto(createdTask);
    data = removeNullAttributes(data);
    return data;
  }

  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator, AccountRole.dataDelivery)
  @Get(':project_id/tasks/')
  async listTasks(@Param('project_id') project_id: string): Promise<TaskDto[]> {
    return removeNullAttributes((await this.tasksService.listTasks(project_id)).map(a => new TaskDto({
      ...a,
      inputsOutputs: a.inputsOutputs?.map(a => ({
        ...a,
        url: a.url ?? this.appService.pathBuilder.getEncryptedUploadURL(a.file_project?.file.url, a.file_project?.virtual_filename)
      }))
    })));
  }
}
