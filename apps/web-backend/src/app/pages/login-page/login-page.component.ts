import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ModalsService} from '../../modals/modals.service';
import {OctraAPIService} from '@octra/ngx-octra-api';
import {AppStorageService} from '../../app-storage.service';
import {AccountLoginMethod} from '@octra/api-types';

@Component({
  selector: 'ocb-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {

  public user = {
    name: '',
    password: ''
  };

  public get AccountLoginMethod() {
    return AccountLoginMethod;
  }

  windowChecker: number = -1;

  constructor(public api: OctraAPIService, private router: Router, private modalsService: ModalsService, public appStorage: AppStorageService, private route: ActivatedRoute) {
    const method = this.getCookie('ocb_authenticated') as AccountLoginMethod;
    if (method) {
      this.appStorage.autoLogin(method);
    }
  }

  ngOnInit(): void {
  }

  onSubmit(type: AccountLoginMethod) {
    const name = type === AccountLoginMethod.local ? this.user.name : undefined;
    const password = type === AccountLoginMethod.local ? this.user.password : undefined;

    this.appStorage.login(type, name, password).catch((error) => {
      this.modalsService.openErrorModal('Error occurred', error);
    });
  }

  getCookie(cname: string) {
    let name = cname + '=';
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }
}
