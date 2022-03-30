import {JSONSchema4} from 'json-schema';

export const TaskInputOutputSchema: JSONSchema4 = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      description: 'A mime-type.',
      required: true
    },
    label: {
      type: 'string',
      required: true
    },
    creator_type: {
      enum: ['uploader', 'annotator'],
      required: true
    },
    description: {
      type: 'string'
    },
    content: {
      type: 'object',
      description: 'AnnotJSON only.'
    },
    url: {
      type: 'string'
    },
    size: {
      type: 'number',
      description: 'Only available if its a media file.'
    },
    metadata: {
      type: 'object',
      description: 'Only available if its a media file.'
    }
  }

};

export const TaskSchema: JSONSchema4 = {
  type: 'object',
  properties: {
    id: {
      type: 'number',
      required: true
    },
    type: {
      enum: ['annotation'],
      required: true
    },
    pid: {
      type: 'string'
    },
    orgtext: {
      type: 'string'
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
    updatedate: {
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
    admin_comment: {
      type: 'string'
    },
    tool_id: {
      type: 'number'
    },
    worker_id: {
      type: 'number'
    },
    project_id: {
      type: 'number'
    },
    nexttask_id: {
      type: 'number'
    },
    inputs: {
      type: 'array',
      items: TaskInputOutputSchema
    },
    outputs: {
      type: 'array',
      items: TaskInputOutputSchema
    }
  }
};

export const TaskUploadSchema: JSONSchema4 = {
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
    worker_id: {
      type: 'number'
    },
    inputs: {
      type: 'array',
      items: TaskInputOutputSchema
    },
    outputs: {
      type: 'array',
      items: TaskInputOutputSchema
    }
  }
};
