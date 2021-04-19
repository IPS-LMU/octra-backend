import {CommandModule} from '../command.module';
import {ProjectCreateCommand} from './project.create.command';
import {ProjectTranscriptsGetCommand} from './project.transcripts.get.command';

export class ProjectModule extends CommandModule {
    constructor() {
        super('/projects');
        this._commands = [
            new ProjectTranscriptsGetCommand(),
            new ProjectCreateCommand()
        ];
    }
}
