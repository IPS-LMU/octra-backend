import {Module} from '@nestjs/common';
import {AppTokenController} from './app-token.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AppTokenEntity} from './app-token.entity';
import {AppTokenService} from './app-token.service';

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
