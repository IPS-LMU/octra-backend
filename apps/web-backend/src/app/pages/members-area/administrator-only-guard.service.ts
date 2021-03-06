import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {AppStorageService} from '../../app-storage.service';
import {AccountRole} from '@octra/api-types';

@Injectable({
  providedIn: 'root'
})
export class AdministratorOnlyGuard implements CanActivate {
  constructor(private appStorage: AppStorageService, private router: Router) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.appStorage.initialized) {
      if (this.appStorage.user?.generalRole === AccountRole.administrator) {
        return true;
      } else {
        console.log(`not admin!`);
        console.log(this.appStorage.initialized);
        this.router.navigate(['/members/profile']);
      }
    }
    return false;
  }
}
