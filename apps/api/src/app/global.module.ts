import {MiddlewareConsumer, Module} from '@nestjs/common';
import {AppService} from './app.service';
import {LoggerMiddleware} from './obj/logger.middleware';
import {DatabaseService} from './database.service';
import {Configuration} from "@octra/server-side";
import {environment} from "../environments/environment";
import {dirname} from "path";

const config = Configuration.getInstance(
  (environment.production) ? dirname(process.execPath) : __dirname
);

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
