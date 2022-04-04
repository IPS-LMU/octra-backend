import {Module} from '@nestjs/common';
import {TokensController} from './tokens.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AppToken} from './app-tokens.entity';
import {AppTokensService} from './app-tokens.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppToken])
  ],
  controllers: [TokensController],
  providers: [AppTokensService],
  exports: [AppTokensService]
})
export class AppTokensModule {
}
