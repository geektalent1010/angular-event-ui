export interface SnapshotFormatting {
  col2Prefix: string;
  col2Suffix: string;
  highlightColor: string;
}
export const defaultFormat: SnapshotFormatting = {
  col2Prefix: '',
  col2Suffix: '',
  highlightColor: ''
};
export interface TwoColumnRow {
  col1: string;
  col2: number;
  formatting: SnapshotFormatting;
}
export interface Snapshot {
  title: string;
  subtitle: string;
  rows: TwoColumnRow[];
}
export function snapshotRowFactory(
  col1: string,
  col2: number,
  formatting = { ...defaultFormat }
): TwoColumnRow {
  return {
    col1: col1,
    col2: col2,
    formatting: formatting
  };
}
