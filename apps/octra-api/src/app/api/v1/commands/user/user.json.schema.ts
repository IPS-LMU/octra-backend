import {JSONSchema4} from 'json-schema';

export const UserInfoSchema: JSONSchema4 = {
  type: 'object',
  properties: {
    id: {
      type: 'number'
    },
    username: {
      type: 'string'
    },
    accessRights: {
      type: 'array',
      required: true,
      items: {
        type: 'object',
        properties: {
          role: {
            type: 'string',
            required: true
          },
          project_id: {
            type: 'number'
          },
          project_name: {
            type: 'string'
          },
          scope: {
            type: 'string',
            required: true
          }
        }
      }
    },
    creationdate: {
      type: 'string'
    },
    updatedate: {
      type: 'string'
    },
    active: {
      type: 'boolean'
    },
    training: {
      type: 'string'
    },
    loginmethod: {
      type: 'string'
    },
    comment: {
      type: 'string'
    }
  }
};
