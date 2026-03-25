export interface ExcelColumnDefinition<T = any> {
  header: string;
  key: string;
  width?: number;
  transform?: (value: any, row: T) => any;
}
