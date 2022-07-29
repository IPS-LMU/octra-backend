import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AccountFieldDefinitionEntity, AccountFieldValueEntity} from '@octra/server-side';
import {AccountFieldManagementController} from './account-field-management.controller';
import {AccountFieldManagementService} from './account-field-management.service';
import {DatabaseService} from '../../database.service';

export const ACCOUNT_FIELD_MANAGMENT_ENTITIES = [AccountFieldDefinitionEntity, AccountFieldValueEntity];

@Module({
  imports: [TypeOrmModule.forFeature(ACCOUNT_FIELD_MANAGMENT_ENTITIES)],
  controllers: [AccountFieldManagementController],
  providers: [AccountFieldManagementService, DatabaseService],
  exports: [AccountFieldManagementService]
})
export class FieldsManagmentModule {
}
