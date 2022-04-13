export class StandardDto {
  id: number;
}

export class StandardWithTimeDto extends StandardDto {
  creationdate: Date;
  updatedate: Date;
}
