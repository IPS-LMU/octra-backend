import {OmitType} from '@nestjs/swagger';
import {AccountFieldDefinitionDto} from '../../account/fields/account-fields.dto';

export class ProjectFieldDefinitionDto extends OmitType(AccountFieldDefinitionDto, ['removable']) {
}
