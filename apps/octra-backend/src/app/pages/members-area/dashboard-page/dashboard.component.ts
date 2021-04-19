import {Component, OnInit} from '@angular/core';
import {APIService} from '../../../api.service';

@Component({
  selector: 'ocb-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  constructor(public api: APIService) {
  }

  ngOnInit(): void {
  }

}
