import {AppModule} from './commands/app/app.module';
import {CommandModule} from './commands/command.module';
import {UserModule} from './commands/user/user.module';
import {ProjectModule} from './commands/project/project.module';
import {ToolModule} from './commands/tool/tool.module';
import {TranscriptModule} from './commands/transcript/transcript.module';
import {FilesModule} from './commands/files/file.module';

export class APIV1Module {
  public static modules: CommandModule[] = [
    new UserModule(),
    new AppModule(),
    new FilesModule(),
    new ProjectModule(),
    new ToolModule(),
    new TranscriptModule()
  ];
}
