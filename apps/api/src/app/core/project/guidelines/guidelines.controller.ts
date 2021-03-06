import {Body, Controller, Get, Param, Put, UseInterceptors} from '@nestjs/common';
import {AccountRole} from '@octra/api-types';
import {ApiBearerAuth, ApiBody, ApiTags} from '@nestjs/swagger';
import {GuidelinesDto} from './guidelines.dto';
import {GuidelinesService} from './guidelines.service';
import {CombinedRoles} from '../../../obj/decorators/combine.decorators';
import {NumericStringValidationPipe} from '../../../obj/pipes/numeric-string-validation.pipe';
import {ProjectAccessInterceptor} from '../../../obj/interceptors/project-access.interceptor';

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
  @UseInterceptors(ProjectAccessInterceptor)
  @ApiBody({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        required: ['language', 'json'],
        properties: {
          language: {
            type: 'string'
          },
          json: {
            type: 'object'
          }
        }
      }
    }
  })
  @Put(':project_id/guidelines')
  async saveGuidelines(@Param('project_id', NumericStringValidationPipe) id: string, @Body() dtos: GuidelinesDto[]): Promise<void> {
    return this.guidelinesService.saveGuidelines(id, dtos);
  }

  /**
   * Changes the guidelines for a specific project.
   *
   *
   * Allowed user roles: <code>administrator, project_admin, transcriber, user</code>
   */
  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator, AccountRole.transcriber, AccountRole.user)
  @UseInterceptors(ProjectAccessInterceptor)
  @Get(':project_id/guidelines')
  async getGuidelines(@Param('project_id', NumericStringValidationPipe) id: string): Promise<GuidelinesDto[]> {
    return this.guidelinesService.getGuidelines(id);
  }
}
