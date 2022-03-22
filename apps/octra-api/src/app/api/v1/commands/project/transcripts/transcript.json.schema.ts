import {JSONSchema4} from 'json-schema';

export const TranscriptSchema: JSONSchema4 = {
  type: 'object',
  properties: {
    id: {
      type: 'number',
      required: true
    },
    pid: {
      type: 'string'
    },
    orgtext: {
      type: 'string'
    },
    transcript: {
      type: 'object'
    },
    assessment: {
      type: 'string'
    },
    priority: {
      type: 'number'
    },
    status: {
      type: 'string'
    },
    code: {
      type: 'string'
    },
    creationdate: {
      type: 'string'
    },
    startdate: {
      type: 'string'
    },
    enddate: {
      type: 'string'
    },
    log: {
      type: 'array'
    },
    comment: {
      type: 'string'
    },
    tool_id: {
      type: 'number'
    },
    transcriber_id: {
      type: 'number'
    },
    project_id: {
      type: 'number'
    },
    file_id: {
      type: 'number'
    },
    file: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          required: true
        },
        type: {
          type: 'string'
        },
        size: {
          type: 'number'
        },
        metadata: {
          type: 'object'
        }
      }
    },
    nexttranscript: {
      type: 'number'
    }
  }
};

export const TranscriptUploadSchema: JSONSchema4 = {
  type: 'object',
  properties: {
    id: {
      type: 'number',
      required: true
    },
    pid: {
      type: 'string'
    },
    orgtext: {
      type: 'string'
    },
    transcript: {
      type: 'object'
    },
    assessment: {
      type: 'string'
    },
    priority: {
      type: 'number'
    },
    status: {
      type: 'string'
    },
    code: {
      type: 'string'
    },
    creationdate: {
      type: 'string'
    },
    startdate: {
      type: 'string'
    },
    enddate: {
      type: 'string'
    },
    log: {
      type: 'array'
    },
    comment: {
      type: 'string'
    },
    tool_id: {
      type: 'number'
    },
    transcriber_id: {
      type: 'number'
    },
    mediaitem: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          required: true
        },
        type: {
          type: 'string'
        },
        size: {
          type: 'number'
        },
        session: {
          type: 'string',
          required: true
        },
        metadata: {
          type: 'object',
          properties: {
            duration: {
              type: 'object',
              properties: {
                samples: {
                  type: 'number'
                },
                seconds: {
                  type: 'number'
                }
              }
            },
            sampleRate: {
              type: 'number'
            },
            bitRate: {
              type: 'number'
            },
            numberOfChannels: {
              type: 'number'
            },
            container: {
              type: 'string'
            },
            codec: {
              type: 'string'
            },
            losless: {
              type: 'boolean'
            }
          }
        }
      }
    }
  }
};
