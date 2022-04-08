import {ValueTransformer} from 'typeorm/decorator/options/ValueTransformer';

export class ColumnNumericTransformer implements ValueTransformer {
  from(data: string): number {
    return parseInt(data);
  }

  to(value: number): number {
    return value;
  }

}
