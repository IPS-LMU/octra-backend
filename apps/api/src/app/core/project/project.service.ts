import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {ProjectAssignRoleDto, ProjectRemoveRequestDto, ProjectRequestDto} from './project.dto';
import {AppService} from '../../app.service';
import {FileSystemHandler} from '../../obj/filesystem-handler';
import {DatabaseService} from '../../database.service';
import {CurrentUser, InternRequest} from '../../obj/types';
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
import {AccountRole, ProjectVisibility} from '@octra/api-types';

@Injectable()
export class ProjectService {
  constructor(@InjectRepository(ProjectEntity)
              private projectRepository: Repository<ProjectEntity>,
              @InjectRepository(TaskEntity)
              private taskRepository: Repository<TaskEntity>,
              private databaseService: DatabaseService,
              private appService: AppService,
              private reflector: Reflector) {
  }

  public async listProjects(user: CurrentUser): Promise<ProjectEntity[]> {
    if (user.roles.find(a => a.role === AccountRole.administrator)) {
      return this.projectRepository.find({relations: ['roles', 'roles.account']});
    }

    let projects = await this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.roles', 'roles')
      .leftJoinAndSelect('roles.role', 'role')
      .where('project.visibility =:visibility', {
        visibility: ProjectVisibility.public
      })
      .orWhere('roles.account_id =:user_id', {
        user_id: user.userId
      })
      .getMany();

    return projects.filter((a) => {
      const now = new Date().getTime();
      const startdate = a.startdate ?? 0;
      const enddate = a.enddate ?? now + 10000;

      return (startdate <= now && now <= enddate);
    });
  }

  public async getProject(id: string): Promise<ProjectEntity> {
    return this.projectRepository.findOne({
      where: {id},
      relations: ['roles']
    });
  }

  public async getProjectRoles(id: string, req: InternRequest, allowedProjectRoles: string[]): Promise<AccountRoleProjectEntity[]> {
    checkIfProjectAccessAllowed(req.project, undefined, req.user, allowedProjectRoles);

    return req.project?.roles;
  }

  public async assignProjectRoles(id: string, roles: ProjectAssignRoleDto[]): Promise<void> {
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
    await this.projectRepository.update({id}, dto);
    return this.projectRepository.findOneBy({id});
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

  public async getTask(project_id: string, task_id: string): Promise<TaskEntity> {
    return this.taskRepository.findOne({
      where: {
        id: task_id,
        project_id
      },
      relations: ['inputsOutputs', 'inputsOutputs.file_project', 'inputsOutputs.file_project.file']
    });
  }
}
