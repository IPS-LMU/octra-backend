import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Connection, Repository} from 'typeorm';
import {AppService} from '../../app.service';
import {ToolEntity} from './tool.entity';
import {ToolCreateRequestDto} from './tool.dto';

@Injectable()
export class ToolService {
  constructor(@InjectRepository(ToolEntity)
              private toolRepository: Repository<ToolEntity>,
              private connection: Connection,
              private appService: AppService) {
  }

  async addTool(dto: ToolCreateRequestDto): Promise<ToolEntity> {
    return this.toolRepository.save(dto);
  }

  async removeTool(id: number): Promise<void> {
    await this.toolRepository.delete(id);
    return;
  }
}
