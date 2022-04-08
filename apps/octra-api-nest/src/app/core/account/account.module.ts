import {Module} from '@nestjs/common';
import {AccountController} from './account.controller';
import {AccountService} from './account.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Account, AccountPerson} from './entities/account.entity';
import {AccountRoleProject, Role} from './entities/account-role-project.entity';

export const ACCOUNT_ENTITIES = [AccountPerson, Account, AccountRoleProject, Role];

@Module({
  imports: [TypeOrmModule.forFeature(ACCOUNT_ENTITIES)],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService]
})
export class AccountModule {
}
