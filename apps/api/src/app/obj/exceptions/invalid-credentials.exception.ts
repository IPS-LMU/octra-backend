import {CustomHttpException} from './custom-http.exception';

export class InvalidCredentialsException extends CustomHttpException {
  constructor() {
    super({
      message: 'Invalid username or password.'
    }, 401);
  }
}
