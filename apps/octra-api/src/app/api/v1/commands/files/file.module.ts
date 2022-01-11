import {CommandModule} from '../command.module';
import {FileUploadCommand} from './file.upload.command';
import {FileGetCommand} from './file.get.command';

export class FilesModule extends CommandModule {
  constructor() {
    super('/files', 'Files');
    this._commands = [
      new FileUploadCommand(),
      new FileGetCommand()
    ];
  }
}
