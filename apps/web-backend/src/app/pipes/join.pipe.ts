import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'join'
})
export class JoinPipe implements PipeTransform {

  transform(value: string[], options: {
    separator: string
  }): unknown {
    return value.join(options.separator);
  }

}
