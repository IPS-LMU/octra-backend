import {CommandModule} from '../command.module';
import {TranscriptAddCommand} from './transcript.add.command';
import {TranscriptGetCommand} from './transcript.get.command';

export class TranscriptModule extends CommandModule {
    constructor() {
        super('/transcripts');
        this._commands = [
            new TranscriptGetCommand(),
            new TranscriptAddCommand()
        ];
    }
}
