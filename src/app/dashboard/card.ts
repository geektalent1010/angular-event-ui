import { Column } from './column';
export interface Card {
  pos: number;
  title: string;
  col1: Column;
  col2: Column;
  col3?: Column;
  percent_variance?: number;
  variance?: number | string;
  variance_symbol?: string;
}
