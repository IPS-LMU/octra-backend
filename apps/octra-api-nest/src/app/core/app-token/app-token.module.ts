import {Module} from '@nestjs/common';
import {AppTokenController} from './app-token.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AppToken} from './app-token.entity';
import {AppTokenService} from './app-token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppToken])
  ],
  controllers: [AppTokenController],
  providers: [AppTokenService],
  exports: [AppTokenService]
})
export class AppTokenModule {
}
