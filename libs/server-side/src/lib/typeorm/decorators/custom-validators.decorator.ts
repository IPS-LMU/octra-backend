import {applyDecorators} from '@nestjs/common';
import {IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidationOptions} from 'class-validator';

export function IsOptionalString(validationOptions?: ValidationOptions) {
  return applyDecorators(
    IsOptional(validationOptions),
    IsString(validationOptions)
  );
}

export function IsOptionalNumber(validationOptions?: ValidationOptions) {
  return applyDecorators(
    IsOptional(validationOptions),
    IsNumber()
  );
}

export function IsOptionalEnum(entity: object, validationOptions?: ValidationOptions) {
  return applyDecorators(
    IsOptional(validationOptions),
    IsEnum(entity, validationOptions)
  );
}

export function IsOptionalBoolean(validationOptions?: ValidationOptions) {
  return applyDecorators(
    IsOptional(validationOptions),
    IsBoolean(validationOptions)
  );
}

export function IsOptionalNotEmptyString(validationOptions?: ValidationOptions) {
  return applyDecorators(
    IsOptional(validationOptions),
    IsNotEmpty(validationOptions),
    IsString(validationOptions)
  );
}

export function IsOptionalNotEmptyNumber(validationOptions?: ValidationOptions) {
  return applyDecorators(
    IsOptional(validationOptions),
    IsNotEmpty(validationOptions),
    IsNumber()
  );
}

export function IsOptionalNotEmptyEnum(entity: object, validationOptions?: ValidationOptions) {
  return applyDecorators(
    IsOptional(validationOptions),
    IsNotEmpty(validationOptions),
    IsEnum(entity, validationOptions)
  );
}
