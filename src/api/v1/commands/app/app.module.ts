import {AppTokenCreateCommand} from './apptoken.create.command';
import {AppTokenRemoveCommand} from './apptoken.remove.command';
import {AppTokenListCommand} from './apptoken.list.command';
import {CommandModule} from '../command.module';

export class AppModule extends CommandModule {
    constructor() {
        super('/app');
        this._commands = [
            new AppTokenCreateCommand(),
            new AppTokenRemoveCommand(),
            new AppTokenListCommand()
        ];
    }
}
