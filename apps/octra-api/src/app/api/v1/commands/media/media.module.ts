import {CommandModule} from '../command.module';
import {MediaAddCommand} from './media.add.command';
import {MediaUploadCommand} from './media.upload.command';

export class MediaModule extends CommandModule {
  constructor() {
    super('/media', 'Media');
    this._commands = [
      new MediaAddCommand(),
      new MediaUploadCommand()
    ];
  }
}
