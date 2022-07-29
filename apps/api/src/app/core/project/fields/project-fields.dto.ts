import {OmitType} from '@nestjs/swagger';
import {AccountFieldDefinitionDto} from '../../fields/account-fields.dto';

export class ProjectFieldDefinitionDto extends OmitType(AccountFieldDefinitionDto, ['removable']) {
}
