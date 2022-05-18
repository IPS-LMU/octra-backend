import {Injectable} from '@nestjs/common';
import {environment} from '../environments/environment';
import {dirname} from 'path';
import {PathBuilder} from './obj/path-builder';
import {ConfigService} from '@nestjs/config';
import {IAPIConfiguration} from "@octra/server-side";

@Injectable()
export class AppService {
  get pathBuilder(): PathBuilder {
    return this._pathBuilder;
  }

  private _executionPath: string;
  private _appPath: string;
  private _pathBuilder: PathBuilder;

  constructor(private readonly configService: ConfigService) {
    this._appPath = __dirname;
    if (environment.production) {
      this._executionPath = dirname(process.execPath);
    } else {
      this._executionPath = __dirname;
    }
    this._pathBuilder = new PathBuilder(configService.get<IAPIConfiguration>('api'));
  }
}
