import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {APIService} from '../../api.service';
import {ModalsService} from '../../modals/modals.service';
import {HttpClient} from '@angular/common/http';

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

  constructor(public api: APIService, private router: Router, private modalsService: ModalsService, private http: HttpClient) {
  }

  ngOnInit(): void {

  }

  onSubmit(type: 'local' | 'shibboleth') {
    this.api.login(type, this.user.name, this.user.password).then((openURL) => {
      if (openURL === '') {
        console.log(`openURL is empty, redirect`);
        this.router.navigate(['/loading']);
      } else {
        // need to open windowURL
        console.log(`open window!`);
        const authWindow = window.open(openURL, '_blank', `top:${(window.outerHeight - 400) / 2},width=600,height=400,titlebar=no,status=no,location=no`);
        if (authWindow) {
          authWindow.addEventListener('beforeunload', () => {
            console.log(`window closed`);
          });

          if (this.windowChecker > -1) {
            clearInterval(this.windowChecker);
          }
          let closed = false;
          this.windowChecker = setInterval(() => {
            if (!closed && authWindow.closed) {
              clearInterval(this.windowChecker);
              this.windowChecker = -1;
              closed = true;

              this.api.retrieveTokenFromWindow(openURL).then(() => {
                this.router.navigate(['/loading']);
              }).catch((error) => {
                console.error(error);
              });
            }
          }, 1000);
        }
      }
    }).catch((error) => {
      console.error(error);
      this.modalsService.openErrorModal('Error occurred', error);
    });
  }
}
