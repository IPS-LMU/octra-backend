import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {APIService} from './api.service';

@Injectable({
  providedIn: 'root'
})
export class APIInitializeGuard implements CanActivate {
  constructor(private api: APIService, private router: Router) {

  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.api.initialized) {
      return true;
    } else {
      console.log(`route is`);
      console.log(route.url.map(a => a.path).join('/'));
      console.log(`params route`);
      console.log(route.queryParams);
      this.router.navigate(['/loading'], {
        queryParams: {
          origin: route.url.map(a => a.path).join('/'),
          ...route.queryParams
        }
      });
    }
    return false;
  }

}
