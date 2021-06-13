import {Component, OnDestroy, OnInit} from '@angular/core';
import {OctraAPIService} from '@octra/ngx-octra-api';

@Component({
  selector: 'ocb-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {

  constructor(public api: OctraAPIService) {
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
  }
}

