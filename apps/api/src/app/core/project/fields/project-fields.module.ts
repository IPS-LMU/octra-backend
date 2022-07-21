import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AccountFieldDefinitionEntity, AccountFieldValueEntity} from '@octra/server-side';
import {DatabaseService} from '../../../database.service';
import {AccountFieldsService} from '../../account/fields';
import {ProjectFieldsController} from './project-fields.controller';

export const ACCOUNT_FIELD_ENTITIES = [AccountFieldDefinitionEntity, AccountFieldValueEntity];

@Module({
  imports: [TypeOrmModule.forFeature(ACCOUNT_FIELD_ENTITIES)],
  controllers: [ProjectFieldsController],
  providers: [AccountFieldsService, DatabaseService],
  exports: []
})
export class ProjectFieldsModule {
}
