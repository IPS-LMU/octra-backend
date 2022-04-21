import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {Observable} from 'rxjs';
import {Reflector} from '@nestjs/core';
import {InternRequest} from '../types';
import {AppTokenService} from '../../core/app-token/app-token.service';

@Injectable()
export class AppTokenOriginGuard implements CanActivate {
  constructor(private reflector: Reflector, private appTokenService: AppTokenService) {
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req: InternRequest = context.switchToHttp().getRequest();
    let originHost = req.get('origin')
    let appToken = req.get('X-App-Token');

    if (appToken) {
      originHost = (originHost) ? originHost = originHost.replace(/:[0-9]{1,5}$/g, '').replace(/^https?:\/\//g, '') : '';
      if (originHost === '') {
        originHost = req.get('host');
      }

      return this.appTokenService.isValidAppToken(appToken, originHost);
    }

    return false;
  }
}
