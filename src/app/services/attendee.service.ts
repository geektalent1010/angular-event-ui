import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AttendeeService {

  eventsUrl = 'http://www.csi-event.com:8088/csi/event/services/attendeeServices/getAttendeeRegisteredEventList?attendeeUid=';
  personalUrl = 'http://www.csi-event.com:8088/csi/event/services/users/getUserLogin?username=devUser1&password=password';
  attendeeUid = '749c1770-94ff-4004-b72f-9de01041f621';

  constructor(private http: HttpClient) { }
/*
  getPersonal(): Observable<any> {
   // return this.http.get<any>(this.personalUrl);
  }

  getEvents(uid): Observable<any> {
    uid = this.attendeeUid;
   // return this.http.get<any>(this.eventsUrl + uid);
  }
*/
}
