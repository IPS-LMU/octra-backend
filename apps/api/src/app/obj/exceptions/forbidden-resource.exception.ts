import {CustomHttpException} from './custom-http.exception';

export class ForbiddenResource extends CustomHttpException {
  constructor() {
    super({
      message: 'You are not authorized to access this resource.'
    }, 403);
  }
}
