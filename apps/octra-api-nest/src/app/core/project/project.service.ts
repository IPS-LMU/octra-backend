import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Connection, Repository} from 'typeorm';
import {ProjectEntity} from './project.entity';
import {ProjectAssignRolesRequestDto, ProjectRemoveRequestDto, ProjectRequestDto} from './project.dto';
import {AccountRoleProjectEntity, RoleEntity} from '../account/entities/account-role-project.entity';
import {TaskEntity} from './task.entity';
import {AppService} from '../../app.service';
import {FileSystemHandler} from '../../obj/filesystem-handler';

@Injectable()
export class ProjectService {
  constructor(@InjectRepository(ProjectEntity)
              private projectRepository: Repository<ProjectEntity>,
              private connection: Connection,
              private appService: AppService) {
  }

  public async listProjects(): Promise<ProjectEntity[]> {
    return this.projectRepository.find();
  }

  public async getProject(id: number): Promise<ProjectEntity> {
    return this.projectRepository.findOne({
      id
    });
  }

  public async getProjectRoles(id: number): Promise<AccountRoleProjectEntity[]> {
    return (await this.projectRepository.findOne({
      id
    }, {
      relations: ['roles']
    })).roles;
  }

  public async assignProjectRoles(id: number, roles: ProjectAssignRolesRequestDto[]): Promise<void> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const roleRows = await queryRunner.manager.find<RoleEntity>(RoleEntity);

      for (const role of roles) {
        const foundRole = await queryRunner.manager.findOne(AccountRoleProjectEntity, {
          where: {
            account_id: role.accountID,
            project_id: id
          }
        });

        await queryRunner.manager.save(AccountRoleProjectEntity, {
          id: foundRole?.id,
          project_id: id,
          role_id: roleRows.find(a => a.label === role.role)?.id,
          account_id: role.accountID
        });
      }
    } catch (e) {
      await queryRunner.rollbackTransaction();
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }

  public async createProject(dto: ProjectRequestDto): Promise<ProjectEntity> {
    const project = await this.projectRepository.save<ProjectEntity>(dto as ProjectEntity);
    const absolutePath = this.appService.pathBuilder.getAbsoluteProjectPath(project.id);
    await FileSystemHandler.createDirIfNotExists(absolutePath);
    return project;
  }

  public async changeProject(id: number, dto: ProjectRequestDto): Promise<ProjectEntity> {
    return this.projectRepository.save({
      id,
      ...dto
    });
  }

  public async removeProject(id: number, dto: ProjectRemoveRequestDto): Promise<void> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // TODO check this algorithm
    // TODO add file_project algorithm
    try {
      if (dto.cutAllReferences) {
        await queryRunner.manager.update(TaskEntity, {
          where: {
            project_id: id
          }
        }, {
          project_id: null
        });
      } else {
        await queryRunner.manager.delete(TaskEntity, {
          project_id: id
        });
      }

      await queryRunner.manager.delete(AccountRoleProjectEntity, {
        project_id: id
      });
      await queryRunner.manager.delete(ProjectEntity, {
        id
      });

      if (dto.removeProjectFiles) {
        const folderPath = this.appService.pathBuilder.getAbsoluteProjectPath(id);
        await FileSystemHandler.removeFolder(folderPath);
      }
    } catch (e) {
      await queryRunner.rollbackTransaction();
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }
}
