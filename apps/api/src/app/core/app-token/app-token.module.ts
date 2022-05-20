import {Module} from '@nestjs/common';
import {AppTokenController} from './app-token.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AppTokenService} from './app-token.service';
import {AppTokenEntity} from '@octra/server-side';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppTokenEntity])
  ],
  controllers: [AppTokenController],
  providers: [AppTokenService],
  exports: [AppTokenService]
})
export class AppTokenModule {
}
