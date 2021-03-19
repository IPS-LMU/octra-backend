import {RegisterCommand} from './commands/user/register.command';
import {LoginCommand} from './commands/user/login.command';
import {ApiCommand} from './commands/api.command';

export class APIV1Module {
    public static commands: ApiCommand[] = [
        new RegisterCommand(),
        new LoginCommand()
    ]
}
