import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {Connection, Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import {Account, AccountPerson} from './entities/account.entity';
import {AccountRoleProject, Role} from './entities/account-role-project.entity';
import {AssignRoleDto, AssignRoleProjectDto, AssignUserRoleDto, ChangePasswordDto} from './account.dto';
import {UserRoleScope} from '@octra/octra-api-types';
import {removeNullAttributes} from '../../functions';
import {SHA256} from 'crypto-js';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(AccountPerson)
    private accountPersonRepository: Repository<AccountPerson>,
    @InjectRepository(AccountRoleProject)
    private accountRoleProjectRepository: Repository<AccountRoleProject>,
    private connection: Connection,
    private configService: ConfigService
  ) {
  }

  async findAccountByName(username: string): Promise<Account | undefined> {
    const t = await this.accountRepository.find({
      where: {
        account_person: {
          username
        }
      },
      relations: ['account_person']
    });
    return t[0];
  }

  async findAccountByHash(hash: string): Promise<Account | undefined> {
    const t = await this.accountRepository.find({
      where: {
        account_person: {
          hash
        }
      },
      relations: ['account_person']
    });
    return (t.length > 0) ? t[0] : undefined;
  }

  async findAccountByID(id: number): Promise<Account | undefined> {
    const t = await this.accountRepository.find({
      id
    });
    return (t.length > 0) ? t[0] : undefined;
  }

  async getAll(): Promise<Account[]> {
    return await this.accountRepository.find();
  }

  async getUser(id: number): Promise<Account> {
    return await this.accountRepository.findOne({
      id
    });
  }

  async assignUserRoles(id: number, roleDto: AssignRoleDto): Promise<AssignRoleDto> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let projectIDs;

    try {
      const roles = await queryRunner.manager.find<Role>(Role);

      // save global user role if exists
      if (roleDto.general) {
        const newRole = roles.find(a => a.scope === UserRoleScope.general && a.label === roleDto.general).id;
        const t = await queryRunner.manager.update<Account>(Account, {
          id
        }, {
          role_id: newRole
        })
        const t1 = '';
      }

      // remove
      projectIDs = roleDto.projects.map(a => a.project_id)
        .filter((item, index, arr) =>
          (item !== undefined && item !== null) && arr.indexOf(item) === index);

      // remove all roles from each project
      for (const project_id of projectIDs) {
        await queryRunner.manager.delete(AccountRoleProject, {
          account_id: id,
          project_id
        });
      }

      // add project roles
      for (const project of roleDto.projects) {
        for (const role of project.roles) {
          await queryRunner.manager.insert(AccountRoleProject, new AccountRoleProject({
            account_id: id,
            role_id: roles.find(a => a.scope === UserRoleScope.project && a.label === role.role).id,
            project_id: project.project_id,
            valid_startdate: role.valid_startdate,
            valid_enddate: role.valid_enddate
          }));
        }
      }

      await queryRunner.commitTransaction();

      const account = await this.accountRepository.findOne({
        id
      });
      projectIDs = account.roles.map(a => a.project_id)
        .filter((item, index, arr) =>
          (item !== undefined && item !== null) && arr.indexOf(item) === index);

      return new AssignRoleDto({
        general: account.generalRole.label,
        projects: removeNullAttributes(projectIDs.map(a => new AssignRoleProjectDto({
          project_id: a,
          roles: account.roles.filter(b => b.project_id === a).map(b => new AssignUserRoleDto(b))
        })))
      });
    } catch (err) {
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto): Promise<void> {
    const account = await this.accountRepository.findOne({
      id
    });

    if (account) {
      if (account.account_person.hash === this.getPasswordHash(changePasswordDto.oldPassword)) {
        // change
        await this.accountPersonRepository.update({
          id: account.account_person.id
        }, {
          hash: this.getPasswordHash(changePasswordDto.newPassword)
        });
      } else {
        // error
        throw new HttpException('Incorrect old password.', HttpStatus.UNAUTHORIZED);
      }
    } else {
      throw new HttpException('Can\'t find account with this id', HttpStatus.NOT_FOUND);
    }
  }

  private getPasswordHash(password: string): string {
    let salt = this.configService.get('api.passwordSalt');
    salt = SHA256(salt).toString();
    return SHA256(password + salt).toString();
  }
}
