import {Schema} from 'jsonschema';

export const AppConfigurationSchema: Schema = {
    properties: {
        version: {
            type: 'string',
            pattern: '[0-9].[0-9].[0-9]',
            required: true
        },
        database: {
            required: true,
            properties: {
                dbVersion: {
                    type: 'string',
                    pattern: '[0-9].[0-9].[0-9]',
                    required: true
                },
                dbType: {
                    type: 'string',
                    enum: ['PostgreSQL'],
                    required: true
                },
                dbHost: {
                    type: 'string',
                    required: true
                },
                dbPort: {
                    type: 'number',
                    required: true
                },
                dbName: {
                    type: 'string',
                    required: true
                },
                dbUser: {
                    type: 'string',
                    required: true
                },
                dbPassword: {
                    type: 'string',
                    required: true
                },
                ssl: {
                    type: 'object',
                    properties: {
                        rejectUnauthorized: {
                            type: 'boolean',
                            required: true
                        },
                        ca: {
                            type: 'string'
                        },
                        key: {
                            type: 'string'
                        },
                        cert: {
                            type: 'string'
                        }
                    }
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
                    type: 'boolean'
                },
                uploadPath: {
                    type: 'string',
                    required: true
                },
                secret: {
                    type: 'string',
                    pattern: ".{10}",
                    required: true
                },
                authenticator: {
                    type: 'object',
                    properties: {
                        appToken: {
                            type: 'string'
                        }
                    }
                },
                passwordSalt: {
                    type: 'string',
                    pattern: ".{10}",
                    required: true
                }
            },
            required: true
        }
    },
    required: true
}
