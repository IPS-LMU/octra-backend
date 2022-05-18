import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ModalsService} from '../../modals/modals.service';
import {OctraAPIService} from '@octra/ngx-octra-api';
import {AppStorageService} from '../../app-storage.service';

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

  windowChecker: number = -1;

  constructor(public api: OctraAPIService, private router: Router, private modalsService: ModalsService, private appStorage: AppStorageService) {
  }

  ngOnInit(): void {

  }

  onSubmit(type: 'local' | 'shibboleth') {
    this.appStorage.login(type, this.user.name, this.user.password).catch((error) => {
      this.modalsService.openErrorModal('Error occurred', error);
    });
  }
}
