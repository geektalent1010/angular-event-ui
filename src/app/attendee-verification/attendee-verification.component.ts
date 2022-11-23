import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { API_URL } from '../services/url/url';

var headers= new HttpHeaders()
.set('content-type', 'application/json')
  .set('Access-Control-Allow-Headers', 'Content-Type')
  .set('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS')
  .set('Access-Control-Allow-Origin', '*');

@Component({
  selector: 'app-attendee-verification',
  templateUrl: './attendee-verification.component.html',
  styleUrls: ['./attendee-verification.component.scss']
})
export class AttendeeVerificationComponent implements OnInit {

  newpassword: String;
  newpasswordverf: String;
  onetimepassword: String;
  paramID: String;
  username: String;
  API_PASSWORD_CHANGE = API_URL + "/csi/event/services/users/changeUserPassword";

  constructor(private httpClient: HttpClient, private activatedRoute: ActivatedRoute) {

    if (localStorage.getItem("Authorization")) {
      headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Access-Control-Allow-Headers', 'Content-Type')
      .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .set('Access-Control-Allow-Origin', '*')
      .set('Authorization', localStorage.getItem("Authorization"));
    }

   }


  updatePassword() {
    //alert('yes');
    this.getVerification();

    //localStorage.setItem('activeFlag', "true");
    //window.location.href='/';
  }

  getVerification() {

    var changePassFields =  {
      'username': this.username,
      'oldPass': this.onetimepassword,
      'newPass': this.newpassword
   };

    var ATTENDEE_API = API_URL + "/csi/event/services/users/findByAttendeeUid/" + this.paramID;
    console.log(ATTENDEE_API);

    this.httpClient.get(ATTENDEE_API, { headers }).subscribe(data => {


      if (data['response']['Error'] != undefined) {
        console.log(data['response']['Error']);

      }
      else {
        this.username = data['response']['addUserid'];
        changePassFields['username'] = this.username;
        console.log(changePassFields);

        console.log(data);

        //verified so set localStorage for User Access
        localStorage.setItem("activeFlag", "true");
        localStorage.setItem('userId', data['response']['addUserid']);
        localStorage.setItem('attendeeUid', data['response']['attendeeUid']);
        localStorage.setItem('userTypeCode', data['response']['userTypeCode']);
        localStorage.setItem('firstName', data['response']['firstName']);
        localStorage.setItem('nameLast', data['response']['nameLast']);

        console.log("ChangePassFields");
        console.log(changePassFields)

         this.httpClient.post<any>(this.API_PASSWORD_CHANGE, changePassFields, { headers }).subscribe(data => {

           console.log(data);

           if (data['response']['Error'] != undefined) {
             console.log(data['response']['Error']);

           }
           else {
            alert("Thank You, your account has been verified");
            window.location.href = '/';

            //return data['response'];
           }
         });

      }
    });
  }

  ngOnInit(): void {

    this.paramID = this.activatedRoute.snapshot.params.id;
    console.log(this.paramID);

  }

}
