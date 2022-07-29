import {LANGUAGES} from './account-fields-defaults';

export class AccountFieldDefinition {
  public schema!: unknown;
}

export type AccountFieldTranslation = Record<string, string>;

export class AccountFieldHeadline extends AccountFieldDefinition {
  public override schema!: {
    translation: AccountFieldTranslation;
    size: number;
  }

  constructor(partial: Partial<AccountFieldHeadline>) {
    super();
    Object.assign(this, partial);
  }
}

export class AccountFieldControl extends AccountFieldDefinition {
  public isRequired: boolean = false;
  public helpTextLabels?: AccountFieldTranslation;

  constructor(partial: Partial<AccountFieldControl>) {
    super();
    Object.assign(this, partial);
  }
}

export class AccountFieldRadio extends AccountFieldControl {
  public override schema: {
    label: AccountFieldTranslation,
    value: string
  }[] = [];

  constructor(partial: Partial<AccountFieldRadio>) {
    super(partial);
    Object.assign(this, partial);
  }
}

export class AccountFieldInlineText extends AccountFieldControl {
  public override schema!: {
    label: AccountFieldTranslation,
    placeholder: AccountFieldTranslation,
    minLength: number;
    maxLength: number;
  };

  constructor(partial: Partial<AccountFieldInlineText>) {
    super(partial);
    Object.assign(this, partial);
  }
}

export class AccountFieldTextArea extends AccountFieldControl {
  public override schema!: {
    label: AccountFieldTranslation,
    placeholder?: AccountFieldTranslation,
    minLength?: number;
    maxLength?: number;
  };

  constructor(partial: Partial<AccountFieldTextArea>) {
    super(partial);
    Object.assign(this, partial);
  }
}

export class AccountFieldSelection extends AccountFieldControl {
  public override schema!: {
    label: AccountFieldTranslation,
    options: {
      label: AccountFieldTranslation,
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

  public override schema!: {
    label: AccountFieldTranslation,
    selections: {
      name: string,
      class?: string,
      options: {
        label: AccountFieldTranslation,
        value: string
      }[]
    }[]
  };

  constructor(partial: Partial<AccountCategorySelection>) {
    super(partial);
    Object.assign(this, partial);
  }
}

export class AccountFieldMultipleChoice extends AccountFieldControl {
  public override schema!: {
    label: AccountFieldTranslation,
    arrangement: 'horizontal' | 'vertical';
    options: {
      label: AccountFieldTranslation;
      value: string;
    }[]
  };

  constructor(partial: Partial<AccountFieldMultipleChoice>) {
    super(partial);
    Object.assign(this, partial);
  }
}

export class AccountFieldValue {
  public pattern?: string;
  public value?: string;

  constructor(partial: Partial<AccountFieldValue>) {
    Object.assign(this, partial);
  }
}

export function generateLanguageOptions() {
  return LANGUAGES.map(a => ({
    label: {
      'en': a.language
    },
    value: a.language
  }));
}
