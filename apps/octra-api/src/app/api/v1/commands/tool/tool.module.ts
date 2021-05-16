import {CommandModule} from '../command.module';
import {ToolAddCommand} from './tool.add.command';

export class ToolModule extends CommandModule {
  constructor() {
    super('/tools', 'Tools');
    this._commands = [
      new ToolAddCommand()
    ];
  }
}
