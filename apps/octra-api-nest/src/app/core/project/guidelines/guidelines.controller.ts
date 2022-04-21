import {Body, Controller, Get, Param, ParseIntPipe, Put} from '@nestjs/common';
import {AccountRole} from '@octra/octra-api-types';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {GuidelinesDto} from './guidelines.dto';
import {GuidelinesService} from './guidelines.service';
import {CombinedRoles} from '../../../../combine.decorators';

@ApiTags('Guidelines')
@ApiBearerAuth()
@Controller('projects')
export class GuidelinesController {

  constructor(private guidelinesService: GuidelinesService) {
  }

  /**
   * Changes the guidelines for a specific project.
   *
   *
   * Allowed user roles: <code>administrator, project_admin</code>
   */
  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator)
  @Put(':id/guidelines')
  async saveGuidelines(@Param('id', ParseIntPipe) id: number, @Body() dtos: GuidelinesDto[]): Promise<void> {
    return this.guidelinesService.saveGuidelines(id, dtos);
  }

  /**
   * Changes the guidelines for a specific project.
   *
   *
   * Allowed user roles: <code>administrator, project_admin, transcriber</code>
   */
  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator, AccountRole.transcriber)
  @Get(':id/guidelines')
  async getGuidelines(@Param('id', ParseIntPipe) id: number): Promise<GuidelinesDto[]> {
    return this.guidelinesService.getGuidelines(id);
  }
}
