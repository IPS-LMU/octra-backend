import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {ProjectAssignRolesRequestDto, ProjectRemoveRequestDto, ProjectRequestDto} from './project.dto';
import {AppService} from '../../app.service';
import {FileSystemHandler} from '../../obj/filesystem-handler';
import {DatabaseService} from '../../database.service';
import {CurrentUser} from '../../obj/types';
import {Reflector} from '@nestjs/core';
import {checkIfProjectAccessAllowed} from '../../functions';
import {
  AccountRoleProjectEntity,
  FileProjectEntity,
  ProjectEntity,
  RoleEntity,
  TaskEntity,
  TaskInputOutputEntity
} from '@octra/server-side';

@Injectable()
export class ProjectService {
  constructor(@InjectRepository(ProjectEntity)
              private projectRepository: Repository<ProjectEntity>,
              private databaseService: DatabaseService,
              private appService: AppService,
              private reflector: Reflector) {
  }

  public async listProjects(): Promise<ProjectEntity[]> {
    return this.projectRepository.find();
  }

  public async getProject(id: string): Promise<ProjectEntity> {
    const project = await this.projectRepository.findOneBy({
      id
    });
    return project;
  }

  public async getProjectRoles(id: string, user: CurrentUser, allowedProjectRoles: string[]): Promise<AccountRoleProjectEntity[]> {
    const project = await this.projectRepository.findOne({
      where: {id},
      relations: ['roles']
    });

    checkIfProjectAccessAllowed(project, undefined, user, allowedProjectRoles);

    return project?.roles;
  }

  public async assignProjectRoles(id: string, roles: ProjectAssignRolesRequestDto[], user: CurrentUser, allowedProjectRoles: string[]): Promise<void> {
    return this.databaseService.transaction<void>(async (manager) => {
      const project = await manager.findOne(ProjectEntity, {
        where: {
          id
        },
        relations: ['roles']
      });

      checkIfProjectAccessAllowed(project, undefined, user, allowedProjectRoles);

      const roleRows = await manager.find<RoleEntity>(RoleEntity);

      for (const role of roles) {
        const foundRole = await manager.findOne(AccountRoleProjectEntity, {
          where: {
            account_id: role.account_id,
            project_id: id
          }
        });

        await manager.save(AccountRoleProjectEntity, {
          id: foundRole?.id,
          project_id: id,
          role_id: roleRows.find(a => a.label === role.role)?.id,
          account_id: role.account_id
        });
      }
    });
  }

  public async createProject(dto: ProjectRequestDto): Promise<ProjectEntity> {
    const project = await this.projectRepository.save<ProjectEntity>(dto as ProjectEntity);
    const absolutePath = this.appService.pathBuilder.getAbsoluteProjectPath(project.id);
    await FileSystemHandler.createDirIfNotExists(absolutePath);
    return project;
  }

  public async changeProject(id: string, dto: ProjectRequestDto, user: CurrentUser, allowedProjectRoles: string[]): Promise<ProjectEntity> {
    const project = await this.projectRepository.findOneBy({
      id
    });

    checkIfProjectAccessAllowed(project, undefined, user, allowedProjectRoles);

    return this.projectRepository.save({
      id,
      ...dto
    });
  }

  public async removeProject(id: string, dto: ProjectRemoveRequestDto): Promise<void> {
    // TODO check this algorithm
    return this.databaseService.transaction<void>(async (manager) => {
      if (dto.cutAllReferences) {
        await manager.update(TaskEntity, {
          where: {
            project_id: id
          }
        }, {
          project_id: null
        });
      } else {
        // remove all references to tasks of this project
        const items = await manager.findBy(TaskEntity, {
          project_id: id
        });
        for (const item of items) {
          await manager.update(TaskEntity, {
            nexttask_id: item.id
          }, {
            nexttask_id: null
          });
          // remove all task_inputs_outputs of this project
          await manager.delete(TaskInputOutputEntity, {
            task_id: item.id
          });
        }

        const test = await manager.delete(TaskEntity, {
          project_id: id
        });
        const t = '';
      }
      await manager.delete(FileProjectEntity, {
        project_id: id
      });

      await manager.delete(AccountRoleProjectEntity, {
        project_id: id
      });
      await manager.delete(ProjectEntity, {
        id
      });

      if (dto.removeProjectFiles) {
        const folderPath = this.appService.pathBuilder.getAbsoluteProjectPath(id);
        await FileSystemHandler.removeFolder(folderPath);
      }
    });
  }
}
