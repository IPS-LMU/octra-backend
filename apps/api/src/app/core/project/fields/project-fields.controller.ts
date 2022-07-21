import {Controller, Get, Param} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {AccountRole} from '@octra/api-types';
import {CombinedRoles} from '../../../obj/decorators/combine.decorators';
import {NumericStringValidationPipe} from '../../../obj/pipes/numeric-string-validation.pipe';
import {AccountFieldsService} from '../../account/fields';
import {ProjectFieldDefinitionDto} from './project-fields.dto';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectFieldsController {
  constructor(private accountFieldsService: AccountFieldsService) {
  }

  /**
   * returns a field definition.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator)
  @Get(':project_id/:field_id')
  async getProjectAccountFieldDefinition(@Param('project_id', NumericStringValidationPipe) project_id: string, @Param('field_id', NumericStringValidationPipe) field_id: string): Promise<ProjectFieldDefinitionDto> {
    return new ProjectFieldDefinitionDto(await this.accountFieldsService.getFieldDefinition(field_id));
  }
}
