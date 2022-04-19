import {Module} from '@nestjs/common';
import {AccountController} from './account.controller';
import {AccountService} from './account.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AccountEntity, AccountPersonEntity} from './entities/account.entity';
import {AccountRoleProjectEntity, RoleEntity} from './entities/account-role-project.entity';

export const ACCOUNT_ENTITIES = [AccountPersonEntity, AccountEntity, AccountRoleProjectEntity, RoleEntity];

@Module({
  imports: [TypeOrmModule.forFeature(ACCOUNT_ENTITIES)],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService]
})
export class AccountModule {
}
