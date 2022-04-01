import {Module} from '@nestjs/common';
import {TokensController} from './tokens.controller';

@Module({
  controllers: [TokensController],
  providers: []
})
export class AppTokensModule {
}
