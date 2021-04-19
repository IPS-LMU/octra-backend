import {CommandModule} from '../command.module';
import {MediaAddCommand} from './media.add.command';

export class MediaModule extends CommandModule {
    constructor() {
        super('/media');
        this._commands = [
            new MediaAddCommand()
        ];
    }
}
