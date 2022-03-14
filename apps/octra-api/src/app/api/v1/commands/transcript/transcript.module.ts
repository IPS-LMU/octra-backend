import {CommandModule} from '../command.module';
import {TranscriptGetCommand} from './transcript.get.command';

export class TranscriptModule extends CommandModule {
  constructor() {
    super('/transcripts', 'Transcripts');
    this._commands = [
      new TranscriptGetCommand()
    ];
  }
}
