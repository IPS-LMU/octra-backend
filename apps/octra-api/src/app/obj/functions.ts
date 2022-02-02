import {DateTime} from "luxon";

export function isNumber(elem: any) {
  return !isNaN(elem);
}

export function isEmpty(value: any) {
  return value && Object.keys(value).length === 0 && value.constructor === Object;
}

export function removeEmptyAttributes(json: any) {
  for (const col in json) {
    if (json.hasOwnProperty(col)) {
      if (json[col] === null || json[col] === undefined) {
        delete json[col];
      } else if (json.hasOwnProperty(col) && col.indexOf('date') > -1
        && !(json[col] === undefined || json[col] === null)) {
        json[col] = DateTime.fromSQL(json[col]).toJSON();
      } else if (typeof json[col] === 'object') {
        json[col] = removeEmptyAttributes(json[col]);
      }
    }
  }
  return json;
}
