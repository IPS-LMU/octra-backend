export const jsonTransformer = {
  from(value: any): any {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  },
  to(value: any): any {
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return value;
  }
};
