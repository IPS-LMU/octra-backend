import {UserRegisterCommand} from './commands/user/user.register.command';
import {UserLoginCommand} from './commands/user/user.login.command';
import {ApiCommand} from './commands/api.command';
import {AppTokenCreateCommand} from './commands/app/apptoken.create.command';
import {AppTokenRemoveCommand} from './commands/app/apptoken.remove.command';
import {AppTokenListCommand} from './commands/app/apptoken.list.command';
import {UserListCommand} from './commands/user/user.list.command';
import {UserRemoveCommand} from './commands/user/user.remove.command';
import {ProjectCreateCommand} from './commands/project/project.create.command';
import {MediaAddCommand} from './commands/media/media.add.command';
import {ToolAddCommand} from './commands/tool/tool.add.command';
import {TranscriptAddCommand} from './commands/transcript/transcript.add.command';
import {UserAssignRolesCommand} from './commands/user/user.assign.roles.command';
import {DeliveryMediaAddCommand} from './commands/delivery/delivery.media.add.command';

export class APIV1Module {
    public static commands: ApiCommand[] = [
        new AppTokenCreateCommand(),
        new AppTokenRemoveCommand(),
        new AppTokenListCommand(),
        new UserRegisterCommand(),
        new UserLoginCommand(),
        new UserListCommand(),
        new UserRemoveCommand(),
        new ProjectCreateCommand(),
        new MediaAddCommand(),
        new ToolAddCommand(),
        new TranscriptAddCommand(),
        new UserAssignRolesCommand(),
        new DeliveryMediaAddCommand()
    ]
}
