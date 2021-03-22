import {RegisterCommand} from './commands/user/register.command';
import {LoginCommand} from './commands/user/login.command';
import {ApiCommand} from './commands/api.command';
import {AppTokenCreateCommand} from './commands/app/apptoken.create.command';
import {AppTokenRemoveCommand} from './commands/app/apptoken.remove.command';
import {AppTokenListCommand} from './commands/app/apptoken.list.command';

export class APIV1Module {
    public static commands: ApiCommand[] = [
        new AppTokenCreateCommand(),
        new AppTokenRemoveCommand(),
        new AppTokenListCommand(),
        new RegisterCommand(),
        new LoginCommand()
    ]
}
