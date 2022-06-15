import {HttpException} from '@nestjs/common';
import {SchemaObject} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export class CustomHttpException extends HttpException {
  public description = '';
  public schema: SchemaObject = {
    required: ['message'],
    properties: {
      message: {
        type: 'string',
        description: 'message that contains an error.'
      }
    }
  }

  constructor(template: any, status: number) {
    super(template, status);
    this.description = template.message;
    this.schema.example = template;
  }
}
