import {CommandModule} from '../command.module';
import {DeliveryMediaAddCommand} from './delivery.media.add.command';

export class DeliveryModule extends CommandModule {
    constructor() {
        super('/delivery');
        this._commands = [
            new DeliveryMediaAddCommand()
        ];
    }
}
