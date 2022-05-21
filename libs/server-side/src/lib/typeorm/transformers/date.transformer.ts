export const dateTransformer = {
  from(value: any): any {
    if (typeof value === 'string') {
      return new Date(value);
    }
    return value;
  },
  to(value: Date): any {
    if (typeof value === 'object') {
      return value.toISOString();
    }
    return value;
  }
};
