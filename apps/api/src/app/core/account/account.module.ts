import {Module} from '@nestjs/common';
import {AccountController} from './account.controller';
import {AccountService} from './account.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AccountEntity, AccountPersonEntity} from './entities/account.entity';
import {AccountRoleProjectEntity, RoleEntity} from './entities/account-role-project.entity';
import {DatabaseService} from "../../database.service";

export const ACCOUNT_ENTITIES = [AccountPersonEntity, AccountEntity, AccountRoleProjectEntity, RoleEntity];

@Module({
  imports: [TypeOrmModule.forFeature(ACCOUNT_ENTITIES)],
  controllers: [AccountController],
  providers: [AccountService, DatabaseService],
  exports: [AccountService]
})
export class AccountModule {
}
