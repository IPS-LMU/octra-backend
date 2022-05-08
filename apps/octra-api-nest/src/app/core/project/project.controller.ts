import {Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put} from '@nestjs/common';
import {ProjectService} from './project.service';
import {CombinedRoles} from '../../obj/decorators/combine.decorators';
import {AccountRole} from '@octra/octra-api-types';
import {removeNullAttributes} from '../../functions';
import {ProjectAssignRolesRequestDto, ProjectDto, ProjectRemoveRequestDto, ProjectRequestDto} from './project.dto';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectController {

  constructor(private projectService: ProjectService) {
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

  @CombinedRoles(AccountRole.administrator)
  @Get(':id')
  async getProject(@Param('id', ParseIntPipe) id: string): Promise<ProjectDto> {
    return removeNullAttributes<ProjectDto>(new ProjectDto(await this.projectService.getProject(id)));
  }

  @CombinedRoles(AccountRole.administrator)
  @Get(':id/roles')
  async getProjectRoles(@Param('id', ParseIntPipe) id: string): Promise<any> {
    return removeNullAttributes(await this.projectService.getProjectRoles(id));
  }

  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator)
  @Post(':id/roles')
  async assignProjectRoles(@Param('id', ParseIntPipe) id: string, @Body() dto: ProjectAssignRolesRequestDto[]): Promise<void> {
    return removeNullAttributes(await this.projectService.assignProjectRoles(id, dto));
  }

  /**
   * creates a new project.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Post('')
  async createProject(@Body() dto: ProjectRequestDto): Promise<ProjectDto> {
    return removeNullAttributes(new ProjectDto(await this.projectService.createProject(dto)));
  }

  /**
   * changes a specific project.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Put(':id')
  async changeProject(@Param('id', ParseIntPipe) id: string, @Body() dto: ProjectRequestDto): Promise<ProjectDto> {
    return removeNullAttributes(new ProjectDto(await this.projectService.changeProject(id, dto)));
  }

  /**
   * removes a specific project.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Delete(':id')
  async removeProject(@Param('id', ParseIntPipe) id: string, @Body() dto: ProjectRemoveRequestDto): Promise<void> {
    return this.projectService.removeProject(id, dto);
  }
}
