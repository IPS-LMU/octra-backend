import {Injectable, OnApplicationShutdown} from '@nestjs/common';
import * as Path from 'path';
import {ConfigService} from '@nestjs/config';
import {FileSystemHandler} from './obj/filesystem-handler';

@Injectable()
export class ShutdownService implements OnApplicationShutdown {
  constructor(private configService: ConfigService) {
  }

  async onApplicationShutdown(signal?: string): Promise<void> {
    console.log(`\nAPI is shutting down...`);
    try {
      await FileSystemHandler.removeFolder(Path.join(this.configService.get('api.paths.uploadFolder'), 'tmp'));
      console.log(`-> Remove temporary folder OK`)
    } catch (e) {
      console.log(`ERROR: ${e}`);
    }
  }
}
