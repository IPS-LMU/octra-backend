import {Body, Controller, Param, ParseIntPipe, Post, Req} from '@nestjs/common';
import {ApiBearerAuth, ApiConsumes, ApiTags} from '@nestjs/swagger';
import {TasksService} from './tasks.service';
import {CombinedRoles} from '../../../../combine.decorators';
import {AccountRole} from '@octra/octra-api-types';
import {InternRequest} from '../../../obj/types';
import {AppService} from '../../../app.service';
import {ConfigService} from '@nestjs/config';
import {TaskUploadDto} from './task.dto';
import {FormDataRequest} from 'nestjs-form-data';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('projects')
export class TasksController {

  constructor(private tasksService: TasksService,
              private appService: AppService,
              private configService: ConfigService) {
  }

  @CombinedRoles(AccountRole.administrator, AccountRole.projectAdministrator, AccountRole.dataDelivery)
  @FormDataRequest()
  @ApiConsumes('multipart/form-data')
  @Post(':project_id/tasks/upload')
  async uploadTaskData(@Param('project_id', ParseIntPipe) id: number, @Req() req: InternRequest, @Body() body: TaskUploadDto): Promise<any> {
    const p = body;
    return this.tasksService.uploadTaskData(body, req);
  }
}
