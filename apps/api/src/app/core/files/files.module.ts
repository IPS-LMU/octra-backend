import {Module} from '@nestjs/common';
import {FilesController} from './files.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {FileEntity} from '@octra/server-side';

export const FILE_ENTITIES = [FileEntity];

@Module({
  imports: [TypeOrmModule.forFeature(FILE_ENTITIES)],
  controllers: [FilesController],
  providers: [TypeOrmModule]
})
export class FilesModule {
}
