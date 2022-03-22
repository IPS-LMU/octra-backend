import {JSONSchema4} from 'json-schema';

export const ApptokenSchema: JSONSchema4 = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      required: true
    },
    key: {
      type: 'string',
      required: true
    },
    domain: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    registrations: {
      type: 'boolean'
    }
  }
}
