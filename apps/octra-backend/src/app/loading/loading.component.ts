import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AppStorageService} from '../app-storage.service';

@Component({
  selector: 'ocb-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent implements OnInit {

  errorMessage = '';

  constructor(private appStorage: AppStorageService, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      let targetRoute = params.origin;
      if (!targetRoute) {
        targetRoute = 'dashboard';
      }
      const queryParams = {
        ...params
      };
      delete queryParams.origin;
      console.log(`params`);
      console.log(params);
      if (this.appStorage.initialized) {
        console.log(`initialized`);
        this.router.navigate([`/members/${targetRoute}`], {
          queryParams
        });
      } else {
        console.log(`load api init`);
        this.appStorage.initAfterLogin().then(() => {
          console.log(`initialized: ${this.appStorage.initialized}`);
          this.router.navigate([`/members/${targetRoute}`], {
            queryParams
          });
        }).catch((error) => {
          this.errorMessage = error;
        });
      }
    });
  }

}
