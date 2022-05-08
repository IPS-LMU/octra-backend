export class StandardDto {
  id: string;
}

export class StandardWithTimeDto extends StandardDto {
  creationdate: Date;
  updatedate: Date;
}
