import {Request} from 'express';
import {AccessRight} from '@octra/db';
import {PathBuilder} from '../path-builder';


export interface TokenData {
  id: number;
  accessRights: AccessRight[]
}

export interface InternRequest extends Request {
  decoded: TokenData;
  AppToken: string;
  pathBuilder: PathBuilder;
}
