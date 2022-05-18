import {Component, OnInit} from '@angular/core';
import {OctraAPIService} from '@octra/ngx-octra-api';

@Component({
  selector: 'ocb-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  constructor(public api: OctraAPIService) {
  }

  ngOnInit(): void {
  }

}
