import {SHA256} from 'crypto-js';
import {randomBytes} from 'crypto';

export function isFunction(functionToCheck) {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

export function removeNullAttributes<T>(obj: T): T {

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = removeNullAttributes(obj[i]);
    }
  } else {
    if (!isFunction(obj) && typeof obj === 'object') {
      const anyObj = obj as any;
      const keys = Object.keys(obj);

      for (const key of keys) {
        if (anyObj[key] === null || anyObj[key] === undefined || anyObj[key].toString() === 'NaN') {
          delete anyObj[key];
        } else if (typeof anyObj[key] === 'object') {
          anyObj[key] = removeNullAttributes([anyObj[key]])[0];
        }
      }
    }
  }
  return obj;
}

export function removeProperties(obj: any, properties: string[]) {
  if (obj) {
    const keys = Object.keys(obj);
    for (const property of properties) {
      if (keys.find(a => a === property)) {
        delete obj[property];
      }
    }
  }
  return obj;
}

// TODO remove duplicate code
export function getPasswordHash(salt: string, password: string): string {
  salt = SHA256(salt).toString();
  return SHA256(password + salt).toString();
}

export function getRandomString(length: number): string {
  return randomBytes(48).toString('base64');
}
