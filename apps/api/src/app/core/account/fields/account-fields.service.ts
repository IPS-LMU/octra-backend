import {Injectable} from '@nestjs/common';
import {FindManyOptions, Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import {ConfigService} from '@nestjs/config';
import {AccountFieldDefinitionEntity, AccountFieldValueEntity} from '@octra/server-side';
import {DatabaseService} from '../../../database.service';
import {AccountFieldDefinitionCreateDto} from './account-fields.dto';

@Injectable()
export class AccountFieldsService {
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
}
