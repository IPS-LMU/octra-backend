export function isNumber(elem: any) {
  return !isNaN(elem);
}

export function isEmpty(value: any) {
  return value && Object.keys(value).length === 0 && value.constructor === Object;
}
