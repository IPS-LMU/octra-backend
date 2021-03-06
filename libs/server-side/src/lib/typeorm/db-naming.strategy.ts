import {DefaultNamingStrategy, NamingStrategyInterface, Table} from 'typeorm';

export class DbNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
  override foreignKeyName(tableOrName: Table | string, columnNames: string[], referencedTablePath?: string, referencedColumnNames?: string[]): string {
    tableOrName =
      typeof tableOrName === 'string' ? tableOrName : tableOrName.name;

    const name = columnNames.reduce(
      (name, column) => `${name}_${column}`,
      `${tableOrName}_${referencedTablePath}`,
    ).replace('public.', '');

    return `${name}_fkey`
  }

  override primaryKeyName(tableOrName: Table | string, columnNames: string[]): string {
    tableOrName =
      typeof tableOrName === 'string' ? tableOrName : tableOrName.name;

    const name = columnNames.reduce(
      (name, column) => `${name}_${column}`,
      `${tableOrName}`,
    ).replace('public.', '');

    return `${name}_pkey`
  }
}
