import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {ProjectEntity} from './project.entity';
import {ProjectRequestDto} from './project.dto';

@Injectable()
export class ProjectService {
  constructor(@InjectRepository(ProjectEntity)
              private projectRepository: Repository<ProjectEntity>) {
  }

  public async listProjects(): Promise<ProjectEntity[]> {
    return this.projectRepository.find();
  }

  public async createProject(dto: ProjectRequestDto): Promise<ProjectEntity> {
    return this.projectRepository.save(dto);
  }

  public async changeProject(id: number, dto: ProjectRequestDto): Promise<ProjectEntity> {
    return this.projectRepository.save({
      id,
      ...dto
    });
  }

  public async removeProject(id: number): Promise<void> {
    await this.projectRepository.delete({
      id
    });
  }
}
