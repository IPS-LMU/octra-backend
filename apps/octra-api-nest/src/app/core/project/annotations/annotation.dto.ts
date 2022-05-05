import {TranscriptDto} from './transcript.dto';

export class AnnotationDto {
  constructor(partial: Partial<TranscriptDto>) {
    Object.assign(this, partial);
  }
}
