import {Injectable} from '@nestjs/common';
import {FindManyOptions, Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import {ConfigService} from '@nestjs/config';
import {AccountFieldDefinitionEntity, AccountFieldValueEntity} from '@octra/server-side';
import {AccountFieldDefinitionCreateDto} from './account-fields.dto';
import {AccountFieldContext} from '@octra/api-types';
import {DatabaseService} from '../../database.service';
import {BadRequestException} from '../../obj/exceptions';

@Injectable()
export class AccountFieldManagementService {
  constructor(
    @InjectRepository(AccountFieldDefinitionEntity)
    private accountFieldDefinitionRepository: Repository<AccountFieldDefinitionEntity>,
    private databaseService: DatabaseService,
    private configService: ConfigService
  ) {
  }

  async createOrSaveFieldDefinition(dto: AccountFieldDefinitionCreateDto, field_id?: string) {
    return this.databaseService.transaction<AccountFieldDefinitionEntity>(async (manager) => {
      if (field_id) {
        await manager.update(AccountFieldDefinitionEntity, {id: field_id}, dto);
      } else {
        const result = await manager.insert(AccountFieldDefinitionEntity, dto);
        field_id = result.identifiers[0].id
      }
      return manager.findOneBy(AccountFieldDefinitionEntity, {
        id: field_id
      });
    });
  }

  async getFieldDefinition(id: string) {
    return this.accountFieldDefinitionRepository.findOneBy({id});
  }

  async listFieldDefinitions(options?: FindManyOptions<AccountFieldDefinitionEntity>) {
    return this.accountFieldDefinitionRepository.find(options);
  }

  async removeFieldDefinition(id: string) {
    return this.databaseService.transaction<void>(async (manager) => {
      const definition = await manager.findOneBy(AccountFieldDefinitionEntity, {id});
      if (definition?.removable) {
        // remove all values for this definition
        await manager.delete(AccountFieldValueEntity, {
          definition_id: id
        });
        // remove the definition
        await manager.delete(AccountFieldDefinitionEntity, {id});
      }
    });
  }

  async saveAccountFieldValuesForUser(userId: string, values: any): Promise<void> {
    return this.databaseService.transaction<void>(async (manager) => {
      const keys = Object.keys(values);
      const accountFieldDefinitions = await manager.find(AccountFieldDefinitionEntity, {
        where: {
          context: AccountFieldContext.account
        },
        order: {
          sort_order: {
            direction: 'asc'
          },
          name: {
            direction: 'asc'
          }
        }
      });

      for (const key of keys) {
        const value = values[key];
        const definitionId = accountFieldDefinitions.find(a => a.name === key)?.id;

        if (!definitionId) {
          throw new BadRequestException('Invalid account field "' + key + '"');
        }

        const valueInDb = await manager.findOneBy(AccountFieldValueEntity, {
          account_field_definition_id: definitionId,
          account_id: userId
        });

        if (valueInDb) {
          await manager.update(AccountFieldValueEntity, {
            account_field_definition_id: definitionId,
            account_id: userId
          }, {
            value
          });
        } else {
          await manager.insert(AccountFieldValueEntity, {
            account_field_definition_id: definitionId,
            account_id: userId,
            value
          });
        }
      }
    });
  }
}
