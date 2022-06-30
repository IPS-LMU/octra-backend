import {StandardWithTimeDto} from '../standard.dto';
import {OmitType} from '@nestjs/swagger';
import {AudioFileMetaData} from '@octra/api-types';

export class FileProjectDto extends StandardWithTimeDto {
  project_id: string;
  uploader_id?: string;
  real_name?: string;
  type?: string;
  size?: number;
  url?: string;
  path?: string;
  hash?: string;
  metadata?: AudioFileMetaData;
}

export class FileProjectCreateDto extends OmitType(FileProjectDto, ['id', 'creationdate', 'updatedate']) {
  uploader_id: string;
}
