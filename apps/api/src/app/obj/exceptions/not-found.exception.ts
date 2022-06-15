import {CustomHttpException} from './custom-http.exception';

export class NotFoundException extends CustomHttpException {
  constructor(message: string) {
    super({
      message,
    }, 404);
  }
}
