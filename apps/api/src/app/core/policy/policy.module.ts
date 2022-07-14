import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Configuration, PolicyAccountConsentEntity, PolicyEntity, PolicyTranslationEntity} from '@octra/server-side';
import {PolicyController} from './policy.controller';
import {PolicyService} from './policy.service';
import {NestjsFormDataModule} from 'nestjs-form-data';
import {FileHashStorage} from '../../obj/file-hash-storage';
import * as path from 'path';
import {getConfigPath} from '../../functions';

export const POLICY_ENTITIES = [PolicyEntity, PolicyAccountConsentEntity, PolicyTranslationEntity];
const config = Configuration.getInstance(
  getConfigPath()
);

@Module({
  imports: [TypeOrmModule.forFeature(POLICY_ENTITIES),
    NestjsFormDataModule.config({
      storage: FileHashStorage,
      fileSystemStoragePath: path.join(config.api.paths.uploadFolder, 'tmp')
    })],
  controllers: [PolicyController],
  providers: [PolicyService],
  exports: [PolicyService]
})
export class PolicyModule {
}
