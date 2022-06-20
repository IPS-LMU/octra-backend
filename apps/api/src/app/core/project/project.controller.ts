import {Body, Controller, Delete, Get, Param, Post, Put, Req, UseInterceptors} from '@nestjs/common';
import {ProjectService} from './project.service';
import {CombinedRoles} from '../../obj/decorators/combine.decorators';
import {AccountRole} from '@octra/api-types';
import {ProjectAssignRoleDto, ProjectDto, ProjectRemoveRequestDto, ProjectRequestDto} from './project.dto';
import {ApiBearerAuth, ApiBody, ApiTags} from '@nestjs/swagger';
import {NumericStringValidationPipe} from '../../obj/pipes/numeric-string-validation.pipe';
import {ROLES_KEY} from '../../../../role.decorator';
import {Reflector} from '@nestjs/core';
import {InternRequest} from '../../obj/types';
import {AccountRoleProjectEntity, removeNullAttributes} from '@octra/server-side';
import {ProjectAccessInterceptor} from '../../obj/interceptors/project-access.interceptor';
import {NotFoundException} from '../../obj/exceptions';
import {CustomApiException} from '../../obj/decorators/api-exception.decorators';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectController {

  constructor(private projectService: ProjectService, private reflector: Reflector) {
  }

  /**
   * returns a list of projects. Administrators get a more detailed and unfiltered list of projects.
   *
   * Allowed user roles: <code>administrator, user</code>
   */
  @CombinedRoles(AccountRole.administrator, AccountRole.user)
  @Get('')
  async listProjects(@Req() req: InternRequest): Promise<ProjectDto[]> {
    return removeNullAttributes(await this.projectService.listProjects(req.user)).map(a => new ProjectDto(a));
  }

  /**
   * returns a project.
   *
   * Allowed user roles: <code>administrator, project_admin</code>
   */
  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator)
  @CustomApiException(new NotFoundException(`Can't find any project with this id.`))
  @UseInterceptors(ProjectAccessInterceptor)
  @Get(':project_id')
  async getProject(@Param('project_id', NumericStringValidationPipe) id: string, @Req() req: InternRequest): Promise<ProjectDto> {
    return removeNullAttributes<ProjectDto>(new ProjectDto(req.project));
  }

  /**
   * returns all roles associated to the project.
   *
   * Allowed user roles: <code>administrator, project_admin</code>
   */
  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator)
  @CustomApiException(new NotFoundException(`Can't find any project with this id.`))
  @UseInterceptors(ProjectAccessInterceptor)
  @Get(':project_id/roles')
  async getProjectRoles(@Param('project_id', NumericStringValidationPipe) id: string, @Req() req: InternRequest): Promise<AccountRoleProjectEntity[]> {
    const allowedProjectRoles = this.reflector.get<AccountRole[]>(ROLES_KEY, this.getProjectRoles);
    return removeNullAttributes(await this.projectService.getProjectRoles(id, req, allowedProjectRoles));
  }

  /**
   * assigns roles for an account to a specific project.
   *
   * Allowed user roles: <code>administrator, project_admin</code>
   */
  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator)
  @UseInterceptors(ProjectAccessInterceptor)
  @CustomApiException(new NotFoundException(`Can't find any project with this id.`))
  @ApiBody({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        required: ['account_id', 'role'],
        properties: {
          account_id: {
            type: 'string',
            description: 'the account id'
          },
          role: {
            type: 'string',
            enum: ['user', 'project_admin', 'transcriber']
          },
          valid_startdate: {
            type: 'string',
            description: 'the start date (ISO 8601)'
          },
          valid_enddate: {
            type: 'date-time',
            description: 'the end date (ISO 8601)'
          },
        }
      }
    }
  })
  @Post(':project_id/roles')
  async assignProjectRoles(@Param('project_id', NumericStringValidationPipe) id: string, @Body() dto: ProjectAssignRoleDto[]): Promise<void> {
    return removeNullAttributes(await this.projectService.assignProjectRoles(id, dto));
  }

  /**
   * creates a new project.
   *
   * Allowed user roles: <code>administrator, project_admin</code>
   */
  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator)
  @UseInterceptors(ProjectAccessInterceptor)
  @Post('')
  async createProject(@Body() dto: ProjectRequestDto): Promise<ProjectDto> {
    return removeNullAttributes(new ProjectDto(await this.projectService.createProject(dto)));
  }

  /**
   * changes a specific project.
   *
   * Allowed user roles: <code>administrator, project_admin</code>
   */
  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator)
  @UseInterceptors(ProjectAccessInterceptor)
  @CustomApiException(new NotFoundException(`Can't find any project with this id.`))
  @Put(':project_id')
  async changeProject(@Param('project_id', NumericStringValidationPipe) id: string, @Body() dto: ProjectRequestDto): Promise<ProjectDto> {
    return removeNullAttributes(new ProjectDto(await this.projectService.changeProject(id, dto)));
  }

  /**
   * removes a specific project.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @UseInterceptors(ProjectAccessInterceptor)
  @CustomApiException(new NotFoundException(`Can't find any project with this id.`))
  @Delete(':project_id')
  async removeProject(@Param('project_id', NumericStringValidationPipe) id: string, @Body() dto: ProjectRemoveRequestDto): Promise<void> {
    return this.projectService.removeProject(id, dto);
  }
}
