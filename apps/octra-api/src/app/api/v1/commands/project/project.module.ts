import {CommandModule} from '../command.module';
import {ProjectCreateCommand} from './project.create.command';
import {ProjectTranscriptsGetCommand} from './project.transcripts.get.command';
import {AnnotationStartCommand} from './annotation/annotation.start.command';
import {AnnotationContinueCommand} from './annotation/annotation.continue.command';
import {AnnotationFreeCommand} from './annotation/annotation.free.command';
import {AnnotationSaveCommand} from './annotation/annotation.save.command';
import {ProjectListCommand} from './project.list.command';
import {ProjectRemoveCommand} from './project.remove.command';
import {ProjectGetCommand} from './project.get.command';
import {ProjectChangeCommand} from './project.change.command';

export class ProjectModule extends CommandModule {
  constructor() {
    super('/projects', 'Projects');
    this._commands = [
      new ProjectTranscriptsGetCommand(),
      new ProjectCreateCommand(),
      new ProjectRemoveCommand(),
      new ProjectGetCommand(),
      new ProjectChangeCommand(),
      new ProjectListCommand(),
      new AnnotationStartCommand(),
      new AnnotationSaveCommand(),
      new AnnotationFreeCommand(),
      new AnnotationContinueCommand()
    ];
  }
}
