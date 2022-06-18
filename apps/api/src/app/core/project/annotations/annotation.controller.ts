import {Body, Controller, Param, Post, Put, Req, UseInterceptors} from '@nestjs/common';
import {AccountRole} from '@octra/api-types';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {CombinedRoles} from '../../../obj/decorators/combine.decorators';
import {SaveAnnotationDto} from './annotation.dto';
import {TaskDto, TasksService} from '../tasks';
import {InternRequest} from '../../../obj/types';
import {AnnotationService} from './annotation.service';
import {NumericStringValidationPipe} from '../../../obj/pipes/numeric-string-validation.pipe';
import {removeNullAttributes} from '@octra/server-side';
import {ProjectAccessInterceptor} from '../../../obj/interceptors/project-access.interceptor';
import {CustomApiException} from '../../../obj/decorators/api-exception.decorators';
import {NotFoundException} from '../../../obj/exceptions';

@ApiTags('Annotations')
@ApiBearerAuth()
@Controller('projects')
export class AnnotationController {

  constructor(private annotationService: AnnotationService, private tasksService: TasksService) {
  }

  /**
   * starts a new annotation.
   *
   * Allowed user roles: <code>administrator, project_admin, transcriber</code>
   */
  @CombinedRoles(AccountRole.administrator, AccountRole.user, AccountRole.projectAdministrator)
  @UseInterceptors(ProjectAccessInterceptor)
  @CustomApiException(new NotFoundException(`Can't find any project with this id.`))
  @Post(':project_id/annotations/start')
  async startAnnotation(@Param('project_id', NumericStringValidationPipe) project_id: string, @Req() req: InternRequest): Promise<TaskDto> {
    return new TaskDto(removeNullAttributes(await this.tasksService.giveNextFreeTaskToAccount(project_id, req.user.userId)));
  }

  /**
   * saves the current annotation. It doesn't automatically start a new annotation, it rather responds with the saved annotation.
   *
   * Allowed user roles: <code>administrator, project_admin, transcriber</code>
   */
  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator, AccountRole.transcriber)
  @UseInterceptors(ProjectAccessInterceptor)
  @CustomApiException(new NotFoundException(`Can't find any project with this id.`))
  @Put(':project_id/annotations/:task_id/save')
  async saveAnnotation(@Param('project_id', NumericStringValidationPipe) project_id: string, @Param('task_id', NumericStringValidationPipe) task_id: string, @Body() dto: SaveAnnotationDto, @Req() req: InternRequest): Promise<TaskDto> {
    return new TaskDto(removeNullAttributes(await this.tasksService.saveAnnotationData(project_id, task_id, req.user.userId, dto, req)));
  }

  /**
   * sets the status from 'BUSY' to 'FREE' of an annotation task.
   *
   * Allowed user roles: <code>administrator, project_admin, transcriber</code>
   */
  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator, AccountRole.transcriber)
  @UseInterceptors(ProjectAccessInterceptor)
  @CustomApiException(new NotFoundException(`Can't find any project with this id.`))
  @Put(':project_id/annotations/:task_id/free')
  async freeAnnotation(@Param('project_id', NumericStringValidationPipe) project_id: string, @Param('task_id', NumericStringValidationPipe) task_id: string, @Req() req: InternRequest): Promise<TaskDto> {
    return new TaskDto(removeNullAttributes(await this.tasksService.freeTask(req.user.userId, req)));
  }

  /**
   * continues an annotation task (only if status is 'BUSY').
   *
   * Allowed user roles: <code>administrator, project_admin, transcriber</code>
   */
  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator, AccountRole.transcriber)
  @UseInterceptors(ProjectAccessInterceptor)
  @CustomApiException(new NotFoundException(`Can't find any project with this id.`))
  @Put(':project_id/annotations/:task_id/continue')
  async continueAnnotation(@Param('project_id', NumericStringValidationPipe) project_id: string, @Param('task_id', NumericStringValidationPipe) task_id: string, @Req() req: InternRequest): Promise<TaskDto> {
    return new TaskDto(removeNullAttributes(await this.tasksService.continueTask(req.user.userId, req)));
  }

  /**
   * resumes an annotation task (only if status is 'FINISHED').
   *
   * Allowed user roles: <code>administrator, project_admin, transcriber</code>
   */
  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator, AccountRole.transcriber)
  @UseInterceptors(ProjectAccessInterceptor)
  @Put(':project_id/annotations/:task_id/resume')
  async resumeAnnotation(@Param('project_id', NumericStringValidationPipe) project_id: string, @Param('task_id', NumericStringValidationPipe) task_id: string, @Req() req: InternRequest): Promise<TaskDto> {
    return new TaskDto(removeNullAttributes(await this.tasksService.resumeTask(req.user.userId, req)));
  }
}
