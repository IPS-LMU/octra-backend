import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {AccountModule} from '../account/account.module';
import {PassportModule} from '@nestjs/passport';
import {AuthController} from './auth.controller';
import {LocalStrategy} from './local.strategy';
import {JwtModule} from '@nestjs/jwt';
import {JwtStrategy} from './jwt.strategy';
import {AccountService} from '../account';
import {TypeOrmModule} from '@nestjs/typeorm';
import {DatabaseService} from '../../database.service';
import {
  AccountEntity,
  AccountPersonEntity,
  AccountRoleProjectEntity,
  Configuration,
  RoleEntity
} from '@octra/server-side';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountPersonEntity, AccountEntity, AccountRoleProjectEntity, RoleEntity]),
    AccountModule, PassportModule, JwtModule.register({
      secret: Configuration.getInstance().api.jwtSecret,
      signOptions: {expiresIn: '1 day'}, // TODO set expiration time to config.json
    })
  ],
  providers: [AccountService, AuthService, LocalStrategy, JwtStrategy, DatabaseService],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {
}
