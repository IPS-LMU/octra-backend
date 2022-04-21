import {IsEmail, IsNotEmpty} from 'class-validator';

export class AuthDto {
  access_token: string;
  account_id: number;
}

export class AuthLoginDto {
  @IsNotEmpty()
  type: 'shibboleth' | 'local';
  @IsEmail()
  email: string;
  @IsNotEmpty()
  username?: string;
  @IsNotEmpty()
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
