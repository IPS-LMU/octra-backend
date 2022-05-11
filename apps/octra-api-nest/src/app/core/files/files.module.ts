import {Module} from '@nestjs/common';
import {FilesController} from './files.controller';
import {FileEntity} from './file.entity';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AppService} from "../../app.service";

export const FILE_ENTITIES = [FileEntity];

@Module({
  imports: [TypeOrmModule.forFeature(FILE_ENTITIES)],
  controllers: [FilesController],
  providers: [AppService]
})
export class FilesModule {
}
