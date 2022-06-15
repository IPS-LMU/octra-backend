import {applyDecorators} from '@nestjs/common';
import {CustomHttpException} from '../exceptions/custom-http.exception';
import {ApiResponse} from '@nestjs/swagger';

export function CustomApiException<T extends CustomHttpException>(exception: CustomHttpException) {
  return applyDecorators(
    ApiResponse({
      status: exception.getStatus(),
      description: exception.description,
      schema: exception.schema,
    }));
}
