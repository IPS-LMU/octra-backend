import {Component, Input, OnInit} from '@angular/core';
import {OctraAPIService} from '@octra/ngx-octra-api';

@Component({
  selector: 'ocb-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.css']
})
export class PageHeaderComponent implements OnInit {
  @Input() title = '';

  constructor(private api: OctraAPIService) {
  }

  ngOnInit(): void {
  }
}
