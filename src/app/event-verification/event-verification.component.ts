import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';


var headers= new HttpHeaders()
.set('content-type', 'application/json')
.set('Access-Control-Allow-Headers', 'Content-Type')
.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
.set('Access-Control-Allow-Origin', '*');

@Component({
  selector: 'app-event-verification',
  templateUrl: './event-verification.component.html',
  styleUrls: ['./event-verification.component.scss']
})



export class EventVerificationComponent implements OnInit {

  eventPasscode: string;

  constructor( private httpClient: HttpClient, private activatedRoute: ActivatedRoute) {

    if (localStorage.getItem("Authorization")) {
      headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Access-Control-Allow-Headers', 'Content-Type')
      .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .set('Access-Control-Allow-Origin', '*')
      .set('Authorization', localStorage.getItem("Authorization"));
    }

  }

  public checkPassword() {

    localStorage.setItem("eventVerified", "true");
    localStorage.setItem("eventInviteCd", this.eventPasscode);

    let eventID = this.activatedRoute.snapshot.params.id;

    window.location.href='/event/' + eventID;
  }


  ngOnInit(): void {
  }

}
