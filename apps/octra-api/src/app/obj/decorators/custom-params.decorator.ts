import {Param} from '@nestjs/common';

export function NumberParam(param: string) {
  let num = undefined;
  if (param && !isNaN(Number(param))) {
    return Number(param);
  }
  return Param(undefined);
}
