import {Injectable} from '@nestjs/common';
import {environment} from '../environments/environment';
import {dirname} from 'path';

@Injectable()
export class AppService {
  private _executionPath: string;
  private _appPath: string;

  constructor() {
    this._appPath = __dirname;
    if (environment.production) {
      this._executionPath = dirname(process.execPath);
    } else {
      this._executionPath = __dirname;
    }
  }
}
