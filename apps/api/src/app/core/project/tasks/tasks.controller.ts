import {ApiBearerAuth, ApiConsumes, ApiTags} from '@nestjs/swagger';
import {TasksService} from './tasks.service';
import {CombinedRoles} from '../../../obj/decorators/combine.decorators';
import {AccountRole} from '@octra/api-types';
import {InternRequest} from '../../../obj/types';
import {AppService} from '../../../app.service';
import {TaskChangeDto, TaskDto, TaskUploadDto} from './task.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseInterceptors
} from '@nestjs/common';
import {NumericStringValidationPipe} from '../../../obj/pipes/numeric-string-validation.pipe';
import {FormDataRequest} from 'nestjs-form-data';
import {removeNullAttributes} from '@octra/server-side';
import {ProjectAccessInterceptor} from '../../../obj/interceptors/project-access.interceptor';
import {CustomApiException} from '../../../obj/decorators/api-exception.decorators';
import {NotFoundException} from '../../../obj/exceptions';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('projects')
export class TasksController {

  constructor(private tasksService: TasksService,
              private appService: AppService) {
  }

  /**
   * creates a new task with the uploaded data.
   *
   * Allowed user roles: <code>administrator, project_admin, data_delivery</code>
   */
  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator, AccountRole.dataDelivery)
  @UseInterceptors(ProjectAccessInterceptor)
  @FormDataRequest()
  @ApiConsumes('multipart/form-data')
  @CustomApiException(new NotFoundException(`Can't find any project with this id.`))
  @Post(':project_id/tasks')
  async uploadTaskData(@Param('project_id', NumericStringValidationPipe) id: string, @Req() req: InternRequest, @Body() body: TaskUploadDto): Promise<TaskDto> {
    const createdTask = await this.tasksService.uploadTaskData(id, body, req);
    createdTask.inputsOutputs = createdTask.inputsOutputs.map(a => ({
      ...a,
      url: a.url ?? this.appService.pathBuilder.getEncryptedUploadURL(a.file_project?.file.url, a.file_project?.virtual_filename)
    }));
    let data = new TaskDto(createdTask);
    data = removeNullAttributes(data);
    return data;
  }

  /**
   * changes a task and it's data.
   *
   * Allowed user roles: <code>administrator, project_admin, data_delivery</code>
   */
  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator, AccountRole.dataDelivery)
  @UseInterceptors(ProjectAccessInterceptor)
  @FormDataRequest()
  @ApiConsumes('multipart/form-data')
  @CustomApiException(new NotFoundException(`Project id or task id not found.`))
  @Put(':project_id/tasks/:task_id')
  async changeTaskData(@Param('project_id', NumericStringValidationPipe) id: string, @Param('task_id', NumericStringValidationPipe) task_id: string, @Req() req: InternRequest, @Body() body: TaskChangeDto): Promise<TaskDto> {
    const createdTask = await this.tasksService.changeTaskData(id, task_id, body, req);
    createdTask.inputsOutputs = createdTask.inputsOutputs.map(a => ({
      ...a,
      url: a.url ?? this.appService.pathBuilder.getEncryptedUploadURL(a.file_project?.file.url, a.file_project?.virtual_filename)
    }));
    let data = new TaskDto(createdTask);
    data = removeNullAttributes(data);
    return data;
  }

  /**
   * removes a task.
   *
   * Allowed user roles: <code>administrator, project_admin, data_delivery</code>
   */
  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator, AccountRole.dataDelivery)
  @UseInterceptors(ProjectAccessInterceptor)
  @CustomApiException(new NotFoundException(`Can't find any project with this id.`))
  @Delete(':project_id/tasks/:task_id')
  async removeTask(@Param('project_id', NumericStringValidationPipe) project_id: string, @Param('task_id', NumericStringValidationPipe) task_id: string, @Req() req: InternRequest): Promise<void> {
    return this.tasksService.removeTask(project_id, task_id);
  }

  /**
   * returns a task.
   *
   * Allowed user roles: <code>administrator, project_admin, data_delivery</code>
   */
  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator, AccountRole.dataDelivery, AccountRole.transcriber)
  @UseInterceptors(ProjectAccessInterceptor)
  @CustomApiException(new NotFoundException(`Can't find any project with this id.`))
  @Get(':project_id/tasks/:task_id')
  async getTask(@Param('project_id') project_id: string, @Param('task_id') task_id: string, @Req() req: InternRequest): Promise<TaskDto> {
    const createdTask = req.task;
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

  /**
   * list tasks.
   *
   * Allowed user roles: <code>administrator, project_admin, data_delivery</code>
   */
  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator, AccountRole.dataDelivery)
  @UseInterceptors(ProjectAccessInterceptor)
  @CustomApiException(new NotFoundException(`Can't find any project with this id.`))
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
