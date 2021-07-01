import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OctraAPIService} from './octra-api.service';

@NgModule({
  imports: [CommonModule],
  exports: [],
  providers: [
    OctraAPIService
  ]
})
export class NgxOctraApiModule {
}
