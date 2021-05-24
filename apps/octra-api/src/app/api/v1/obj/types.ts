import {Request} from 'express';
import {UserRole} from '@octra/db';


export interface TokenData {
  id: number;
  role: UserRole[]
}

export interface InternRequest extends Request {
  decoded: TokenData;
  AppToken: string;
}
