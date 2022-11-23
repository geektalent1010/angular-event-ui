import { ExhibitorCompany, AttendeeCompany } from "./mock-data";
export interface TableInfo {
  pos: number;
  title: string;
  companies: ExhibitorCompany[] | AttendeeCompany[];
}
