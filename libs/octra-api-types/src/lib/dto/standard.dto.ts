export class StandardDto {
  id: number;
}

export class StandardWithTimeDto extends StandardDto {
  creationdate: string;
  updatedate: string;
}
