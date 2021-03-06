import {Injectable} from '@nestjs/common';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import {
  AccountCreateRequestDto,
  AccountRegisterRequestDto,
  AssignAccountRoleDto,
  AssignRoleDto,
  ChangePasswordDto
} from './account.dto';
import {AccountLoginMethod, AccountRole, AccountRoleScope} from '@octra/api-types';
import {ConfigService} from '@nestjs/config';
import {DatabaseService} from '../../database.service';
import {
  AccountEntity,
  AccountPersonEntity,
  AccountRoleProjectEntity,
  getPasswordHash,
  removeNullAttributes,
  RoleEntity
} from '@octra/server-side';
import {BadRequestException, NotFoundException} from '../../obj/exceptions';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private accountRepository: Repository<AccountEntity>,
    @InjectRepository(AccountPersonEntity)
    private accountPersonRepository: Repository<AccountPersonEntity>,
    @InjectRepository(AccountRoleProjectEntity)
    private accountRoleProjectRepository: Repository<AccountRoleProjectEntity>,
    @InjectRepository(RoleEntity)
    private roleEntityRepository: Repository<RoleEntity>,
    private databaseService: DatabaseService,
    private configService: ConfigService
  ) {
  }

  async findAccountByName(username: string): Promise<AccountEntity | undefined> {
    return this.accountRepository.findOne({
      where: {
        account_person: {
          username
        }
      },
      relations: ['account_person', 'roles']
    });
  }

  async findAccountByHash(hash: string): Promise<AccountEntity | undefined> {
    return this.accountRepository.findOne({
      where: {
        account_person: {
          hash
        }
      },
      relations: ['account_person']
    });
  }

  async findAccountByID(id: string): Promise<AccountEntity | undefined> {
    return this.accountRepository.findOneBy({
      id
    });
  }

  async getAll(): Promise<AccountEntity[]> {
    return await this.accountRepository.find();
  }

  async getAccount(id: string): Promise<AccountEntity> {
    return await this.accountRepository.findOneBy({
      id
    });
  }

  async assignAccountRoles(id: string, roleDto: AssignRoleDto): Promise<AssignRoleDto> {
    let projectIDs;

    return this.databaseService.transaction<AssignRoleDto>(async (manager) => {
      let account = await manager.findOneBy(AccountEntity, {
        id
      });

      if (!account) {
        throw new NotFoundException(`Can't find any account with this id.`)
      }

      const roles = await manager.find<RoleEntity>(RoleEntity);

      // save global user role if exists
      if (roleDto.general) {
        const newRole = roles.find(a => a.scope === AccountRoleScope.general && a.label === roleDto.general).id;
      }

      // remove
      projectIDs = roleDto.projects.map(a => a.project_id)
        .filter((item, index, arr) =>
          (item !== undefined && item !== null) && arr.indexOf(item) === index);

      // remove all roles from each project
      for (const project_id of projectIDs) {
        await manager.delete(AccountRoleProjectEntity, {
          account_id: id,
          project_id
        });
      }

      // TODO better update? each insert adds new incremented number

      // add project roles
      for (const project of roleDto.projects) {
        await manager.insert(AccountRoleProjectEntity, new AccountRoleProjectEntity({
          account_id: id,
          role_id: roles.find(a => a.scope === AccountRoleScope.project && a.label === project.role).id,
          project_id: project.project_id,
          valid_startdate: project.valid_startdate ? new Date(project.valid_startdate) : undefined,
          valid_enddate: project.valid_enddate ? new Date(project.valid_enddate) : undefined
        }));
      }

      account = await manager.findOneBy(AccountEntity, {
        id
      });
      projectIDs = account.roles.map(a => a.project_id)
        .filter((item, index, arr) =>
          (item !== undefined && item !== null) && arr.indexOf(item) === index);

      return new AssignRoleDto({
        general: account.generalRole.label,
        projects: removeNullAttributes(projectIDs.map((a) => {
          const accountRole: AccountRoleProjectEntity = account.roles.filter(b => b.project_id === a)[0];
          return new AssignAccountRoleDto({
            ...accountRole,
            project_id: a
          });
        }))
      });
    });
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const account = await this.accountRepository.findOneBy({
      id
    });

    if (account) {
      if (account.account_person.hash === getPasswordHash(this.configService.get('api.security.keys.password.salt'), changePasswordDto.oldPassword)) {
        // change
        await this.accountPersonRepository.update({
          id: account.account_person.id
        }, {
          hash: getPasswordHash(this.configService.get('api.security.keys.password.salt'), changePasswordDto.newPassword)
        });
      } else {
        // error
        throw new BadRequestException('Incorrect old password.');
      }
    } else {
      throw new NotFoundException('Can\'t find account with this id');
    }
  }

  async removeAccount(id: string): Promise<void> {
    return this.databaseService.transaction<void>(async (manager) => {
      const account = await manager.findOneBy(AccountEntity, {id});

      if (!account) {
        throw new NotFoundException('Can\'t find account with this id');
      }

      await manager.update(AccountEntity, {
        id
      }, {
        account_person_id: null
      });
      await manager.delete(AccountPersonEntity, {
        id: account.account_person_id
      });
    });
  }

  async createAccount(dto: AccountRegisterRequestDto | AccountCreateRequestDto, loginmethod: AccountLoginMethod = AccountLoginMethod.local): Promise<AccountEntity> {
    return this.databaseService.transaction<AccountEntity>(async (manager) => {
      const role = await manager.findOne(RoleEntity, {
        where: {
          label: (dto instanceof AccountRegisterRequestDto) ? AccountRole.user : (dto as AccountCreateRequestDto).role,
          scope: AccountRoleScope.general
        }
      });

      let insertResult = await manager.insert(AccountPersonEntity, {
        username: dto.username,
        hash: (loginmethod === AccountLoginMethod.local) ? getPasswordHash(this.configService.get('api.security.keys.password.salt'), dto.password) : dto.password,
        email: dto.email,
        gender: dto.gender,
        first_name: dto.first_name,
        last_name: dto.last_name,
        state: dto.state,
        country: dto.country,
        loginmethod
      });

      insertResult = await manager.insert(AccountEntity, {
        role_id: role.id,
        account_person_id: insertResult.identifiers[0].id,
        last_login: new Date()
      });

      return manager.findOne(AccountEntity, {
        where: {
          id: insertResult.identifiers[0].id
        },
        relations: ['account_person', 'roles']
      });
    });
  }
}
