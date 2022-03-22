import {CommandModule} from '../command.module';
import {ProjectCreateCommand} from './project.create.command';
import {TranscriptsGetCommand} from './transcripts/transcripts.get.command';
import {AnnotationStartCommand} from './annotation/annotation.start.command';
import {AnnotationContinueCommand} from './annotation/annotation.continue.command';
import {AnnotationFreeCommand} from './annotation/annotation.free.command';
import {AnnotationSaveCommand} from './annotation/annotation.save.command';
import {ProjectListCommand} from './project.list.command';
import {ProjectRemoveCommand} from './project.remove.command';
import {ProjectGetCommand} from './project.get.command';
import {ProjectChangeCommand} from './project.change.command';
import {GuidelinesGetCommand} from './guidelines/guidelines.get.command';
import {GuidelinesSaveCommand} from './guidelines/guidelines.save.command';
import {TranscriptUploadCommand} from './transcripts/transcript.upload.command';
import {ProjectTranscriptGetCommand} from './transcripts/transcript.get.command';
import {ProjectTranscriptsChangeStatusCommand} from './transcripts/transcript.change.status.command';
import {ProjectAssignUserRolesCommand} from './project.roles.command';

export class ProjectModule extends CommandModule {
  constructor() {
    super('/projects', 'Projects');
    this._commands = [
      new TranscriptsGetCommand(),
      new ProjectCreateCommand(),
      new ProjectRemoveCommand(),
      new ProjectGetCommand(),
      new ProjectChangeCommand(),
      new ProjectListCommand(),
      new ProjectAssignUserRolesCommand(),
      new AnnotationStartCommand(),
      new AnnotationSaveCommand(),
      new AnnotationFreeCommand(),
      new AnnotationContinueCommand(),
      new GuidelinesSaveCommand(),
      new GuidelinesGetCommand(),
      new TranscriptUploadCommand(),
      new ProjectTranscriptsChangeStatusCommand(),
      new ProjectTranscriptGetCommand()
    ];
  }
}
