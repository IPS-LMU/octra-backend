import {Controller, Param, ParseIntPipe, Post, Req, UploadedFiles, UseInterceptors} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {TasksService} from './tasks.service';
import {CombinedRoles} from '../../../../combine.decorators';
import {AccountRole} from '@octra/octra-api-types';
import {FilesInterceptor} from '@nestjs/platform-express';
import {Express} from 'express'
import 'multer';
import {InternRequest} from '../../../obj/types';
import {AppService} from '../../../app.service';
import {ConfigService} from '@nestjs/config';
import * as Path from 'path';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('projects')
export class TasksController {

  constructor(private tasksService: TasksService,
              private appService: AppService,
              private configService: ConfigService) {
  }

  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator, AccountRole.dataDelivery)
  @UseInterceptors(FilesInterceptor('inputs', 2))
  @Post(':project_id/tasks/upload')
  async uploadTaskData(@Param('project_id', ParseIntPipe) id: number, @UploadedFiles() inputs: Array<Express.Multer.File>, @Req() req: InternRequest): Promise<void> {
    const i = inputs;
    const mediaPath = Path.join(this.configService.get('api.files.uploadPath'), 'temp');
    req.body.properties = req.body?.properties ? JSON.parse(req.body.properties) : undefined;
    req.body.transcript = req.body?.transcript ? JSON.parse(req.body.transcript) : undefined;
    const taskProperties = req.body.properties;
    const taskTranscript = req.body.transcript;
  }

}
