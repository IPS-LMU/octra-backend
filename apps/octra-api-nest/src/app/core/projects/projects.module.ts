import {Module} from '@nestjs/common';
import {ProjectsController} from './projects.controller';

@Module({
  controllers: [ProjectsController],
  providers: []
})
export class ProjectsModule {
}
