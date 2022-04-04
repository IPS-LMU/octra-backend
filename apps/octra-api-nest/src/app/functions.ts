export function removeNullAttributes<T>(obj: T): T {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = removeNullAttributes(obj[i]);
    }
  } else {
    for (const col in obj) {
      if (obj.hasOwnProperty(col)) {
        if (obj[col] === null || obj[col] === undefined) {
          delete obj[col];
        } else if (typeof obj[col] === 'object') {
          obj[col] = removeNullAttributes([obj[col]])[0];
        }
      }
    }
  }
  return obj;
}
