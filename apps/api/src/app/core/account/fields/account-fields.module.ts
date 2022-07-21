import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AccountFieldDefinitionEntity, AccountFieldValueEntity} from '@octra/server-side';
import {AccountFieldsController} from './account-fields.controller';
import {AccountFieldsService} from './account-fields.service';
import {DatabaseService} from '../../../database.service';

export const ACCOUNT_FIELD_ENTITIES = [AccountFieldDefinitionEntity, AccountFieldValueEntity];

@Module({
  imports: [TypeOrmModule.forFeature(ACCOUNT_FIELD_ENTITIES)],
  controllers: [AccountFieldsController],
  providers: [AccountFieldsService, DatabaseService],
  exports: [AccountFieldsService]
})
export class AccountFieldsModule {
}
