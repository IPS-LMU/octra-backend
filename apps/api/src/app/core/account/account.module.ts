import {Module} from '@nestjs/common';
import {AccountController} from './account.controller';
import {AccountService} from './account.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {DatabaseService} from '../../database.service';
import {
  AccountEntity,
  AccountFieldDefinitionEntity,
  AccountFieldValueEntity,
  AccountPersonEntity,
  AccountRoleProjectEntity,
  RoleEntity
} from '@octra/server-side';
import {AccountFieldManagementService} from '../fields';

export const ACCOUNT_ENTITIES = [AccountPersonEntity, AccountEntity, AccountRoleProjectEntity, RoleEntity, AccountFieldValueEntity, AccountFieldDefinitionEntity];

@Module({
  imports: [TypeOrmModule.forFeature(ACCOUNT_ENTITIES)],
  controllers: [AccountController],
  providers: [AccountService, DatabaseService, AccountFieldManagementService],
  exports: [AccountService]
})
export class AccountModule {
}
