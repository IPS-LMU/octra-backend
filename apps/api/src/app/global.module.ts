import {Global, MiddlewareConsumer, Module} from '@nestjs/common';
import {AppService} from './app.service';
import {LoggerMiddleware} from './obj/logger.middleware';
import {DatabaseService} from './database.service';
import {Configuration} from '@octra/server-side';
import {getConfigPath} from './functions';

console.log('load config in global.module');
const config = Configuration.getInstance(
  getConfigPath()
);

@Global()
@Module({
  imports: [],
  providers: [
    AppService,
    DatabaseService
  ],
  exports: [AppService, DatabaseService]
})
export class GlobalModule {
  configure(consumer: MiddlewareConsumer) {
    if (config.api.debugging) {
      consumer
        .apply(LoggerMiddleware)
        .forRoutes('*');
    }
  }
}
