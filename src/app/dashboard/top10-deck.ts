import {
  ExhibitorCompany,
  AttendeeCompany,
  SessionTableData
} from './mock-data';

export interface Top10Deck {
  pos: number;
  top10s: Top10[];
}
export interface Top10 {
  pos: number;
  title: string;
  headers: string[];
  companies?: ExhibitorCompany[] | AttendeeCompany[];
  sessions?: SessionTableData[];
}
