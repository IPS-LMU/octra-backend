import {JSONSchema4} from 'json-schema';
import {TaskSchema} from '../tasks/task.json.schema';

export const AnnotationSchema: JSONSchema4 = {
  ...TaskSchema
};
