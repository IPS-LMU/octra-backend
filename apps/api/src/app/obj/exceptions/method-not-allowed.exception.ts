import {CustomHttpException} from './custom-http.exception';

export class MethodNotAllowedException extends CustomHttpException {
  constructor() {
    super({
      message: 'You are not allowed to execute this method.'
    }, 405);
  }
}
