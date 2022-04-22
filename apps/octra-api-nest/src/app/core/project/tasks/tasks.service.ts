import {Injectable} from '@nestjs/common';
import {AppService} from '../../../app.service';

@Injectable()
export class TasksService {
  constructor(private appService: AppService) {
  }
}
