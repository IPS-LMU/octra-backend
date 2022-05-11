import {Injectable, MethodNotAllowedException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {FileProjectEntity, ProjectEntity} from './project.entity';
import {ProjectAssignRolesRequestDto, ProjectRemoveRequestDto, ProjectRequestDto} from './project.dto';
import {AccountRoleProjectEntity, RoleEntity} from '../account/entities/account-role-project.entity';
import {TaskEntity, TaskInputOutputEntity} from './task.entity';
import {AppService} from '../../app.service';
import {FileSystemHandler} from '../../obj/filesystem-handler';
import {DatabaseService} from '../../database.service';
import {CurrentUser, InternRequest} from "../../obj/types";
import {AccountRole} from "@octra/octra-api-types";
import {Reflector} from '@nestjs/core';

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

  public async getProject(id: string, allowedProjectRoles: string[], req: InternRequest): Promise<ProjectEntity> {
    const project = await this.projectRepository.findOne({
      id
    });

    if (!this.isProjectAccessAllowed(project, undefined, req.user, allowedProjectRoles)) {
      throw new MethodNotAllowedException();
    }
    return project;
  }

  public async getProjectRoles(id: string): Promise<AccountRoleProjectEntity[]> {
    return (await this.projectRepository.findOne({
      id
    }, {
      relations: ['roles']
    })).roles;
  }

  public async assignProjectRoles(id: string, roles: ProjectAssignRolesRequestDto[]): Promise<void> {
    return this.databaseService.transaction<void>(async (manager) => {
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

  public async changeProject(id: string, dto: ProjectRequestDto): Promise<ProjectEntity> {
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
        const items = await manager.find(TaskEntity, {
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

  private isProjectAccessAllowed(project: ProjectEntity, task: TaskEntity, user: CurrentUser, allowedProjectRoles: string[]) {
    const generalRole = user.roles.find(a => a.scope === "general");

    if (allowedProjectRoles.length > 0 && generalRole.role !== AccountRole.administrator) {
      const userProjectRole = user.roles.find(a => a.project_id?.toString() === project.id);
      // check project role
      if (userProjectRole) {
        if (userProjectRole.role !== AccountRole.projectAdministrator) {
          if (userProjectRole.role === AccountRole.user) {
            if (allowedProjectRoles.find(a => a === AccountRole.user)) {
              if (task?.worker_id !== user.userId) {
                return false;
              }
            }
          }
        }
      } else {
        // user doesn't have an user role, assume "user"
        if (allowedProjectRoles.find(a => a === AccountRole.user)) {
          if (task?.worker_id && task?.worker_id !== user.userId) {
            return false;
          }
        }
      }
    }
    return true;
  }
}
