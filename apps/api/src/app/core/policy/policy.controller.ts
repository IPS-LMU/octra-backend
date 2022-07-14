import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  Res
} from '@nestjs/common';
import {ApiConsumes, ApiTags} from '@nestjs/swagger';
import {CombinedRoles} from '../../obj/decorators/combine.decorators';
import {AccountRole, PolicyType} from '@octra/api-types';
import {PolicyService} from './policy.service';
import {
  PolicyCreateRequestDto,
  PolicyCreateTranslationDto,
  PolicyDto,
  PolicyTranslationDto,
  PolicyTranslationViewDto
} from './policy.dto';
import {PolicyEntity, PolicyTranslationEntity, removeNullAttributes} from '@octra/server-side';
import {InternRequest} from '../../obj/types';
import {FormDataRequest} from 'nestjs-form-data';
import {NumericStringValidationPipe} from '../../obj/pipes/numeric-string-validation.pipe';
import {Public} from '../authorization/public.decorator';
import {NotFoundException} from '../../obj/exceptions';
import {Response} from 'express';
import {AppService} from '../../app.service';
import * as fs from 'fs-extra';
import {createReadStream} from 'fs';
import * as Path from 'path';
import {ConfigService} from '@nestjs/config';

@ApiTags('Policies')
@Controller('policies')
export class PolicyController {
  constructor(private policyService: PolicyService, private appService: AppService,
              private configService: ConfigService) {
  }

  /**
   * returns a list of policies
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Get('')
  async listPolicies(): Promise<PolicyDto[]> {
    let result: any = await this.policyService.listPolicies();
    result = removeNullAttributes(result);
    result = result.map((a) => new PolicyDto(a));
    return result;
  }

  /**
   * returns a list of policy translations
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Get(':policy_id/translations')
  async listPolicyTranslations(@Param('policy_id', ParseIntPipe) policy_id: number): Promise<PolicyTranslationDto[]> {
    const policy = await this.policyService.getPolicyByID(policy_id);
    return removeNullAttributes(policy).translations.map((a) => {
      if (a.url) {
        a.url = a.url ? this.appService.pathBuilder.getPublicPolicyURL(policy.type, policy.version, a.language) : undefined;
      }
      return new PolicyTranslationDto({
        ...a,
      });
    });
  }

  /**
   * adds a new policy.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Post('')
  async addPolicy(@Body() dto: PolicyCreateRequestDto, @Req() req: InternRequest): Promise<PolicyDto> {
    const result = new PolicyDto(await this.policyService.addPolicy(dto, req))
    return removeNullAttributes(result);
  }

  /**
   * adds a new policy translation.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @FormDataRequest()
  @ApiConsumes('multipart/form-data')
  @Post(':policy_id/translations')
  async addPolicyTranslation(@Param('policy_id', ParseIntPipe) policy_id: number, @Body() dto: PolicyCreateTranslationDto, @Req() req: InternRequest): Promise<PolicyTranslationDto> {
    const translation = await this.policyService.addPolicyTranslation(dto, policy_id, req);

    if (!translation.policy) {
      throw new NotFoundException(`Policy not found`)
    }

    const result = new PolicyTranslationDto(translation);
    if (this.appService.pathBuilder.isLocalPath(translation.url)) {
      result.url = translation.url ? this.appService.pathBuilder.getPublicPolicyURL(translation.policy.type, translation.policy.version, translation.language) : undefined;
    }
    return removeNullAttributes(result);
  }

  /**
   * updates a policy.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Put(':id')
  async updatePolicy(@Param('id', NumericStringValidationPipe) id: string, @Body() dto: PolicyCreateRequestDto, @Req() req: InternRequest): Promise<PolicyDto> {
    const result = new PolicyDto(await this.policyService.updatePolicy(id, dto, req));
    return removeNullAttributes(result);
  }

  /**
   * updates a policy translation.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @FormDataRequest()
  @ApiConsumes('multipart/form-data')
  @Put(':policy_id/translations/:translation_id')
  async updatePolicyTranslation(@Param('policy_id', ParseIntPipe) policy_id: number, @Param('translation_id', ParseIntPipe) translation_id: number, @Body() dto: PolicyCreateTranslationDto, @Req() req: InternRequest): Promise<PolicyTranslationDto> {
    const translation = await this.policyService.updatePolicyTranslation(policy_id, translation_id, dto, req);

    if (translation) {
      const result = new PolicyTranslationDto(translation);
      result.url = result.url ? this.appService.pathBuilder.getPublicPolicyURL(translation.policy.type, translation.policy.version, result.language) : undefined;
      return removeNullAttributes(result);
    }
    throw new InternalServerErrorException(`Can't update policy translation`);
  }

  /**
   * removes a policy (only if there is no active user consent connected to it).
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Delete(':id')
  async removePolicy(@Param('id', ParseIntPipe) id: number, @Req() req: InternRequest): Promise<void> {
    return await this.policyService.removePolicy(id);
  }

  /**
   * removes a policy translation.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Delete(':policy_id/translations/:translation_id')
  async removePolicyTranslation(@Param('policy_id', ParseIntPipe) policy_id: number, @Param('translation_id', ParseIntPipe) translation_id: number, @Req() req: InternRequest): Promise<void> {
    return await this.policyService.removePolicyTranslation(policy_id, translation_id);
  }

  /**
   * renders the latest policy of a given type.
   *
   */
  @Public()
  @Get('latest/:policy_name/:language')
  async renderLatestPolicy(@Param('policy_name') policy_name: string, @Param('language') language: string, @Res() res: Response) {
    let policy_type: PolicyType;
    let name: string;
    const index = policy_name.indexOf('.');

    if (index > -1) {
      name = policy_name.substring(0, index);
    } else {
      name = policy_name;
    }

    switch (name) {
      case 'privacy_statement':
        policy_type = PolicyType.privacy;
        break;
      case 'terms_and_conditions':
        policy_type = PolicyType.terms_and_conditions;
        break;
    }

    if (!policy_type) {
      throw new NotFoundException(`Policy not found.`);
    }

    const translation = await this.policyService.getLatestPolicyOfType(policy_type, language);

    await this.viewPolicy(translation.policy, translation, res);
  }

  /**
   * returns a policy by a given ID.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Get(':policy_id/translations/:translation_id')
  async renderPolicyByID(@Param('policy_id', NumericStringValidationPipe) policy_id: number, @Param('translation_id', NumericStringValidationPipe) translation_id: number, @Res() res: Response) {
    const policy = await this.policyService.getPolicyByID(policy_id);
    await this.viewPolicy(policy, policy.translations.find(a => a.id === translation_id), res);
  }

  async viewPolicy(policy: Partial<PolicyEntity>, policyTranslation: Partial<PolicyTranslationEntity>, res: Response) {
    if (!policyTranslation) {
      throw new NotFoundException(`Policy not found.`);
    }

    if (policyTranslation.url && policyTranslation.url.trim() !== '') {
      if (/https?:\/\//g.exec(policyTranslation.url)) {
        // extern url
        res.redirect(policyTranslation.url);
        return;
      }
      const path = this.appService.pathBuilder.readPathFromDB(policyTranslation.url);
      if (await fs.pathExists(path)) {
        // return file
        const ext = Path.parse(path).ext;
        if (ext === '.pdf') {
          res.setHeader('content-type', 'application/pdf');
        }
        if (ext === '.html') {
          res.setHeader('content-type', 'text/html');
        }
        if (ext === '.txt') {
          res.setHeader('content-type', 'text/plain');
        }
        const file = createReadStream(path);
        return file.pipe(res);
      }
    } else {
      // it's text
      res.setHeader('content-type', 'text/html');
      res.render('policy', {
        title: policy.type,
        text: policyTranslation.text,
        baseURL: this.configService.get('api.baseURL'),
        translations: policy.translations,
        currentLang: policyTranslation.language
      });
    }
  }


  /**
   * renders a preview of an unsaved policy
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Post('preview')
  async renderPolicyPreview(@Body() policy: PolicyTranslationViewDto, @Res() res: Response) {
    await this.viewPolicy(policy, policy, res);
  }
}
