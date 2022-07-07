import {IsEmail, IsEnum, IsNotEmpty, IsObject, IsOptional} from 'class-validator';
import {AccountLoginMethod} from '@octra/api-types';
import {AccountDto} from '../account/account.dto';
import {IsOptionalString} from '@octra/server-side';

export class AuthDto {
  @IsOptionalString()
  openURL?: string;
  @IsOptionalString()
  accessToken?: string;
  @IsOptional()
  @IsObject()
  account?: AccountDto;

  constructor(importFromDB?: Partial<AuthDto>) {
    if (importFromDB) {
      Object.assign(this, importFromDB);
    }
  }
}

export class AuthLoginDto {
  @IsEnum(AccountLoginMethod)
  type: AccountLoginMethod;
  @IsOptional()
  @IsEmail()
  email: string;
  @IsOptional()
  @IsNotEmpty()
  username?: string;
  @IsOptional()
  password?: string;
}

export class AuthRegisterDto {
  @IsNotEmpty()
  username: string;
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
}
