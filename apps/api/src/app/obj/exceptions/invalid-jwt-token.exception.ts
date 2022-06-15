import {CustomHttpException} from './custom-http.exception';

export class InvalidJwtTokenException extends CustomHttpException {
  constructor() {
    super({
      message: 'Invalid JWT Token'
    }, 401);
  }
}
