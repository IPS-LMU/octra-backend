import {HttpException, HttpStatus, Injectable, MethodNotAllowedException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {PolicyAccountConsentEntity, PolicyEntity, PolicyTranslationEntity} from '@octra/server-side';
import {PolicyCreateRequestDto, PolicyCreateTranslationDto} from './policy.dto';
import {DatabaseService} from '../../database.service';
import {InternRequest} from '../../obj/types';
import {FileHashStorage} from '../../obj/file-hash-storage';
import * as fs from 'fs-extra';
import {unlink} from 'fs-extra';
import {AppService} from '../../app.service';
import {FileSystemHandler} from '../../obj/filesystem-handler';
import * as Path from 'path';
import {NotFoundException} from '../../obj/exceptions';
import {PolicyType} from '@octra/api-types';
import {DateTime} from 'luxon';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class PolicyService {
  constructor(@InjectRepository(PolicyEntity)
              private policyRepository: Repository<PolicyEntity>,
              @InjectRepository(PolicyAccountConsentEntity)
              private policyAccountConsentRepository: Repository<PolicyAccountConsentEntity>,
              @InjectRepository(PolicyTranslationEntity)
              private policyTranslationRepository: Repository<PolicyTranslationEntity>,
              private databaseService: DatabaseService,
              private appService: AppService,
              private configService: ConfigService) {
  }


  async listPolicies(): Promise<PolicyEntity[]> {
    return this.policyRepository.find({
      order: {
        publishdate: {
          direction: 'DESC',
          nulls: 'first'
        },
        version: 'DESC'
      }
    });
  }

  async getLatestPolicyOfType(type: PolicyType, language: string): Promise<PolicyTranslationEntity> {
    const date = DateTime.now().toUnixInteger();
    const results = await this.policyTranslationRepository.find({
      where: {
        policy: {
          type
        },
        language
      },
      relations: ['policy'],
      order: {
        policy: {
          version: 'DESC',
          publishdate: {
            direction: 'DESC',
            nulls: 'first'
          }
        }
      }
    });

    let result = results.find(a => {
      if (a.policy.publishdate) {
        const publishdate = DateTime.fromJSDate(a.policy.publishdate).toUnixInteger();
        return date >= publishdate;
      }
      return false;
    });

    if (result) {
      let type: string = result.policy.type;
      switch (type) {
        case PolicyType.privacy:
          type = 'privacy_statement';
          break;

        case PolicyType.terms_and_conditions:
          type = 'terms_and_conditions';
          break;
      }

      return {
        ...result,
        policy: {
          ...result.policy,
          translations: result.policy.translations.map(a => ({
            ...a,
            url: this.configService.get('api.url') + '/' + Path.join('policies', 'latest', type, a.language)
          }))
        }
      };
    }
    return undefined;
  }


  async getPolicyByID(id: number) {
    return this.policyRepository.findOneBy({
      id
    });
  }

  async addPolicy(dto: PolicyCreateRequestDto, req: InternRequest): Promise<PolicyEntity> {
    return this.createUpdatePolicy(dto, req);
  }

  async addPolicyTranslation(dto: PolicyCreateTranslationDto, policy_id: number, req: InternRequest): Promise<PolicyTranslationEntity> {
    return this.createUpdatePolicyTranslation(dto, policy_id, req);
  }

  async removePolicy(policy_id: number) {
    return this.databaseService.transaction(async (manager) => {
      const oneConsent = await manager.findOneBy(PolicyAccountConsentEntity, {
        policy_id
      });

      if (oneConsent) {
        throw new MethodNotAllowedException(`You are not allowed to remove this policy because there is at least one user consent connected to this entry.`);
      }

      const entry = await manager.findOneBy(PolicyEntity, {
        id: Number(policy_id)
      });

      if (!entry) {
        throw new NotFoundException(`Policy with id ${policy_id} not found.`);
      }

      for (const translation of entry.translations) {
        if (translation.url && /^\{policies}\//g.exec(translation.url)) {
          // it's a file
          await fs.unlink(this.appService.pathBuilder.readPathFromDB(translation.url));
        }

        await manager.delete(PolicyTranslationEntity, {
          id: translation.id
        });
      }

      await manager.delete(PolicyEntity, {
        id: policy_id
      });
    });
  }

  async removePolicyTranslation(policy_id: number, translation_id: number) {
    return this.databaseService.transaction(async (manager) => {
      const policy = await manager.findOneBy(PolicyEntity, {
        id: policy_id
      });

      if (!policy) {
        throw new NotFoundException(`Policy with id ${policy_id} not found.`);
      }

      const translation = await manager.findOneBy(PolicyTranslationEntity, {
        id: translation_id
      });

      if (!translation) {
        throw new NotFoundException(`Policy translation with id ${translation_id} not found.`);
      }

      if (translation.url && /^\{policies}\//g.exec(translation.url)) {
        // it's a file
        await fs.unlink(this.appService.pathBuilder.readPathFromDB(translation.url));
      }
      await manager.delete(PolicyTranslationEntity, {
        id: policy_id
      });
    });
  }

  async updatePolicy(policy_id: string, dto: PolicyCreateRequestDto, req: InternRequest) {
    return this.createUpdatePolicy(dto, req, policy_id);
  }

  async updatePolicyTranslation(policy_id: number, translation_id: number, dto: PolicyCreateTranslationDto, req: InternRequest) {
    return this.createUpdatePolicyTranslation(dto, policy_id, req, translation_id);
  }

  private async createUpdatePolicyTranslation(dto: PolicyCreateTranslationDto, policy_id: number, req: InternRequest, policy_translation_id?: number) {
    return this.databaseService.transaction<PolicyTranslationEntity>(async (manager) => {
      const inputs = dto.inputs;
      const policy = await manager.findOneBy(PolicyEntity, {
        id: policy_id
      });

      if (!policy) {
        throw new NotFoundException(`Policy not found.`);
      }

      if (inputs?.length > 0 && dto.text?.trim() === '' && !policy_translation_id) {
        await this.removeTempFiles(inputs);
        throw new HttpException('You have to either upload an file or set text.', HttpStatus.BAD_REQUEST);
      }

      const policiesFolder = this.appService.pathBuilder.getPoliciesFolderPath();
      await FileSystemHandler.createDirIfNotExists(policiesFolder);

      let url;

      if (inputs?.length > 0) {
        const newFileName = this.appService.pathBuilder.getNewPolicyFileName(policy.type, policy.version, dto.language, Path.parse(inputs[0].originalName).ext);
        await FileSystemHandler.moveFile(inputs[0].path, Path.join(this.appService.pathBuilder.getPoliciesFolderPath(), newFileName));
        url = Path.join(this.appService.pathBuilder.getPoliciesFolderDBPath(), newFileName);
      }

      let id: number;
      const partial = {
        ...dto,
        policy_id,
        url: (!dto.text) ? url : undefined,
        text: dto.text,
        author_id: req.user.userId
      };

      if (!policy_translation_id) {
        const query = await manager.insert<PolicyTranslationEntity>(PolicyTranslationEntity, partial);
        id = query.identifiers[0].id;
      } else {
        await manager.update<PolicyTranslationEntity>(PolicyTranslationEntity, {id: policy_translation_id}, partial);
        id = Number(policy_translation_id);
      }

      return manager.findOne(PolicyTranslationEntity, {
        where: {
          id
        },
        relations: ['policy']
      });
    });
  }

  private async createUpdatePolicy(dto: PolicyCreateRequestDto, req: InternRequest, policy_id?: string) {
    return this.databaseService.transaction<PolicyEntity>(async (manager) => {
      const lastPolicy = await manager.createQueryBuilder(PolicyEntity, 'policy')
        .where('policy.type = :type', {type: dto.type})
        .orderBy('version', 'DESC', 'NULLS LAST')
        .getOne();

      const version = lastPolicy ? lastPolicy.version + 1 : 1;

      const policiesFolder = this.appService.pathBuilder.getPoliciesFolderPath();
      await FileSystemHandler.createDirIfNotExists(policiesFolder);

      let id: number;
      const partial: Partial<PolicyEntity> = {
        ...dto,
        version
      };

      if (!policy_id) {
        const query = await manager.insert<PolicyEntity>(PolicyEntity, partial);
        id = query.identifiers[0].id;
      } else {
        await manager.update<PolicyEntity>(PolicyEntity, {id: policy_id}, partial);
        id = Number(policy_id);
      }

      return manager.findOneBy(PolicyEntity, {
        id
      });
    });
  }

  private async removeTempFiles(inputs: FileHashStorage[]) {
    try {
      for (const input of inputs) {
        await unlink(input.path);
      }
      return;
    } catch (e) {
      console.log(`Error: Can't remove mediaFile or JSONFile`);
    }
  }
}
