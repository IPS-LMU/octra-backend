import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {SettingsService} from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsLoadedGuard implements CanActivate {
  constructor(private settingsService: SettingsService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.settingsService.settingsLoaded;
  }

}
