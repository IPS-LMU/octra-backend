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
