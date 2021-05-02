import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {APIService} from '../../api.service';
import {ModalsService} from '../../modals/modals.service';

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

  windowChecker = null;

  constructor(public api: APIService, private router: Router, private modalsService: ModalsService) {
  }

  ngOnInit(): void {
  }

  onSubmit(type: 'local' | 'shibboleth') {
    this.api.login(type, this.user.name, this.user.password).then((openURL) => {
      if (openURL === '') {
        console.log(`openURL is empty, redirect`);
        this.router.navigate(['/loading']);
      } else {
        console.log(`open window!`);
        const authWindow = window.open('https://clarin.phonetik.uni-muenchen.de/webapps/octra-api/authShibboleth', '_blank', `top:${(window.outerHeight - 400) / 2},width=600,height=400,titlebar=no,status=no,location=no`);
        authWindow.addEventListener('beforeunload', () => {
          console.log(`window closed`);
        });
        if (this.windowChecker !== null) {
          clearInterval(this.windowChecker);
        }
        const closed = false;
        this.windowChecker = setInterval(() => {
          if (!closed && authWindow.closed) {
            clearInterval(this.windowChecker);
            this.windowChecker = null;

            console.log(`try to login right after window close`);
            this.api.login(type, this.user.name, this.user.password).then((openURL2) => {
              if (openURL2 === '') {
                this.router.navigate(['/loading']);
              }
            }).catch(e => {
              alert(e);
            });
          }
        }, 1000);
      }
    }).catch((error) => {
      console.error(error);
      this.modalsService.openErrorModal('Error occurred', error);
    });
  }

}
