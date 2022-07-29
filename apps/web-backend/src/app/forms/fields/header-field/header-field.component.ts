import {Component, Input, OnInit} from '@angular/core';
import {AccountFieldComponent} from '../account-field/account-field.component';
import {AccountFieldDefinitionDto, AccountFieldHeadline} from '@octra/api-types';
import {TranslocoService} from '@ngneat/transloco';

class HeadlineDefinitionDto extends AccountFieldDefinitionDto {
  override definition: AccountFieldHeadline | undefined;
}

@Component({
  selector: 'web-backend-header-field',
  templateUrl: './header-field.component.html',
  styleUrls: ['./header-field.component.scss'],
})
export class HeaderFieldComponent extends AccountFieldComponent implements OnInit {
  @Input() override definitionDto?: HeadlineDefinitionDto;

  public get definition(): AccountFieldHeadline | undefined {
    return this.definitionDto?.definition;
  }

  constructor(private transloco: TranslocoService) {
    super(transloco);
  }

  override ngOnInit(): void {
  }
}
