import {Body, Controller, Delete, Param, ParseIntPipe, Post} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {ToolCreateRequestDto, ToolDto} from './tool.dto';
import {CombinedRoles} from '../../obj/decorators/combine.decorators';
import {AccountRole} from '@octra/octra-api-types';
import {removeNullAttributes} from '../../functions';
import {ToolService} from './tool.service';

@ApiTags('Tools')
@Controller('tool')
export class ToolController {
  constructor(private toolService: ToolService) {
  }

  @CombinedRoles(AccountRole.administrator)
  @Post('')
  async addTool(@Body() dto: ToolCreateRequestDto): Promise<ToolDto> {
    return removeNullAttributes(new ToolDto(await this.toolService.addTool(dto)));
  }

  @CombinedRoles(AccountRole.administrator)
  @Delete(':id')
  async removeTool(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.toolService.removeTool(id);
    return;
  }
}
