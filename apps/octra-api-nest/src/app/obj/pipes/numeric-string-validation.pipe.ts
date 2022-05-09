import {ArgumentMetadata, BadRequestException, Injectable, PipeTransform} from '@nestjs/common';

@Injectable()
export class NumericStringValidationPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    if (!(/[0-9]+/g).exec(value)) {
      throw new BadRequestException(`Param ${metadata.data} must be type of numeric string.`);
    }
    return value;
  }
}
