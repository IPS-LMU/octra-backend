import {StandardWithTimeDto} from '../standard.dto';
import {OmitType} from '@nestjs/swagger';
import {AudioFileMetaData} from '@octra/octra-api-types';

export class FileDto extends StandardWithTimeDto {
  url: string;
  type?: string;
  size?: number;
  uploader_id?: string;
  original_name?: string;
  hash?: string;
  metadata?: AudioFileMetaData;
}

export class FileCreateDto extends OmitType(FileDto, ['id', 'creationdate', 'updatedate']) {
  url: string;
  type?: string;
  size?: number;
  uploader_id?: string;
  original_name?: string;
  hash?: string;
  metadata?: AudioFileMetaData;
}
