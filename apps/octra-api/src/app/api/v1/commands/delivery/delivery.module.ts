import {CommandModule} from '../command.module';
import {DeliveryMediaAddCommand} from './delivery.media.add.command';
import {DeliveryMediaUploadCommand} from './delivery.media.upload.command';

export class DeliveryModule extends CommandModule {
  constructor() {
    super('/delivery', 'Delivery');
    this._commands = [
      new DeliveryMediaAddCommand(),
      new DeliveryMediaUploadCommand()
    ];
  }
}
