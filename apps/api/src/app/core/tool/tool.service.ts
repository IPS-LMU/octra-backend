import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {ToolCreateRequestDto} from './tool.dto';
import {ToolEntity} from '@octra/server-side';

@Injectable()
export class ToolService {
  constructor(@InjectRepository(ToolEntity)
              private toolRepository: Repository<ToolEntity>) {
  }

  async addTool(dto: ToolCreateRequestDto): Promise<ToolEntity> {
    return this.toolRepository.save(dto);
  }

  async removeTool(id: number): Promise<void> {
    await this.toolRepository.delete(id);
    return;
  }
}
