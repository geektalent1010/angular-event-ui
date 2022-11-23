import {
  Component,
  Directive,
  Input,
  Output,
  EventEmitter,
  QueryList,
  ViewChildren,
  OnInit,
  SimpleChanges
} from '@angular/core';

import { DashboardService } from '../dashboard.service';
import {
  AttendeeCompany,
  ExhibitorCompany,
  SessionTableData
} from '../mock-data';
import { Top10 } from '../top10-deck';

export type SortDirection = 'asc' | 'desc' | '';
const rotate: { [key: string]: SortDirection } = {
  asc: 'desc',
  desc: '',
  '': 'asc'
};

const compare = (v1: string | number, v2: string | number) =>
  v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
export interface SortEvent {
  column: number;
  direction: SortDirection;
}

@Directive({
  selector: 'th[sortable]',
  host: {
    '(click)': 'rotate()'
  }
})
export class NgbdSortableHeader {
  @Input() sortable: number = -1;
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortEvent>();

  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({ column: this.sortable, direction: this.direction });
  }
}

@Component({
  selector: 'app-top-n-table',
  templateUrl: './top-n-table.component.html',
  styleUrls: ['./top-n-table.component.scss']
})
export class TopNTableComponent implements OnInit {
  page = 1;
  pageSize = 10;
  sortedSessions = [];
  sortedCompanies = [];
  keys = {
    companies: ['name', 'count', 'totalSales'],
    sessions: ['name', 'sold', 'allotted', 'percent_sold']
  };
  company_column_prefixes = ['', '', '$'];
  @Input() top10: Top10;
  @Input() sessions: SessionTableData[];
  @Input() companies: ExhibitorCompany[] | AttendeeCompany[];
  @Input() headerTitles: string[];
  @Input() waiting: boolean = true;
  directions: string[];
  column: number = -1;

  constructor(private dashboardService: DashboardService) {}
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  ngOnInit(): void {}
  ngOnChanges(changes: SimpleChanges) {
    if (changes.headerTitles != undefined) {
      this.directions = changes.headerTitles.currentValue.map(x => '');
    }
    if (changes.companies != undefined) {
      this.sortedCompanies = [...changes.companies.currentValue];
    }
    if (changes.sessions != undefined) {
      this.sortedSessions = [...changes.sessions.currentValue].slice(
        0,
        this.pageSize
      );
    }
  }
  onSort({ column, direction }: SortEvent) {
    this.column = column;
    this.directions = Array(this.headers.length).fill('');

    this.directions[column] = direction;
    if (direction === '' || column === -1) {
      if (this.companies.length != 0) {
        this.sortedCompanies = [...this.companies];
      } else if (this.top10.sessions.length != 0) {
        this.refreshSessions();
      }
    } else {
      if (this.companies.length != 0) {
        this.sortedCompanies = [...this.companies].sort((a, b) => {
          const res = compare(
            a[this.keys.companies[column]],
            b[this.keys.companies[column]]
          );
          return direction === 'asc' ? res : -res;
        });
      } else if (this.sessions.length != 0) {
        this.refreshSessions();
      }
    }
  }

  refreshSessions() {
    this.sortedSessions = [...this.sessions];
    if (this.column > -1) {
      this.sortedSessions = this.sortedSessions.sort((a, b) => {
        if (this.directions[this.column] === '') {
          return 1;
        }
        const res = compare(
          a[this.keys.sessions[this.column]],
          b[this.keys.sessions[this.column]]
        );
        return this.directions[this.column] === 'asc' ? res : -res;
      });
    }
    this.sortedSessions = this.sortedSessions
      .map((session, i) => ({
        id: i + 1,
        ...session
      }))
      .slice(
        (this.page - 1) * this.pageSize,
        (this.page - 1) * this.pageSize + this.pageSize
      );
  }
}
