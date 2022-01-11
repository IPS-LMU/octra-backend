import {CommandModule} from '../command.module';
import {MediaAddCommand} from './media.add.command';

export class MediaModule extends CommandModule {
  constructor() {
    super('/media', 'Media');
    this._commands = [
      new MediaAddCommand()
    ];
  }
}
