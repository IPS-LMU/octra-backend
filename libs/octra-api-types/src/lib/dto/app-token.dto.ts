import {StandardDto} from './standard.dto';

export class AppTokenCreateDto extends StandardDto {
  name: string;
  key: string;
  domain?: string;
  description?: string;
  registrations?: boolean;
}

export class AppTokenDto extends AppTokenCreateDto {
  creationdate?: Date;
  updatedate?: Date;
}
