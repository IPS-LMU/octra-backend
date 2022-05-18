import {Body, Controller, Delete, Param, Post} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {ToolCreateRequestDto, ToolDto} from './tool.dto';
import {CombinedRoles} from '../../obj/decorators/combine.decorators';
import {AccountRole} from '@octra/api-types';
import {removeNullAttributes} from '../../../../../../libs/server-side/src/lib/functions';
import {ToolService} from './tool.service';
import {NumericStringValidationPipe} from "../../obj/pipes/numeric-string-validation.pipe";

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
  async removeTool(@Param('id', NumericStringValidationPipe) id: number): Promise<void> {
    await this.toolService.removeTool(id);
    return;
  }
}
