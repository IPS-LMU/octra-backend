import {Schema} from 'jsonschema';

export const AppConfigurationSchema: Schema = {
  required: ['version', 'database', 'api'],
  properties: {
    version: {
      type: 'string',
      pattern: '[0-9].[0-9].[0-9]'
    },
    database: {
      required: ['dbType', 'dbHost', 'dbPort', 'dbUser', 'dbPassword'],
      properties: {
        dbType: {
          type: 'string',
          enum: ['postgres', 'sqlite'],
        },
        dbHost: {
          type: 'string'
        },
        dbPort: {
          type: 'number'
        },
        dbName: {
          type: 'string'
        },
        dbUser: {
          type: 'string'
        },
        dbPassword: {
          type: 'string'
        },
        ssl: {
          type: 'object',
          required: ['rejectUnauthorized'],
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
      required: ['url', 'host', 'port', 'debugging', 'security', 'paths'],
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
        security: {
          type: 'object',
          properties: {
            trustProxy: {
              type: 'boolean'
            },
            keys: {
              type: 'object',
              properties: {
                password: {
                  type: 'object',
                  required: ['secret', 'salt'],
                  properties: {
                    secret: {
                      type: 'string'
                    },
                    salt: {
                      type: 'string'
                    }
                  }
                },
                jwt: {
                  type: 'object',
                  required: ['secret', 'salt'],
                  properties: {
                    secret: {
                      type: 'string'
                    },
                    salt: {
                      type: 'string'
                    }
                  }
                },
                url: {
                  type: 'object',
                  required: ['secret', 'salt'],
                  properties: {
                    secret: {
                      type: 'string'
                    },
                    salt: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        },
        paths: {
          type: 'object',
          required: ['projectsFolder', 'uploadFolder'],
          properties: {
            projectsFolder: {
              type: 'string'
            },
            uploadFolder: {
              type: 'string'
            }
          }
        },
        plugins: {
          type: 'object',
          properties: {
            reference: {
              required: ['enabled'],
              type: 'object',
              properties: {
                enabled: {
                  type: 'boolean'
                },
                protection: {
                  type: 'object',
                  properties: {
                    enabled: {
                      type: 'boolean'
                    },
                    username: {
                      type: 'string'
                    },
                    password: {
                      type: 'string'
                    }
                  }
                }
              }

            },
            shibboleth: {
              required: ['enabled', 'secret', 'uuidSalt', 'windowURL'],
              type: 'object',
              properties: {
                enabled: {
                  type: 'boolean'
                },
                secret: {
                  type: 'string'
                },
                uuidSalt: {
                  type: 'string'
                },
                windowURL: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    }
  }
}
