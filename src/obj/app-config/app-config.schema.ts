import {Schema} from 'jsonschema';

export const AppConfigurationSchema: Schema = {
    properties: {
        database: {
            required: true,
            properties: {
                dbType: {
                    type: 'string',
                    enum: ['PostgreSQL'],
                    required: true,
                },
                dbHost: {
                    type: 'string',
                    required: true,
                },
                dbPort: {
                    type: 'number',
                    required: true,
                },
                dbName: {
                    type: 'string',
                    required: true,
                },
                dbPassword: {
                    type: 'string',
                    required: true,
                }
            }
        },
        api: {
            type: 'object',
            properties: {
                url: {
                    type: 'string',
                    required: true
                },
                host: {
                    type: 'string',
                    required: true
                },
                port: {
                    type: 'number',
                    required: true
                },
                debugging: {
                    type: 'boolean',
                },
                uploadPath: {
                    type: 'string',
                    required: true
                },
                secret: {
                    type: 'string',
                    required: true
                }
            },
            required: true,
        }
    },
    required: true,
}
