import {Component, OnInit} from '@angular/core';
import {APIService} from '../api.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'ocb-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent implements OnInit {

  errorMessage = '';

  constructor(private api: APIService, private router: Router, private route: ActivatedRoute) {
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
      if (this.api.initialized) {
        console.log(`initialized`);
        this.router.navigate([`/members/${targetRoute}`], {
          queryParams
        });
      } else {
        console.log(`load api init`);
        this.api.initAfterLogin().then(() => {
          console.log(`initialized: ${this.api.initialized}`);
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
