import {JSONSchema4} from 'json-schema';

export const ProjectSchema: JSONSchema4 = {
  type: 'object',
  properties: {
    id: {
      type: 'number',
      required: true
    },
    name: {
      type: 'string',
      required: true
    },
    shortname: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    configuration: {
      type: 'object'
    },
    startdate: {
      type: 'string'
    },
    enddate: {
      type: 'string'
    },
    active: {
      type: 'boolean'
    },
    account_roles: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          account_id: {
            type: 'number',
            required: true
          },
          username: {
            type: 'string',
            required: true
          },
          valid_startdate: {
            type: 'string'
          },
          valid_enddate: {
            type: 'string'
          }
        }
      }
    }
  }
}
