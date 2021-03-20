import {RegisterCommand} from './commands/user/register.command';
import {LoginCommand} from './commands/user/login.command';
import {ApiCommand} from './commands/api.command';
import {AppTokenAddCommand} from './commands/app/apptoken.add.command';
import {AppTokenRemoveCommand} from './commands/app/apptoken.remove.command';

export class APIV1Module {
    public static commands: ApiCommand[] = [
        new AppTokenAddCommand(),
        new AppTokenRemoveCommand(),
        new RegisterCommand(),
        new LoginCommand()
    ]
}
