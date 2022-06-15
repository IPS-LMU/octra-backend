import {IsEmail, IsEnum, IsNotEmpty, IsOptional} from 'class-validator';
import {AccountLoginMethod} from '@octra/api-types';

export class AuthDto {
  openURL?: string;
  access_token?: string;
  account_id?: string;
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
