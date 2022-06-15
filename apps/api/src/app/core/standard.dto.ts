import {ApiProperty} from '@nestjs/swagger';

export class StandardDto {
  @ApiProperty({
    description: 'Primary, unique identifier for this entry',
    example: '12345'
  })
  id: string;
}

export class StandardWithTimeDto extends StandardDto {
  @ApiProperty({
    description: 'date of creation'
  })
  creationdate: Date;
  @ApiProperty({
    description: 'date of latest update'
  })
  updatedate: Date;
}
