import {Body, Controller, Param, ParseIntPipe, Post, Put, Req} from '@nestjs/common';
import {AccountRole} from '@octra/octra-api-types';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {CombinedRoles} from '../../../obj/decorators/combine.decorators';
import {SaveAnnotationDto} from './annotation.dto';
import {TaskDto, TasksService} from '../tasks';
import {InternRequest} from '../../../obj/types';
import {removeNullAttributes} from '../../../functions';
import {AnnotationService} from './annotation.service';

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
  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator, AccountRole.transcriber)
  @Post(':project_id/annotations/start')
  async startAnnotation(@Param('project_id', ParseIntPipe) project_id: number, @Req() req: InternRequest): Promise<TaskDto> {
    return new TaskDto(removeNullAttributes(await this.tasksService.giveNextFreeTaskToAccount(project_id, req.user.userId)));
  }

  /**
   * saves the current annotation. It doesn't automatically start a new annotation, it rather responds with the saved annotation.
   *
   * Allowed user roles: <code>administrator, project_admin, transcriber</code>
   */
  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator, AccountRole.transcriber)
  @Put(':project_id/annotations/:annotation_id/save')
  async saveAnnotation(@Param('project_id', ParseIntPipe) project_id: number, @Param('annotation_id', ParseIntPipe) annotation_id: number, @Body() dto: SaveAnnotationDto, @Req() req: InternRequest): Promise<TaskDto> {
    return new TaskDto(removeNullAttributes(await this.tasksService.saveAnnotationData(project_id, annotation_id, req.user.userId, dto)));
  }

  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator, AccountRole.transcriber)
  @Put(':project_id/annotations/:annotation_id/free')
  async freeAnnotation(@Param('project_id', ParseIntPipe) project_id: number, @Param('annotation_id', ParseIntPipe) annotation_id: number): Promise<any> {
    return undefined;
  }

  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator, AccountRole.transcriber)
  @Put(':project_id/annotations/:annotation_id/continue')
  async continueAnnotation(@Param('project_id', ParseIntPipe) project_id: number, @Param('annotation_id', ParseIntPipe) annotation_id: number): Promise<any> {
    return undefined;
  }

  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator, AccountRole.transcriber)
  @Put(':project_id/annotations/:annotation_id/restart')
  async restartAnnotation(@Param('project_id', ParseIntPipe) project_id: number, @Param('annotation_id', ParseIntPipe) annotation_id: number): Promise<any> {
    return undefined;
  }
}
