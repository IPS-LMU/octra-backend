import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AccountFieldDefinitionEntity, AccountFieldValueEntity} from '@octra/server-side';
import {DatabaseService} from '../../../database.service';
import {ProjectFieldsController} from './project-fields.controller';
import {AccountFieldManagementService} from '../../fields';

export const ACCOUNT_FIELD_ENTITIES = [AccountFieldDefinitionEntity, AccountFieldValueEntity];

@Module({
  imports: [TypeOrmModule.forFeature(ACCOUNT_FIELD_ENTITIES)],
  controllers: [ProjectFieldsController],
  providers: [AccountFieldManagementService, DatabaseService],
  exports: []
})
export class ProjectFieldsModule {
}
