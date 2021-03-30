import {AppModule} from './commands/app/app.module';
import {CommandModule} from './commands/command.module';
import {UserModule} from './commands/user/user.module';
import {MediaModule} from './commands/media/media.module';
import {DeliveryModule} from './commands/delivery/delivery.module';
import {ProjectModule} from './commands/project/project.module';
import {ToolModule} from './commands/tool/tool.module';
import {TranscriptModule} from './commands/transcript/transcript.module';

export class APIV1Module {

    // TODO fix problem: commands request cascades

    public static modules: CommandModule[] = [
        new UserModule(),
        new AppModule(),
        new MediaModule(),
        new DeliveryModule(),
        new ProjectModule(),
        new ToolModule(),
        new TranscriptModule()
    ];
}
