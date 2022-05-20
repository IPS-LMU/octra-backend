import {Module} from '@nestjs/common';
import {FilesController} from './files.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {GlobalModule} from '../../global.module';
import {FileEntity} from '@octra/server-side';

export const FILE_ENTITIES = [FileEntity];

@Module({
  imports: [TypeOrmModule.forFeature(FILE_ENTITIES), GlobalModule],
  controllers: [FilesController],
  providers: [TypeOrmModule]
})
export class FilesModule {
}
