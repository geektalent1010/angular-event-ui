import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { filterValues, fields, groupby } from './mock-data';
const REPORTS_API_URL: string = 'http://127.0.0.1:5000/api';
// const REPORTS_API_URL: string = 'https://csi-event.com:8050/api';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  baseURL: string = REPORTS_API_URL + '/reports';
  constructor(private http: HttpClient) {}
  getEventCodes(show_id: string): any {
    const endpoint = '/getEventCodes';
    return this.http
      .get(this.baseURL + endpoint, {
        params: { show_id }
      })
      .pipe(
        retry(5),
        catchError(err => {
          return of([]);
        })
      );
  }

  getFilters() {
    return of(
      filterValues.map((x, index) => {
        return { id: index, label: x.name };
      })
    );
  }
  getFilterValues(filterName) {
    return of(
      filterValues
        .filter(x => x.name == filterName)[0]
        .values.map((x, index) => {
          return { id: index, label: x };
        })
    );
  }
  getFields() {
    return of(this.formatForDropdown(fields));
  }
  getGroupby() {
    return of(this.formatForDropdown(groupby));
  }
  private formatForDropdown(arr) {
    return arr.map((x, index) => {
      return { id: index, label: x };
    });
  }
}
