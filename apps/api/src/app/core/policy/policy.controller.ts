import {Body, Controller, Delete, Get, Param, Post, Put, Req} from '@nestjs/common';
import {ApiConsumes, ApiTags} from '@nestjs/swagger';
import {CombinedRoles} from '../../obj/decorators/combine.decorators';
import {AccountRole} from '@octra/api-types';
import {PolicyService} from './policy.service';
import {PolicyCreateRequestDto, PolicyDto} from './policy.dto';
import {removeNullAttributes} from '@octra/server-side';
import {InternRequest} from '../../obj/types';
import {FormDataRequest} from 'nestjs-form-data';
import {NumericStringValidationPipe} from '../../obj/pipes/numeric-string-validation.pipe';

@ApiTags('Policies')
@Controller('policies')
export class PolicyController {
  constructor(private policyService: PolicyService) {
  }

  /**
   * returns a list of policies
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Get('')
  async listPolicies(): Promise<PolicyDto[]> {
    const result = await this.policyService.listPolicies();
    return removeNullAttributes(result).map((a) => {
      return new PolicyDto(a);
    });
  }

  /**
   * adds a new policy.
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @FormDataRequest()
  @ApiConsumes('multipart/form-data')
  @Post('')
  async addPolicy(@Body() dto: PolicyCreateRequestDto, @Req() req: InternRequest): Promise<PolicyDto> {
    return removeNullAttributes(new PolicyDto(await this.policyService.addPolicy(dto, req)));
  }

  /**
   * updates a policy (only if there is no active user consent connected to it).
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @FormDataRequest()
  @ApiConsumes('multipart/form-data')
  @Put(':id')
  async updatePolicy(@Param('id', NumericStringValidationPipe) id: string, @Body() dto: PolicyCreateRequestDto, @Req() req: InternRequest): Promise<PolicyDto> {
    return removeNullAttributes(new PolicyDto(await this.policyService.updatePolicy(id, dto, req)));
  }

  /**
   * removes a policy (only if there is no active user consent connected to it).
   *
   * Allowed user roles: <code>administrator</code>
   */
  @CombinedRoles(AccountRole.administrator)
  @Delete(':id')
  async removePolicy(@Param('id', NumericStringValidationPipe) id: string, @Req() req: InternRequest): Promise<void> {
    return await this.policyService.removePolicy(id);
  }

}
