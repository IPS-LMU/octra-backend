import {Module} from '@nestjs/common';
import {FilesController} from './files.controller';
import {FileEntity} from './file.entity';
import {TypeOrmModule} from '@nestjs/typeorm';
import {GlobalModule} from '../../global.module';

export const FILE_ENTITIES = [FileEntity];

@Module({
  imports: [TypeOrmModule.forFeature(FILE_ENTITIES), GlobalModule],
  controllers: [FilesController],
  providers: [TypeOrmModule]
})
export class FilesModule {
}
