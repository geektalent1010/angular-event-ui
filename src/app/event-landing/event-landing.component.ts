import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import slugify from 'slugify';
import { of } from 'rxjs';
import { catchError, tap, retry } from 'rxjs/operators';
const API_URL = 'https://www.csi-event.com:8050/api';
var headers = new HttpHeaders()
  .set('content-type', 'application/json')
  .set('Access-Control-Allow-Headers', 'Content-Type')
  .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  .set('Access-Control-Allow-Origin', 'http://csi-event.com');

@Component({
  selector: 'app-event-landing',
  templateUrl: './event-landing.component.html',
  styleUrls: ['./event-landing.component.scss']
})
export class EventLandingComponent implements OnInit {
  constructor(private httpClient: HttpClient) {

    if (localStorage.getItem("Authorization")) {
      headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Access-Control-Allow-Headers', 'Content-Type')
      .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .set('Access-Control-Allow-Origin', '*')
      .set('Authorization', localStorage.getItem("Authorization"));
    }

  }

  eventsList: any[];
  tmpEventLists: any;
  newEventList: any[];
  attendeeUid: any;
  addUserid: string;
  dtOptions: DataTables.Settings = {};

  ngOnInit(): void {
    this.attendeeUid = localStorage.getItem('attendeeUid');
    this.addUserid = localStorage.getItem('addUserid')
      ? localStorage.getItem('addUserid')
      : '';
    this.getEvents();
    this.dtOptions = {
      pagingType: 'full_numbers'
    };
  }

  evtListings = [];

  public getEvents() {

    // var clientId = 191;
    var clientId = '106';
    var trsId = 'FNCE';
    // first, loop throuh available
    // var EVENT_LIST_API = API_URL + '/events';

    localStorage.setItem('tmpArray', '');
    var userId = localStorage.getItem('userId');
    // override
    userId = 'informa_user';


    // var EXHIBITOR_URL =
    //   API_URL +
    //   '/csi/event/services/event/getEventDashboardListByClientInfo?attendeeUid=' +
    //   this.attendeeUid +
    //   '&userId=' +
    //   userId +
    //   '&clientId=' +
    //   clientId;
    // console.log(EXHIBITOR_URL);

    var EXHIBITOR_URL = `${API_URL}/getEventListByClientId`;
    this.httpClient
      .get<any>(EXHIBITOR_URL, {
        params: { client_id: clientId, trs_id: trsId }, headers: headers
      })
      .pipe(
        retry(3),
        catchError(err => {
          console.log('err');
          console.log(err);
          return of([]);
        })
      )
      .subscribe(res => {
        res.eventsInfoList.map(x => {
          this.evtListings.push({
            evtName: x.evtName,
            evtUid: x.evtUid,
            showId: x.showId
          });
        });
      });
    // var evtInfo = {
    //   evtName: 'HRS 21',
    //   eventSlug: slugify('HRS 21', { lower: true }),
    //   evtUid: '661'
    // };

    // this.evtListings.push(evtInfo);
    // var evtInfo = {
    //   evtName: 'FNCE 21',
    //   eventSlug: slugify('FNCE 21', { lower: true }),
    //   evtUid: '727'
    // };
    // this.evtListings.push(evtInfo);

    // this.httpClient.get(EXHIBITOR_URL, {headers}).subscribe(data_exh => {
    //   // push comment, again
    //   console.log(data_exh);
    //   if (data_exh['response']['Error'] != undefined) {
    //     console.log(data_exh['response']['Error']);
    //   }
    //   else
    //   {
    //     var eventActiveExhibitorProfileWithDashboardsList = data_exh['response']['eventActiveExhibitorProfileWithDashboardsList']
    //     // ['exhibitorListWithDashboards'];

    //     eventActiveExhibitorProfileWithDashboardsList.forEach((message_exh: any) => {

    //     var exhibitorWithDashboards = message_exh['activeExhibitorProfileWithDashboards'];
    //     var sessionDashboardLink = null;
    //     var attendeeMetricsDashboard = null;

    //     if (exhibitorWithDashboards['dashboardUrls']['attendeeMetricsDashboard'] != '') {
    //       attendeeMetricsDashboard = exhibitorWithDashboards['dashboardUrls']['attendeeMetricsDashboard'];
    //     }

    //     if (exhibitorWithDashboards['dashboardUrls']['attendeeSessionDashboard'] != '') {
    //       sessionDashboardLink = exhibitorWithDashboards['dashboardUrls']['attendeeSessionDashboard'];
    //     }

    //     var eventInfo = {
    //       "evtName": message_exh['event']['evtName'],
    //       "eventSlug": slugify(message_exh['event']['evtName'], {lower: true}),
    //       "evtUid" : message_exh['event']['evtUid'],
    //       "showStartDate": message_exh['event']['showStartDate'],
    //       "addUserid" : message_exh['event']['addUserid']? message_exh['event']['addUserid']:'',
    //       "showEndDate": message_exh['event']['showEndDate'],
    //       "eventDashboardUrl" : exhibitorWithDashboards['dashboardUrls']['eventDashboardUrl'],
    //       "attendeeMetricsDashboard" : attendeeMetricsDashboard,
    //       "attendeeSessionDashboard" : sessionDashboardLink,
    //     }
    //     this.evtListings.push(eventInfo);
    //   });
    // }
    // var eventInfo = {
    //   "evtName": 'World of Concrete',
    //   "eventSlug": slugify('World of Concrete', {lower: true}),
    //   "eventDashboardUrl" : 'http://3.19.40.177:9088/superset/dashboard/WOC20_1100049/',
    //   "attendeeMetricsDashboard" : 'http://3.19.40.177:9088/superset/dashboard/Google/',
    //   "attendeeSessionDashboard" : 'http://3.19.40.177:9088/superset/dashboard/WOC20_1100049_ICRITH/',
    // }
    // this.evtListings.push(eventInfo);
    // eventInfo = {
    //   "evtName": 'HRS',
    //   "eventSlug": slugify('HRS', {lower: true}),
    //   "eventDashboardUrl" : 'http://3.19.40.177:9088/superset/dashboard/672/',
    //   "attendeeMetricsDashboard" : '',
    //   "attendeeSessionDashboard" : '',
    // }
    // this.evtListings.push(eventInfo);
    // });
  }
}
