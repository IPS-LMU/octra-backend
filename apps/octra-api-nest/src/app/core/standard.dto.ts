import {ApiProperty} from '@nestjs/swagger';

export class StandardDto {
  @ApiProperty()
  id: number;
}

export class StandardWithTimeDto extends StandardDto {
  @ApiProperty()
  creationdate: Date;
  @ApiProperty()
  updatedate: Date;
}
