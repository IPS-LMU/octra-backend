import {Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put} from '@nestjs/common';
import {ProjectService} from './project.service';
import {CombinedRoles} from '../../../combine.decorators';
import {UserRole} from '@octra/octra-api-types';
import {removeNullAttributes} from '../../functions';
import {ProjectDto, ProjectRequestDto} from './project.dto';
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
  @CombinedRoles(UserRole.administrator)
  @Get('')
  async listProjects(): Promise<ProjectDto[]> {
    return removeNullAttributes(await this.projectService.listProjects()).map(a => new ProjectDto(a));
  }

  /**
   * creates a new project.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(UserRole.administrator)
  @Post('')
  async createProject(@Body() dto: ProjectRequestDto): Promise<ProjectDto> {
    return removeNullAttributes(new ProjectDto(await this.projectService.createProject(dto)));
  }

  /**
   * changes a specific project.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(UserRole.administrator)
  @Put(':id')
  async changeProject(@Param('id', ParseIntPipe) id: number, @Body() dto: ProjectRequestDto): Promise<ProjectDto> {
    return removeNullAttributes(new ProjectDto(await this.projectService.changeProject(id, dto)));
  }

  /**
   * removes a specific project.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(UserRole.administrator)
  @Delete(':id')
  async removeProject(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.projectService.removeProject(id);
  }
}
