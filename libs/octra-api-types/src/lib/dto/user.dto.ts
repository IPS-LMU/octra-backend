export class UserRegisterDto {
  username: string;
  email: string;
  password: string;
}

export class UserLoginDto {
  type: 'shibboleth' | 'local';
  email?: string;
  username?: string;
  password?: string;
}
