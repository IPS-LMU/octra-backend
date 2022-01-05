import {Request} from 'express';
import {UserRole} from '@octra/db';
import {PathBuilder} from '../path-builder';


export interface TokenData {
  id: number;
  role: UserRole[]
}

export interface InternRequest extends Request {
  decoded: TokenData;
  AppToken: string;
  pathBuilder: PathBuilder;
}
