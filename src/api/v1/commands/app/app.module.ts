import {AppTokenCreateCommand} from './apptoken.create.command';
import {AppTokenRemoveCommand} from './apptoken.remove.command';
import {AppTokenListCommand} from './apptoken.list.command';
import {CommandModule} from '../command.module';
import {AppTokenChangeCommand} from './apptoken.change.command';
import {AppTokenRefreshCommand} from './apptoken.refresh.command';

export class AppModule extends CommandModule {
    constructor() {
        super('/app');
        this._commands = [
            new AppTokenCreateCommand(),
            new AppTokenRemoveCommand(),
            new AppTokenChangeCommand(),
            new AppTokenRefreshCommand(),
            new AppTokenListCommand()
        ];
    }
}
