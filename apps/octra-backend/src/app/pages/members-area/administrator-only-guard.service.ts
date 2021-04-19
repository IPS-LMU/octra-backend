import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {APIService} from '../../api.service';

@Injectable({
  providedIn: 'root'
})
export class AdministratorOnlyGuard implements CanActivate {
  constructor(private api: APIService, private router: Router) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.api.initialized) {
      if (this.api.user.roles.find(a => a === 'administrator') !== undefined) {
        return true;
      } else {
        console.log(`not admin!`);
        console.log(this.api.initialized);
        this.router.navigate(['/members/profile']);
      }
    }
    return false;
  }
}
