import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {AccountFieldComponent} from './fields/account-field/account-field.component';
import {CategorySelectionFieldComponent} from './fields/category-selection-field/category-selection-field.component';
import {HeaderFieldComponent} from './fields/header-field/header-field.component';

@NgModule({
  declarations: [
    AccountFieldComponent,
    CategorySelectionFieldComponent,
    HeaderFieldComponent,
  ],
  imports: [CommonModule, HttpClientModule, FormsModule],
  exports: [
    HeaderFieldComponent
  ]
})
export class OCBFormsModule {
}
