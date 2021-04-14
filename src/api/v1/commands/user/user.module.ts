import {CommandModule} from '../command.module';
import {UserPasswordChangeCommand} from './user.password.change.command';
import {UserListCommand} from './user.list.command';
import {UserAssignRolesCommand} from './user.assign.roles.command';
import {UserLoginCommand} from './user.login.command';
import {UserRegisterCommand} from './user.register.command';
import {UserRemoveCommand} from './user.remove.command';
import {UserExistsHashCommand} from './user.exists-hash.command';
import {UserInfoCommand} from './user.info.command';
import {UserCurrentInfoCommand} from './user.current.info.command';

export class UserModule extends CommandModule {
    constructor() {
        super('/users');
        this._commands = [
            new UserLoginCommand(),
            new UserRegisterCommand(),
            new UserExistsHashCommand(),
            new UserCurrentInfoCommand(),
            new UserPasswordChangeCommand(),
            new UserListCommand(),
            new UserInfoCommand(),
            new UserAssignRolesCommand(),
            new UserRemoveCommand()
        ];
    }
}
