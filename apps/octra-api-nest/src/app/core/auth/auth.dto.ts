import {IsEmail, IsNotEmpty} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class AuthDto {
  access_token: string;
}

export class AuthLoginDto {
  @ApiProperty() @IsNotEmpty()
  type: 'shibboleth' | 'local';
  @ApiProperty() @IsEmail()
  email: string;
  @ApiProperty() @IsNotEmpty()
  username?: string;
  @ApiProperty() @IsNotEmpty()
  password?: string;
}

export class AuthRegisterDto {
  @ApiProperty() @IsNotEmpty()
  username: string;
  @ApiProperty() @IsEmail()
  email: string;
  @ApiProperty() @IsNotEmpty()
  password: string;
}
