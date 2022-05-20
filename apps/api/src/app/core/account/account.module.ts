import {Module} from '@nestjs/common';
import {AccountController} from './account.controller';
import {AccountService} from './account.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {DatabaseService} from '../../database.service';
import {AccountEntity, AccountPersonEntity, AccountRoleProjectEntity, RoleEntity} from '@octra/server-side';

export const ACCOUNT_ENTITIES = [AccountPersonEntity, AccountEntity, AccountRoleProjectEntity, RoleEntity];

@Module({
  imports: [TypeOrmModule.forFeature(ACCOUNT_ENTITIES)],
  controllers: [AccountController],
  providers: [AccountService, DatabaseService],
  exports: [AccountService]
})
export class AccountModule {
}
