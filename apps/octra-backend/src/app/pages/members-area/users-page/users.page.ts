import {Component, OnInit} from '@angular/core';
import {APIService} from '../../../api.service';

@Component({
  selector: 'ocb-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.css']
})
export class UsersPage implements OnInit {
  public transcripts: any[];

  constructor(private api: APIService) {
    this.transcripts = [];
  }

  ngOnInit(): void {
    this.api.retrieveUsers().then((result) => {
      console.log(`result`);
      console.log(result);
      this.transcripts = result;
    }).catch((error) => {
      console.error(error);
    });
  }

}
