export * from './AccountCreateRequestDto';
export * from './AccountDto';
export * from './AccountEntity';
export * from './AccountFieldDefinitionCreateDto';
export * from './AccountFieldDefinitionDto';
export * from './AccountPersonEntity';
export * from './AccountRegisterRequestDto';
export * from './AccountRoleProjectEntity';
export * from './AppTokenChangeDto';
export * from './AppTokenCreateDto';
export * from './AppTokenDto';
export * from './AssignAccountRoleDto';
export * from './AssignAccountRoles404Response';
export * from './AssignProjectRolesRequestInner';
export * from './AssignRoleDto';
export * from './AudioDurationDto';
export * from './ChangeMyPassword400Response';
export * from './ChangePasswordDto';
export * from './ChangeTaskData404Response';
export * from './FileProjectEntity';
export * from './GeneralSettingsDto';
export * from './GetProject404Response';
export * from './GuidelinesDto';
export * from './LanguageURLMapping';
export * from './ListAppTokens401Response';
export * from './ListAppTokens403Response';
export * from './Login401Response';
export * from './LoginRequest';
export * from './LoginRequestOneOf';
export * from './LoginRequestOneOf1';
export * from './LoginRequestOneOf2';
export * from './PolicyCreateRequestDto';
export * from './PolicyCreateTranslationDto';
export * from './PolicyDto';
export * from './PolicyTranslationDto';
export * from './PolicyTranslationViewDto';
export * from './ProjectDto';
export * from './ProjectEntity';
export * from './ProjectFieldDefinitionDto';
export * from './ProjectRemoveRequestDto';
export * from './ProjectRequestDto';
export * from './ProjectRoleDto';
export * from './Properties';
export * from './RoleEntity';
export * from './SaveAnnotationDto';
export * from './SaveGuidelinesRequestInner';
export * from './TaskChangeDto';
export * from './TaskChangeDtoProperties';
export * from './TaskDto';
export * from './TaskEntity';
export * from './TaskInputOutputDto';
export * from './TaskInputOutputEntity';
export * from './TaskProperties';
export * from './TaskPropertiesMedia';
export * from './TaskUploadDto';
export * from './TaskUploadMediaDto';
export * from './ToolCreateRequestDto';
export * from './ToolDto';
export * from './ToolEntity';

import {
  AccountCreateRequestDto,
  AccountCreateRequestDtoGenderEnum,
  AccountCreateRequestDtoRoleEnum
} from './AccountCreateRequestDto';
import {AccountDto, AccountDtoGeneralRoleEnum, AccountDtoLoginmethodEnum} from './AccountDto';
import {AccountEntity} from './AccountEntity';
import {
  AccountFieldDefinitionCreateDto,
  AccountFieldDefinitionCreateDtoContextEnum,
  AccountFieldDefinitionCreateDtoTypeEnum
} from './AccountFieldDefinitionCreateDto';
import {
  AccountFieldDefinitionDto,
  AccountFieldDefinitionDtoContextEnum,
  AccountFieldDefinitionDtoTypeEnum
} from './AccountFieldDefinitionDto';
import {AccountPersonEntity, AccountPersonEntityGenderEnum} from './AccountPersonEntity';
import {AccountRegisterRequestDto, AccountRegisterRequestDtoGenderEnum} from './AccountRegisterRequestDto';
import {AccountRoleProjectEntity} from './AccountRoleProjectEntity';
import {AppTokenChangeDto} from './AppTokenChangeDto';
import {AppTokenCreateDto} from './AppTokenCreateDto';
import {AppTokenDto} from './AppTokenDto';
import {AssignAccountRoleDto, AssignAccountRoleDtoRoleEnum} from './AssignAccountRoleDto';
import {AssignAccountRoles404Response} from './AssignAccountRoles404Response';
import {AssignProjectRolesRequestInner, AssignProjectRolesRequestInnerRoleEnum} from './AssignProjectRolesRequestInner';
import {AssignRoleDto, AssignRoleDtoGeneralEnum} from './AssignRoleDto';
import {AudioDurationDto} from './AudioDurationDto';
import {ChangeMyPassword400Response} from './ChangeMyPassword400Response';
import {ChangePasswordDto} from './ChangePasswordDto';
import {ChangeTaskData404Response} from './ChangeTaskData404Response';
import {FileProjectEntity} from './FileProjectEntity';
import {GeneralSettingsDto} from './GeneralSettingsDto';
import {GetProject404Response} from './GetProject404Response';
import {GuidelinesDto} from './GuidelinesDto';
import {LanguageURLMapping} from './LanguageURLMapping';
import {ListAppTokens401Response} from './ListAppTokens401Response';
import {ListAppTokens403Response} from './ListAppTokens403Response';
import {Login401Response} from './Login401Response';
import {LoginRequest, LoginRequestTypeEnum} from './LoginRequest';
import {LoginRequestOneOf, LoginRequestOneOfTypeEnum} from './LoginRequestOneOf';
import {LoginRequestOneOf1, LoginRequestOneOf1TypeEnum} from './LoginRequestOneOf1';
import {LoginRequestOneOf2, LoginRequestOneOf2TypeEnum} from './LoginRequestOneOf2';
import {PolicyCreateRequestDto, PolicyCreateRequestDtoTypeEnum} from './PolicyCreateRequestDto';
import {PolicyCreateTranslationDto} from './PolicyCreateTranslationDto';
import {PolicyDto, PolicyDtoTypeEnum} from './PolicyDto';
import {PolicyTranslationDto} from './PolicyTranslationDto';
import {PolicyTranslationViewDto, PolicyTranslationViewDtoTypeEnum} from './PolicyTranslationViewDto';
import {ProjectDto, ProjectDtoVisibilityEnum} from './ProjectDto';
import {ProjectEntity} from './ProjectEntity';
import {
  ProjectFieldDefinitionDto,
  ProjectFieldDefinitionDtoContextEnum,
  ProjectFieldDefinitionDtoTypeEnum
} from './ProjectFieldDefinitionDto';
import {ProjectRemoveRequestDto} from './ProjectRemoveRequestDto';
import {ProjectRequestDto, ProjectRequestDtoVisibilityEnum} from './ProjectRequestDto';
import {ProjectRoleDto, ProjectRoleDtoRoleEnum} from './ProjectRoleDto';
import {Properties, PropertiesStatusEnum, PropertiesTypeEnum} from './Properties';
import {RoleEntity, RoleEntityLabelEnum, RoleEntityScopeEnum} from './RoleEntity';
import {SaveAnnotationDto, SaveAnnotationDtoContentTypeEnum} from './SaveAnnotationDto';
import {SaveGuidelinesRequestInner} from './SaveGuidelinesRequestInner';
import {TaskChangeDto, TaskChangeDtoContentTypeEnum} from './TaskChangeDto';
import {
  TaskChangeDtoProperties,
  TaskChangeDtoPropertiesStatusEnum,
  TaskChangeDtoPropertiesTypeEnum
} from './TaskChangeDtoProperties';
import {TaskDto, TaskDtoStatusEnum} from './TaskDto';
import {TaskEntity, TaskEntityStatusEnum} from './TaskEntity';
import {TaskInputOutputDto, TaskInputOutputDtoCreatorTypeEnum} from './TaskInputOutputDto';
import {
  TaskInputOutputEntity,
  TaskInputOutputEntityContentTypeEnum,
  TaskInputOutputEntityCreatorTypeEnum
} from './TaskInputOutputEntity';
import {TaskProperties, TaskPropertiesStatusEnum, TaskPropertiesTypeEnum} from './TaskProperties';
import {TaskPropertiesMedia} from './TaskPropertiesMedia';
import {TaskUploadDto, TaskUploadDtoContentTypeEnum} from './TaskUploadDto';
import {TaskUploadMediaDto} from './TaskUploadMediaDto';
import {ToolCreateRequestDto} from './ToolCreateRequestDto';
import {ToolDto} from './ToolDto';
import {ToolEntity} from './ToolEntity';

/* tslint:disable:no-unused-variable */
let primitives = [
  'string',
  'boolean',
  'double',
  'integer',
  'long',
  'float',
  'number',
  'any'
];

const supportedMediaTypes: { [mediaType: string]: number } = {
  'application/json': Infinity,
  'application/octet-stream': 0,
  'application/x-www-form-urlencoded': 0
}


let enumsMap: Set<string> = new Set<string>([
  'AccountCreateRequestDtoRoleEnum',
  'AccountCreateRequestDtoGenderEnum',
  'AccountDtoLoginmethodEnum',
  'AccountDtoGeneralRoleEnum',
  'AccountFieldDefinitionCreateDtoContextEnum',
  'AccountFieldDefinitionCreateDtoTypeEnum',
  'AccountFieldDefinitionDtoContextEnum',
  'AccountFieldDefinitionDtoTypeEnum',
  'AccountPersonEntityGenderEnum',
  'AccountRegisterRequestDtoGenderEnum',
  'AssignAccountRoleDtoRoleEnum',
  'AssignProjectRolesRequestInnerRoleEnum',
  'AssignRoleDtoGeneralEnum',
  'LoginRequestTypeEnum',
  'LoginRequestOneOfTypeEnum',
  'LoginRequestOneOf1TypeEnum',
  'LoginRequestOneOf2TypeEnum',
  'PolicyCreateRequestDtoTypeEnum',
  'PolicyDtoTypeEnum',
  'PolicyTranslationViewDtoTypeEnum',
  'ProjectDtoVisibilityEnum',
  'ProjectFieldDefinitionDtoContextEnum',
  'ProjectFieldDefinitionDtoTypeEnum',
  'ProjectRequestDtoVisibilityEnum',
  'ProjectRoleDtoRoleEnum',
  'PropertiesTypeEnum',
  'PropertiesStatusEnum',
  'RoleEntityLabelEnum',
  'RoleEntityScopeEnum',
  'SaveAnnotationDtoContentTypeEnum',
  'TaskChangeDtoContentTypeEnum',
  'TaskChangeDtoPropertiesTypeEnum',
  'TaskChangeDtoPropertiesStatusEnum',
  'TaskDtoStatusEnum',
  'TaskEntityStatusEnum',
  'TaskInputOutputDtoCreatorTypeEnum',
  'TaskInputOutputEntityCreatorTypeEnum',
  'TaskInputOutputEntityContentTypeEnum',
  'TaskPropertiesTypeEnum',
  'TaskPropertiesStatusEnum',
  'TaskUploadDtoContentTypeEnum',
]);

let typeMap: { [index: string]: any } = {
  'AccountCreateRequestDto': AccountCreateRequestDto,
  'AccountDto': AccountDto,
  'AccountEntity': AccountEntity,
  'AccountFieldDefinitionCreateDto': AccountFieldDefinitionCreateDto,
  'AccountFieldDefinitionDto': AccountFieldDefinitionDto,
  'AccountPersonEntity': AccountPersonEntity,
  'AccountRegisterRequestDto': AccountRegisterRequestDto,
  'AccountRoleProjectEntity': AccountRoleProjectEntity,
  'AppTokenChangeDto': AppTokenChangeDto,
  'AppTokenCreateDto': AppTokenCreateDto,
  'AppTokenDto': AppTokenDto,
  'AssignAccountRoleDto': AssignAccountRoleDto,
  'AssignAccountRoles404Response': AssignAccountRoles404Response,
  'AssignProjectRolesRequestInner': AssignProjectRolesRequestInner,
  'AssignRoleDto': AssignRoleDto,
  'AudioDurationDto': AudioDurationDto,
  'ChangeMyPassword400Response': ChangeMyPassword400Response,
  'ChangePasswordDto': ChangePasswordDto,
  'ChangeTaskData404Response': ChangeTaskData404Response,
  'FileProjectEntity': FileProjectEntity,
  'GeneralSettingsDto': GeneralSettingsDto,
  'GetProject404Response': GetProject404Response,
  'GuidelinesDto': GuidelinesDto,
  'LanguageURLMapping': LanguageURLMapping,
  'ListAppTokens401Response': ListAppTokens401Response,
  'ListAppTokens403Response': ListAppTokens403Response,
  'Login401Response': Login401Response,
  'LoginRequest': LoginRequest,
  'LoginRequestOneOf': LoginRequestOneOf,
  'LoginRequestOneOf1': LoginRequestOneOf1,
  'LoginRequestOneOf2': LoginRequestOneOf2,
  'PolicyCreateRequestDto': PolicyCreateRequestDto,
  'PolicyCreateTranslationDto': PolicyCreateTranslationDto,
  'PolicyDto': PolicyDto,
  'PolicyTranslationDto': PolicyTranslationDto,
  'PolicyTranslationViewDto': PolicyTranslationViewDto,
  'ProjectDto': ProjectDto,
  'ProjectEntity': ProjectEntity,
  'ProjectFieldDefinitionDto': ProjectFieldDefinitionDto,
  'ProjectRemoveRequestDto': ProjectRemoveRequestDto,
  'ProjectRequestDto': ProjectRequestDto,
  'ProjectRoleDto': ProjectRoleDto,
  'Properties': Properties,
  'RoleEntity': RoleEntity,
  'SaveAnnotationDto': SaveAnnotationDto,
  'SaveGuidelinesRequestInner': SaveGuidelinesRequestInner,
  'TaskChangeDto': TaskChangeDto,
  'TaskChangeDtoProperties': TaskChangeDtoProperties,
  'TaskDto': TaskDto,
  'TaskEntity': TaskEntity,
  'TaskInputOutputDto': TaskInputOutputDto,
  'TaskInputOutputEntity': TaskInputOutputEntity,
  'TaskProperties': TaskProperties,
  'TaskPropertiesMedia': TaskPropertiesMedia,
  'TaskUploadDto': TaskUploadDto,
  'TaskUploadMediaDto': TaskUploadMediaDto,
  'ToolCreateRequestDto': ToolCreateRequestDto,
  'ToolDto': ToolDto,
  'ToolEntity': ToolEntity,
}

export class ObjectSerializer {
  public static findCorrectType(data: any, expectedType: string) {
    if (data == undefined) {
      return expectedType;
    } else if (primitives.indexOf(expectedType.toLowerCase()) !== -1) {
      return expectedType;
    } else if (expectedType === 'Date') {
      return expectedType;
    } else {
      if (enumsMap.has(expectedType)) {
        return expectedType;
      }

      if (!typeMap[expectedType]) {
        return expectedType; // w/e we don't know the type
      }

      // Check the discriminator
      let discriminatorProperty = typeMap[expectedType].discriminator;
      if (discriminatorProperty == null) {
        return expectedType; // the type does not have a discriminator. use it.
      } else {
        if (data[discriminatorProperty]) {
          var discriminatorType = data[discriminatorProperty];
          if (typeMap[discriminatorType]) {
            return discriminatorType; // use the type given in the discriminator
          } else {
            return expectedType; // discriminator did not map to a type
          }
        } else {
          return expectedType; // discriminator was not present (or an empty string)
        }
      }
    }
  }

  public static serialize(data: any, type: string, format: string) {
    if (data == undefined) {
      return data;
    } else if (primitives.indexOf(type.toLowerCase()) !== -1) {
      return data;
    } else if (type.lastIndexOf('Array<', 0) === 0) { // string.startsWith pre es6
      let subType: string = type.replace('Array<', ''); // Array<Type> => Type>
      subType = subType.substring(0, subType.length - 1); // Type> => Type
      let transformedData: any[] = [];
      for (let index in data) {
        let date = data[index];
        transformedData.push(ObjectSerializer.serialize(date, subType, format));
      }
      return transformedData;
    } else if (type === 'Date') {
      if (format == 'date') {
        let month = data.getMonth() + 1
        month = month < 10 ? '0' + month.toString() : month.toString()
        let day = data.getDate();
        day = day < 10 ? '0' + day.toString() : day.toString();

        return data.getFullYear() + '-' + month + '-' + day;
      } else {
        return data.toISOString();
      }
    } else {
      if (enumsMap.has(type)) {
        return data;
      }
      if (!typeMap[type]) { // in case we dont know the type
        return data;
      }

      // Get the actual type of this object
      type = this.findCorrectType(data, type);

      // get the map for the correct type.
      let attributeTypes = typeMap[type].getAttributeTypeMap();
      let instance: { [index: string]: any } = {};
      for (let index in attributeTypes) {
        let attributeType = attributeTypes[index];
        instance[attributeType.baseName] = ObjectSerializer.serialize(data[attributeType.name], attributeType.type, attributeType.format);
      }
      return instance;
    }
  }

  public static deserialize(data: any, type: string, format: string) {
    // polymorphism may change the actual type.
    type = ObjectSerializer.findCorrectType(data, type);
    if (data == undefined) {
      return data;
    } else if (primitives.indexOf(type.toLowerCase()) !== -1) {
      return data;
    } else if (type.lastIndexOf('Array<', 0) === 0) { // string.startsWith pre es6
      let subType: string = type.replace('Array<', ''); // Array<Type> => Type>
      subType = subType.substring(0, subType.length - 1); // Type> => Type
      let transformedData: any[] = [];
      for (let index in data) {
        let date = data[index];
        transformedData.push(ObjectSerializer.deserialize(date, subType, format));
      }
      return transformedData;
    } else if (type === 'Date') {
      return new Date(data);
    } else {
      if (enumsMap.has(type)) {// is Enum
        return data;
      }

      if (!typeMap[type]) { // dont know the type
        return data;
      }
      let instance = new typeMap[type]();
      let attributeTypes = typeMap[type].getAttributeTypeMap();
      for (let index in attributeTypes) {
        let attributeType = attributeTypes[index];
        let value = ObjectSerializer.deserialize(data[attributeType.baseName], attributeType.type, attributeType.format);
        if (value !== undefined) {
          instance[attributeType.name] = value;
        }
      }
      return instance;
    }
  }


  /**
   * Normalize media type
   *
   * We currently do not handle any media types attributes, i.e. anything
   * after a semicolon. All content is assumed to be UTF-8 compatible.
   */
  public static normalizeMediaType(mediaType: string | undefined): string | undefined {
    if (mediaType === undefined) {
      return undefined;
    }
    return mediaType.split(';')[0].trim().toLowerCase();
  }

  /**
   * From a list of possible media types, choose the one we can handle best.
   *
   * The order of the given media types does not have any impact on the choice
   * made.
   */
  public static getPreferredMediaType(mediaTypes: Array<string>): string {
    /** According to OAS 3 we should default to json */
    if (!mediaTypes) {
      return 'application/json';
    }

    const normalMediaTypes = mediaTypes.map(this.normalizeMediaType);
    let selectedMediaType: string | undefined = undefined;
    let selectedRank: number = -Infinity;
    for (const mediaType of normalMediaTypes) {
      if (supportedMediaTypes[mediaType!] > selectedRank) {
        selectedMediaType = mediaType;
        selectedRank = supportedMediaTypes[mediaType!];
      }
    }

    if (selectedMediaType === undefined) {
      throw new Error('None of the given media types are supported: ' + mediaTypes.join(', '));
    }

    return selectedMediaType!;
  }

  /**
   * Convert data to a string according the given media type
   */
  public static stringify(data: any, mediaType: string): string {
    if (mediaType === 'application/json') {
      return JSON.stringify(data);
    }

    throw new Error('The mediaType ' + mediaType + ' is not supported by ObjectSerializer.stringify.');
  }

  /**
   * Parse data from a string according to the given media type
   */
  public static parse(rawData: string, mediaType: string | undefined) {
    if (mediaType === undefined) {
      throw new Error('Cannot parse content. No Content-Type defined.');
    }

    if (mediaType === 'application/json') {
      return JSON.parse(rawData);
    }

    if (mediaType === 'text/html') {
      return rawData;
    }

    throw new Error('The mediaType ' + mediaType + ' is not supported by ObjectSerializer.parse.');
  }
}
