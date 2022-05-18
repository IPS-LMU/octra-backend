import {MiddlewareConsumer, Module} from '@nestjs/common';
import {AppService} from './app.service';
import {Configuration} from './config/configuration';
import {LoggerMiddleware} from './obj/logger.middleware';
import {DatabaseService} from './database.service';

const config = Configuration.getInstance();

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
