import { DashboardModule } from './dashboard.module';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { of } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  CARD_DECK_DATA,
  SNAPSHOT_DATA,
  AttendeeCompany,
  ExhibitorCompany,
  TOP10_DECK_DATA,
  MAP_DECK_DATA
} from './mock-data';
import { CardDeck } from './card-deck';
import { SnapshotDeck } from './snapshot-deck';
import { Card } from './card';
import { Top10Deck } from './top10-deck';
import { MapDataDeck } from './map-deck';

const DASHBOARD_API_URL: string = 'https://csi-event.com:8050/api';
// const DASHBOARD_API_URL: string = 'http://127.0.0.1:5000/api'
  // API_URL: string = 'https://csi-event.com:8050/api';
@Injectable()
export class DashboardService {
  // baseURL: string = 'http://127.0.0.1:8000/api/dashboard';

  baseURL: string = DASHBOARD_API_URL + '/dashboard';
  // baseURL: String = 'https://csi-event.com:8050/api/dashboard';
  constructor(private http: HttpClient) {}
  // private handleError<T>(operation = 'operation', result?: T) {
  //   return (error: any): Observable<T> => {
  //     // TODO: better job of transforming error for user consumption
  //     console.log(`${operation} failed: ${error.message}`);

  //     // Let the app keep running by returning an empty result.
  //     return of(result as T);
  //   };
  // }
  // getCardDecks(): CardDeck[] {
  //   return CARD_DECK_DATA;
  // }

  urlBuilder(rowno: number, colno: number) {
    return `${this.baseURL}/row${rowno}/col${colno}/`;
  }
  getCardDeck(
    show_id_0: string,
    evt_uid_0: string,
    show_id_1: string,
    evt_uid_1: string,
    colno: number,
    dateRangeSelection: string = '4'
  ): any {
    const rowno = 1;
    return this.http
      .get(this.urlBuilder(rowno, colno), {
        params: {
          show_id_0,
          evt_uid_0,
          show_id_1,
          evt_uid_1,
          dateRangeSelection
        }
      })
      .pipe(
        retry(5),
        catchError(err => {
          console.log('err');
          console.log(err);
          return of([]);
        })
      );
  }

  getSnapShotDeck(
    show_id: string,
    evt_uid: string,
    colno: number,
    dateRangeSelection: string = '4'
  ): any {
    // only current year's data
    const rowno = 2;
    return this.http
      .get(this.urlBuilder(rowno, colno), {
        params: { show_id, evt_uid, dateRangeSelection }
      })
      .pipe(
        retry(5),
        catchError(err => {
          console.log('err');
          console.log(err);
          return of([]);
        })
      );
  }

  getChartData(
    show_id_0: string,
    evt_uid_0: string,
    show_id_1: string,
    evt_uid_1: string,
    show_id_2: string,
    evt_uid_2: string,
    rowno: number,
    colno: number
    // dateRangeSelection: string = '4'
  ): any {
    return this.http
      .get(this.urlBuilder(rowno, colno), {
        params: {
          show_id_0,
          evt_uid_0,
          show_id_1: show_id_1 ? show_id_1 : '1',
          evt_uid_1: evt_uid_1 ? evt_uid_1 : '1',
          show_id_2: show_id_2 ? show_id_2 : '1',
          evt_uid_2: evt_uid_2 ? evt_uid_2 : '1'
          // dateRangeSelection
        }
      })
      .pipe(
        retry(5),
        catchError(err => {
          console.log('err');
          console.log(err);
          return of([]);
        })
      );
  }

  getTableDeck(
    show_id: string,
    evt_uid: string,
    colno: number,
    dateRangeSelection: string = '4'
  ): any {
    const rowno = 5;
    return this.http
      .get(this.urlBuilder(rowno, colno), {
        params: { show_id, evt_uid, dateRangeSelection }
      })
      .pipe(
        retry(5),
        catchError(err => {
          console.log('err');
          console.log(err);
          return of([]);
        })
      );
  }

  getMostCurrentThreeShows(show_id: string, evt_uid: string): any {
    return this.http
      .get(DASHBOARD_API_URL + '/get_client_most_recent_three_shows', {
        params: { show_id, evt_uid }
      })
      .pipe(
        retry(5),
        catchError(err => {
          console.log('err');
          console.log(err);
          return of([]);
        })
      );
  }

  getMapDeck(
    show_id: string,
    evt_uid: string,
    colno: number,
    dateRangeSelection: string = '4'
  ): any {
    const rowno = 6;
    return this.http
      .get(this.urlBuilder(rowno, colno), {
        params: { show_id, evt_uid, dateRangeSelection }
      })
      .pipe(
        retry(5),
        catchError(err => {
          console.log('err');
          console.log(err);
          return of([]);
        })
      );
  }
}
