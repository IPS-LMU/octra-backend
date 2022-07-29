import {Component, Input, OnInit} from '@angular/core';
import {AccountFieldDefinitionDto, AccountFieldTranslation} from '@octra/api-types';
import {TranslocoService} from '@ngneat/transloco';

@Component({
  selector: 'web-backend-account-field',
  templateUrl: './account-field.component.html',
  styleUrls: ['./account-field.component.scss'],
})
export class AccountFieldComponent implements OnInit {
  @Input() definitionDto?: AccountFieldDefinitionDto;
  private translocoService: TranslocoService;

  constructor(transloco: TranslocoService) {
    this.translocoService = transloco;
  }

  ngOnInit(): void {
  }

  public translateLabel(translation?: AccountFieldTranslation): string {
    if (translation) {
      const lang = Object.keys(translation).includes(this.translocoService.getActiveLang()) ? this.translocoService.getActiveLang() : 'en';
      return translation[lang] ?? '';
    }
    return '';
  }
}
