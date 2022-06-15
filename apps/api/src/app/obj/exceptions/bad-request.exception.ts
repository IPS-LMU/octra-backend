import {CustomHttpException} from './custom-http.exception';

export class BadRequestException extends CustomHttpException {
  constructor(message: string) {
    super({
      message: message
    }, 400);
  }
}
