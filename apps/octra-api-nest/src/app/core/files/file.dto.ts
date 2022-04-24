import {StandardWithTimeDto} from '../standard.dto';
import {AudioFileMetaData} from '@octra/db';
import {OmitType} from '@nestjs/swagger';

export class FileDto extends StandardWithTimeDto {
  url: string;
  type?: string;
  size?: number;
  uploader_id?: number;
  original_name?: string;
  hash?: string;
  metadata?: AudioFileMetaData;
}

export class FileCreateDto extends OmitType(FileDto, ['id', 'creationdate', 'updatedate']) {
  url: string;
  type?: string;
  size?: number;
  uploader_id?: number;
  original_name?: string;
  hash?: string;
  metadata?: AudioFileMetaData;
}
