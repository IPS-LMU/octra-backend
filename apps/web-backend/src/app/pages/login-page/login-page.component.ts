import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
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

  constructor(public api: OctraAPIService, private router: Router, private modalsService: ModalsService, public appStorage: AppStorageService) {
  }

  ngOnInit(): void {
    this.appStorage.readShibbolethAuthToken();
  }

  onSubmit(type: AccountLoginMethod) {
    const name = type === AccountLoginMethod.local ? this.user.name : undefined;
    const password = type === AccountLoginMethod.local ? this.user.password : undefined;

    this.appStorage.login(type, name, password).catch((error) => {
      this.modalsService.openErrorModal('Error occurred', error);
    });
  }
}
