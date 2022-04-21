import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {AccountModule} from '../account/account.module';
import {PassportModule} from '@nestjs/passport';
import {AuthController} from './auth.controller';
import {LocalStrategy} from './local.strategy';
import {JwtModule} from '@nestjs/jwt';
import {jwtConstants} from './auth.constants';
import {JwtStrategy} from './jwt.strategy';
import {AccountService} from '../account';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AccountEntity, AccountPersonEntity} from '../account/entities/account.entity';
import {AccountRoleProjectEntity, RoleEntity} from '../account/entities/account-role-project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountPersonEntity, AccountEntity, AccountRoleProjectEntity, RoleEntity]),
    AccountModule, PassportModule, JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: {expiresIn: '60s'},
    })
  ],
  providers: [AccountService, AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {
}
