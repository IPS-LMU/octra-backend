import {LANGUAGES} from './account-fields-defaults';

export class AccountFieldDefinition {
  constructor(partial: Partial<AccountFieldDefinition>) {
    Object.assign(this, partial);
  }
}

export class AccountFieldHeadline extends AccountFieldDefinition {
  public translations: AccountFieldLabel[];
  public size: number;

  constructor(partial: Partial<AccountFieldHeadline>) {
    super(partial);
    Object.assign(this, partial);
  }
}

export class AccountFieldControl extends AccountFieldDefinition {
  public isRequired: boolean = false;
  public helpTextLabels: AccountFieldLabel[] = [];
  public schema: any;

  constructor(partial: Partial<AccountFieldControl>) {
    super(partial);
    Object.assign(this, partial);
  }
}

export class AccountFieldRadio extends AccountFieldControl {
  public schema: {
    label: AccountFieldLabel[],
    value: string
  }[] = [];

  constructor(partial: Partial<AccountFieldRadio>) {
    super(partial);
    Object.assign(this, partial);
  }
}

export class AccountFieldInlineText extends AccountFieldControl {
  public schema: {
    label: AccountFieldLabel[],
    placeholder: AccountFieldLabel[],
    minLength: number;
    maxLength: number;
  };

  constructor(partial: Partial<AccountFieldInlineText>) {
    super(partial);
    Object.assign(this, partial);
  }
}

export class AccountFieldTextArea extends AccountFieldControl {
  public schema: {
    label: AccountFieldLabel[],
    placeholder?: AccountFieldLabel[],
    minLength?: number;
    maxLength?: number;
  };

  constructor(partial: Partial<AccountFieldTextArea>) {
    super(partial);
    Object.assign(this, partial);
  }
}

export class AccountFieldSelection extends AccountFieldControl {
  public schema: {
    label: AccountFieldLabel[],
    options: {
      label: AccountFieldLabel[],
      value: string
    }[]
  };

  constructor(partial: Partial<AccountFieldSelection>) {
    super(partial);
    Object.assign(this, partial);
  }
}

export class AccountCategorySelection extends AccountFieldControl {
  public multipleResults = false;

  public schema: {
    label: AccountFieldLabel[],
    selections: {
      name: string,
      options: {
        label: AccountFieldLabel[],
        value: string
      }[]
    }[]
  };

  constructor(partial: Partial<AccountCategorySelection>) {
    super(partial);
    Object.assign(this, partial);
  }
}

export class AccountFieldCheckboxes extends AccountFieldControl {
  public schema: {
    label: AccountFieldLabel[],
    arrangement: 'horizontal' | 'vertical';
    options: {
      label: AccountFieldLabel[];
      value: string;
    }[]
  };

  constructor(partial: Partial<AccountFieldCheckboxes>) {
    super(partial);
    Object.assign(this, partial);
  }
}

export class AccountFieldLabel {
  public language: string;
  public value: string;

  constructor(partial: Partial<AccountFieldLabel>) {
    Object.assign(this, partial);
  }
}

export class AccountFieldValue {
  public pattern: string;
  public value: string;

  constructor(partial: Partial<AccountFieldValue>) {
    Object.assign(this, partial);
  }
}

export function generateLanguageOptions() {
  return LANGUAGES.map(a => ({
    label: [{
      language: 'en',
      value: a.language
    }],
    value: a.language
  }));
}
