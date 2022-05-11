import {Body, Controller, Delete, Get, Param, Post, Put, Req} from '@nestjs/common';
import {ProjectService} from './project.service';
import {CombinedRoles} from '../../obj/decorators/combine.decorators';
import {AccountRole} from '@octra/octra-api-types';
import {removeNullAttributes} from '../../functions';
import {ProjectAssignRolesRequestDto, ProjectDto, ProjectRemoveRequestDto, ProjectRequestDto} from './project.dto';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {NumericStringValidationPipe} from '../../obj/pipes/numeric-string-validation.pipe';
import {ROLES_KEY} from '../../../../role.decorator';
import {Reflector} from '@nestjs/core';
import {InternRequest} from '../../obj/types';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectController {

  constructor(private projectService: ProjectService, private reflector: Reflector) {
  }

  /**
   * returns a list of projects.
   *
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Get('')
  async listProjects(): Promise<ProjectDto[]> {
    return removeNullAttributes(await this.projectService.listProjects()).map(a => new ProjectDto(a));
  }

  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator)
  @Get(':project_id')
  async getProject(@Param('project_id', NumericStringValidationPipe) id: string, @Req() req: InternRequest): Promise<ProjectDto> {
    const allowedProjectRoles = this.reflector.get<AccountRole[]>(ROLES_KEY, this.getProject);
    return removeNullAttributes<ProjectDto>(new ProjectDto(await this.projectService.getProject(id, allowedProjectRoles, req)));
  }

  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator)
  @Get(':project_id/roles')
  async getProjectRoles(@Param('project_id', NumericStringValidationPipe) id: string, @Req() req: InternRequest): Promise<any> {
    const allowedProjectRoles = this.reflector.get<AccountRole[]>(ROLES_KEY, this.getProjectRoles);
    return removeNullAttributes(await this.projectService.getProjectRoles(id, req.user, allowedProjectRoles));
  }

  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator)
  @Post(':project_id/roles')
  async assignProjectRoles(@Param('project_id', NumericStringValidationPipe) id: string, @Body() dto: ProjectAssignRolesRequestDto[], @Req() req: InternRequest): Promise<void> {
    const allowedProjectRoles = this.reflector.get<AccountRole[]>(ROLES_KEY, this.getProjectRoles);
    return removeNullAttributes(await this.projectService.assignProjectRoles(id, dto, req.user, allowedProjectRoles));
  }

  /**
   * creates a new project.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator)
  @Post('')
  async createProject(@Body() dto: ProjectRequestDto): Promise<ProjectDto> {
    return removeNullAttributes(new ProjectDto(await this.projectService.createProject(dto)));
  }

  /**
   * changes a specific project.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator)
  @Put(':project_id')
  async changeProject(@Param('project_id', NumericStringValidationPipe) id: string, @Body() dto: ProjectRequestDto, @Req() req: InternRequest): Promise<ProjectDto> {
    const allowedProjectRoles = this.reflector.get<AccountRole[]>(ROLES_KEY, this.getProjectRoles);
    return removeNullAttributes(new ProjectDto(await this.projectService.changeProject(id, dto, req.user, allowedProjectRoles)));
  }

  /**
   * removes a specific project.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Delete(':project_id')
  async removeProject(@Param('project_id', NumericStringValidationPipe) id: string, @Body() dto: ProjectRemoveRequestDto): Promise<void> {
    return this.projectService.removeProject(id, dto);
  }
}
