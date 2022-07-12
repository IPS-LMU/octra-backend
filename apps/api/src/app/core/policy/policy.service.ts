import {HttpException, HttpStatus, Injectable, MethodNotAllowedException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {PolicyAccountConsentEntity, PolicyEntity} from '@octra/server-side';
import {PolicyCreateRequestDto} from './policy.dto';
import {DatabaseService} from '../../database.service';
import {InternRequest} from '../../obj/types';
import {FileHashStorage} from '../../obj/file-hash-storage';
import * as fs from 'fs-extra';
import {unlink} from 'fs-extra';
import {AppService} from '../../app.service';
import {FileSystemHandler} from '../../obj/filesystem-handler';
import * as Path from 'path';
import {NotFoundException} from '../../obj/exceptions';

@Injectable()
export class PolicyService {
  constructor(@InjectRepository(PolicyEntity)
              private policyRepository: Repository<PolicyEntity>,
              @InjectRepository(PolicyAccountConsentEntity)
              private policyAccountConsentRepository: Repository<PolicyAccountConsentEntity>,
              private databaseService: DatabaseService,
              private appService: AppService) {
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

  async addPolicy(dto: PolicyCreateRequestDto, req: InternRequest): Promise<PolicyEntity> {
    return this.createUpdatePolicy(dto, req);
  }

  async removePolicy(policy_id: string) {
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
      if (entry.url && /^\{policies}\//g.exec(entry.url)) {
        // it's a file
        await fs.unlink(this.appService.pathBuilder.readPathFromDB(entry.url));
      }
      await manager.delete(PolicyEntity, {
        id: policy_id
      });
    });
  }

  async updatePolicy(policy_id: string, dto: PolicyCreateRequestDto, req: InternRequest) {
    const oneConsent = await this.policyAccountConsentRepository.findOneBy({
      policy_id
    });
    if (oneConsent) {
      throw new MethodNotAllowedException(`You are not allowed to update this policy because there is at least one user consent connected to this entry.`);
    }
    return this.createUpdatePolicy(dto, req, policy_id);
  }

  private async createUpdatePolicy(dto: PolicyCreateRequestDto, req: InternRequest, policy_id?: string) {
    return this.databaseService.transaction<PolicyEntity>(async (manager) => {
      const inputs = dto.inputs;

      if (inputs?.length < 1 && dto.text?.trim() === '' && !policy_id) {
        await this.removeTempFiles(inputs);
        throw new HttpException('You have to either upload an file or set text.', HttpStatus.BAD_REQUEST);
      }

      const lastPolicy = await manager.createQueryBuilder(PolicyEntity, 'policy')
        .where('policy.type = :type', {type: dto.type})
        .orderBy('version', 'DESC', 'NULLS LAST')
        .getOne();

      const version = lastPolicy ? lastPolicy.version + 1 : 1;

      const policiesFolder = this.appService.pathBuilder.getPoliciesFolderPath();
      await FileSystemHandler.createDirIfNotExists(policiesFolder);

      let url;

      if (inputs?.length > 0) {
        const newFileName = this.appService.pathBuilder.getNewPolicyFileName(dto.type, version, Path.parse(inputs[0].originalName).ext);
        await FileSystemHandler.moveFile(inputs[0].path, Path.join(this.appService.pathBuilder.getPoliciesFolderPath(), newFileName));
        url = Path.join(this.appService.pathBuilder.getPoliciesFolderDBPath(), newFileName);
      }

      let id: number;
      const partial = {
        ...dto,
        url: (!dto.text) ? url : undefined,
        text: dto.text,
        version,
        author_id: req.user.userId
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
