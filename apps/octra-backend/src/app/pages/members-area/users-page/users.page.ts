import {Component, OnInit} from '@angular/core';
import {OctraAPIService} from '@octra/ngx-octra-api';

@Component({
  selector: 'ocb-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.css']
})
export class UsersPage implements OnInit {
  public transcripts: any[];

  constructor(private api: OctraAPIService) {
    this.transcripts = [];
  }

  ngOnInit(): void {
    this.api.listUsers().then((result) => {
      console.log(`result`);
      console.log(result);
      this.transcripts = result;
    }).catch((error) => {
      console.error(error);
    });
  }

}
