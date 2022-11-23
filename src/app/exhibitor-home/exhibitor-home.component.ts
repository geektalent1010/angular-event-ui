import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { API_URL } from '../services/url/url';

var headers= new HttpHeaders()
  .set('content-type', 'application/json')
  .set('Access-Control-Allow-Headers', 'Content-Type')
  .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  .set('Access-Control-Allow-Origin', 'https://csi-event.com');


@Component({
  selector: 'app-exhibitor-home',
  templateUrl: './exhibitor-home.component.html',
  styleUrls: ['./exhibitor-home.component.scss']
})
export class ExhibitorHomeComponent implements OnInit {

  constructor( private httpClient: HttpClient ) {

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
  public tmpEventLists: any;
  newEventList: any[];
  attendeeUid: any;
  eventListingArray: any;



  ngOnInit(): void {
    this.attendeeUid = localStorage.getItem("attendeeUid");
    this.getEvents();

  }
  sessionListing = [];

  public getEvents() {

    var clientId = 131;

    // first, loop throuh available e
    var EVENT_LIST_API = API_URL + "/events";

    localStorage.setItem("tmpArray", "");
    var userId = localStorage.getItem('userId');
    // override
    userId = "informa_user";

          var EXHIBITOR_URL = API_URL + "/csi/event/services/event/getEventExhibitorListByClientInfo?attendeeUid=" + this.attendeeUid + "&userId=" + userId + "&clientId=" + clientId;
          console.log(EXHIBITOR_URL);

          this.httpClient.get(EXHIBITOR_URL, {headers}).subscribe(data_exh => {
            // push comment, again
            console.log(data_exh);
            if (data_exh['response']['Error'] != undefined) {
              console.log(data_exh['response']['Error']);

            }
            else {
              var eventActiveExhibitorProfileWithDashboardsList = data_exh['response']['eventActiveExhibitorProfileWithDashboardsList']
              // ['exhibitorListWithDashboards'];

              if (eventActiveExhibitorProfileWithDashboardsList.length > 0) {
                eventActiveExhibitorProfileWithDashboardsList.forEach((message_exh: any) => {

                  var exhibitorWithDashboards = message_exh['activeExhibitorProfileWithDashboards'];
                  var sessionDashboardLink = '';

                  if (exhibitorWithDashboards['dashboardUrls']['attendeeSessionDashboard'] != '') {
                    sessionDashboardLink = '<a target="_new" href=\'' + exhibitorWithDashboards['dashboardUrls']['attendeeSessionDashboard'] + '\'><i class="fas fa-user-clock"></i></a>';
                  }

                  var eventInfo = {
                    "evtName": message_exh['event']['evtName'],
                    "evtUid" : message_exh['event']['evtUid'],
                    "showStartDate": exhibitorWithDashboards['activeExhibitorProfile']['showStartDate'],
                    "eventDashboardUrl" : exhibitorWithDashboards['dashboardUrls']['eventDashboardUrl'],
                    "attendeeMetricsDashboard" : exhibitorWithDashboards['dashboardUrls']['attendeeMetricsDashboard'],
                    "attendeeSessionDashboard" : sessionDashboardLink,
                  }
                  this.sessionListing.push(eventInfo);
                });
              }
            }
          });

  }

}
