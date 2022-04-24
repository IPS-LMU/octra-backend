import {Body, Controller, Param, ParseIntPipe, Post, Req, UploadedFiles, UseInterceptors} from '@nestjs/common';
import {ApiBearerAuth, ApiConsumes, ApiTags} from '@nestjs/swagger';
import {TasksService} from './tasks.service';
import {CombinedRoles} from '../../../../combine.decorators';
import {AccountRole} from '@octra/octra-api-types';
import {FilesInterceptor} from '@nestjs/platform-express';
import 'multer';
import {InternRequest} from '../../../obj/types';
import {AppService} from '../../../app.service';
import {ConfigService} from '@nestjs/config';
import {MulterHashedFile, MulterStorageHashing} from '../../../obj/multer-storage-hashing';
import {TaskUploadDto} from './task.dto';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('projects')
export class TasksController {

  constructor(private tasksService: TasksService,
              private appService: AppService,
              private configService: ConfigService) {
  }

  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator, AccountRole.dataDelivery)
  @UseInterceptors(FilesInterceptor('inputs', 1, {
    storage: new MulterStorageHashing({})
  }))
  @ApiConsumes('multipart/form-data')
  @Post(':project_id/tasks/upload')
  async uploadTaskData(@Param('project_id', ParseIntPipe) id: number, @UploadedFiles() inputs: Array<MulterHashedFile>, @Req() req: InternRequest, @Body() body: TaskUploadDto): Promise<any> {
    const p = body;
    return this.tasksService.uploadTaskData(inputs, req);
  }


}
