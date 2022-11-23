import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BuilderModule } from '@builder.io/angular';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from "@angular/common";
import { HttpHeaders } from '@angular/common/http';

const API_URL = "https://csi-event.com/apiv2";
var headers= new HttpHeaders()
  .set('content-type', 'application/html')
  .set('Access-Control-Allow-Headers', 'Content-Type')
  .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  .set('Access-Control-Allow-Origin', '*');


@Component({
  selector: 'app-farm-progress',
  templateUrl: './farm-progress.component.html',
  styleUrls: ['./farm-progress.component.scss']
})
export class FarmProgressComponent implements OnInit {

  closeResult: string;
  modalReference: NgbModal;

  eventID: String;
  eventType: String;
  eventName: String;
  tradeShowEvent: String;
  eventInfoText: String;
  showStartDate: String;
  showEndDate: String;
  typeEvent: String;
  errorCode: String;
  eventInviteOnly: String;
  eventResults: any[];
  eventCode: String;
  builderIOID: String;
  recommendedUsers;
  recommendedSessions;
  allSessions: any[];
  sendMessageUid: string;
  messageSending: string;
  regUid: string;
  allExhibitors: any[];


  name = 'Angular';

  @ViewChild('modalPopupTrigger', {static : true}) modalPopupTrigger:ElementRef;

  constructor(private modalService: NgbModal, private httpClient: HttpClient, private activatedRoute: ActivatedRoute) {
    imports: [
      BuilderModule.forRoot('95987ae43674442f9f69697d1ca04156'),
      CommonModule
    ]

    if (localStorage.getItem("Authorization")) {
      headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Access-Control-Allow-Headers', 'Content-Type')
      .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .set('Access-Control-Allow-Origin', '*')
      .set('Authorization', localStorage.getItem("Authorization"));
    }

   }


  // ******* GOOGLE API *********//

  title = 'Google Pay Demo';

  paymentRequest: google.payments.api.PaymentDataRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [
      {
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['AMEX', 'VISA', 'MASTERCARD']
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: 'example',
            gatewayMerchantId: 'exampleGatewayMerchantId'
          }
        }
      }
    ],
    merchantInfo: {
      merchantId: '12345678901234567890',
      merchantName: 'Demo Merchant'
    },
    transactionInfo: {
      totalPriceStatus: 'FINAL',
      totalPriceLabel: 'Total',
      totalPrice: '0.10',
      currencyCode: 'USD',
      countryCode: 'US'
    },
    callbackIntents: ['PAYMENT_AUTHORIZATION']
  };

  onLoadPaymentData = (
    event: Event
  ): void => {
    const eventDetail = event as CustomEvent<google.payments.api.PaymentData>;
    console.log('load payment data', eventDetail.detail);
  }

  onPaymentDataAuthorized: google.payments.api.PaymentAuthorizedHandler = (
    paymentData
    ) => {
      console.log('payment authorized', paymentData);
      return {
        transactionState: 'SUCCESS'
      };
    }

  onError = (event: ErrorEvent): void => {
    console.error('error', event.error);
  }

  // ******* END GOOGLE API *********//

  open(content) {



    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  openPassed(eventPassed, content) {

    var needed_id = eventPassed.srcElement.id.split('send_');
    this.sendMessageUid = needed_id[1].replace(',', '');

    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }


submitRegistration() {
    /*www:8088/csi/event/services/liveEventServices/registerAttendeeToLiveEvent?evtUid=9417281
{
        "attendeeUid": "9544a786-1bb4-452f-8ee9-f2d28c7c1ce3",
        "countryName":"US",
        "addr1":"123 Street Rd.",
        "addr2":"Unit A",
        "cityId":"Chicago",
        "stateId":"IL",
        "zipCode":"60661",
        "eventInviteCd": "aabb65ae",
        "discountCode":"abc12"
}*/

}

exhibitorsList = [];

getExhibitorsList(passedEventID) {
  var EXHIBITORS_API = API_URL + "/csi/event/services/event/getEventExhibitorList?evtUid=" + passedEventID;
  console.log(EXHIBITORS_API);

  this.httpClient.get(EXHIBITORS_API, { headers }).subscribe(data => {
    console.log("Exhibitors");
    console.log(data);
    console.log(data['response']['Error']);
    if (data['response']['Error'] != undefined) {

        var returnedData = data;
        console.log(returnedData);

     // window.location.href='/eventerror';
    }
    else {
      this.exhibitorsList.push(data['response']['exhibitorList']);
      console.log(data['response']['exhibitorList']);
    }
  });


}



getEventData(passedEventID) {
  var GET_EVENT_API = API_URL + "/csi/event/services/event/findByEvtUid/" + passedEventID;

  this.httpClient.get(GET_EVENT_API, { headers }).subscribe(data => {

    console.log(data['response']['Error']);
    if (data['response']['Error'] != undefined) {

     // window.location.href='/eventerror';
    }
    else {

      console.log("event data");
      console.log(data);
      this.eventResults = data['response'].event;

      this.eventID = this.eventResults['id'];
      this.eventType = this.eventResults['evtType'];
      this.eventName = this.eventResults['evtName'];
      this.tradeShowEvent = this.eventResults['tradeShowEvent'];

      this.eventInfoText = this.eventResults['eventInfoText'];
      this.showStartDate = this.eventResults['showStartDate'];
      this.showEndDate = this.eventResults['showEndDate'];
      this.typeEvent = this.eventResults['tradeShowEvent'];

      this.eventInviteOnly = this.eventResults['evtInviteOnlyFlag'];
      this.eventCode = this.eventResults['eventInvitedCd'];

      this.builderIOID = "d8a95230b7a3482eb5caae1de5c01d93";
      //this.builderIOID = this.eventResults['builderID']

      console.log(this.eventCode);

      if (this.eventCode != '' ) {
        //event has passcode and user must validate themselfs

        if (localStorage.getItem('eventVerified') == 'true') {
          // User has validated

        }
        else {
          window.location.href='/eventverify/' + this.eventID;
        }

      }

    }

  })

}

public processRegistration() {

  console.log("process registration");
  this.setRegistrationForAttendee();
}

public setRegistrationForAttendee() {

  //var REG_API = API_URL + "/csi/event/services/analyticsServices/getMLRecommendationCustomQuery?recommendationNameAndParams=getPersonalityQuestions";
  var REG_API = API_URL + "/csi/event/services/liveEventServices/expressAttendeeEventRegistration"

  console.log("Set Registration:");
  console.log(REG_API);
  var REG_FIELDS = {
    "attendeeUid": localStorage.getItem("attendeeUid"),
    "evtUid": this.eventID,
    "eventInvitedCd": localStorage.getItem("eventInvitedCd")
   }
   console.log("Setting Registration");
   console.log(REG_FIELDS);

  this.httpClient.post<any>(REG_API, REG_FIELDS, { headers }).subscribe(data => {
    console.log("inside registration");
    console.log(data);

    // Check to see if "SUCCESS" Message Happens, but there is still a problem
    // If an error occurs but "SUCCESS - 200" happens, data['response'].invalidProperty will have a value
    // If that has a value, stop execution and alert user to fix it
    if (data['response'].invalidProperty !== undefined) {
        this.errorCode = data['response'].invalidProperty;
    } else {

    }
  });
}


public getPersonalityQuestions() {
  var PERSONALITY_API = API_URL + "/csi/event/services/analyticsServices/getMLRecommendationCustomQuery?recommendationNameAndParams=getPersonalityQuestions";

  this.httpClient.get(PERSONALITY_API, { headers }).subscribe(data => {

    if (data['response']['Error'] != undefined) {
      console.log(data['response']['Error']);
    }
    else {
      return data['response'];
    }
  });

}

public getPersonalityPredictor() {
  var PREDICTOR_API = API_URL + "/csi/event/services/analyticsServices/getMLRecommendationCustomQuery?recommendationNameAndParams=evaluatePersonalityTraits%201%201%201%201%201%201%201%201%201%201";


  this.httpClient.get(PREDICTOR_API, { headers }).subscribe(data => {


    if (data['response']['Error'] != undefined) {
      console.log(data['response']['Error']);

    }
    else {
      return data['response'];
    }
  });
}


public getAllSessions() {
  var SESSIONS_API = API_URL + "/csi/event/services/event/getAllEventSessions?evtUid=" + this.eventID;


  this.httpClient.get(SESSIONS_API, { headers }).subscribe(data => {
    if (data['response']['Error'] != undefined) {
      console.log(data['response']['Error']);

    }
    else {
      var sessionInfo = [];
        // GET COSTS FOR SESSIONS AND ADDITIONAL INFO
        console.log("all sessions");

        sessionInfo = data['response'];

        if (data['response']['sessions'] === undefined) {
          console.log("NONE");

        } else {
          this.allSessions = sessionInfo['sessions'][0];
        }

        console.log(this.allSessions);


      return sessionInfo;
    }
  });

}

public getSessionDiscounts() {
  var DISCOUNTS_API = API_URL + "/csi/event/services/analyticsServices/getMLRecommendationCustomQuery?recommendationNameAndParams=getAvailableDiscounts%20256%201";

  this.httpClient.get(DISCOUNTS_API, { headers }).subscribe(data => {
    if (data['response']['Error'] != undefined) {
      console.log(data['response']['Error']);

    }
    else {
      return data['response'];
    }
  });

}


public getRecommendedSessions() {
  var aID = localStorage.getItem("attendeeUid");
  var rID = this.regUid;
  var eID = this.eventID;

  //var RECOMMENDED_API = API_URL + "/csi/event/services/analyticsServices/getMLRecommendationCustomQuery?recommendationNameAndParams=getSessionRecommendations%20123456%201100352";
  var RECOMMENDED_API = API_URL + "/csi/event/services/analyticsServices/getMLRecommendationCustomQuery?recommendationNameAndParams=matchAttendeeByInterest"+ eID + "%20" + rID;
  //	GET	evtUid & regUid as QueryParam"

  console.log(RECOMMENDED_API)

  this.httpClient.get(RECOMMENDED_API, { headers }).subscribe(data => {
    if (data['response']['Error'] != undefined) {
      console.log(data['response']['Error']);

    }
    else {
      this.recommendedSessions = data['response'][0]['Recommendation'];

      return data['response'][0].Recommendations;
    }
  });

}

public getRecommendedUsers() {
  var aID = localStorage.getItem("attendeeUid");
  var rID = this.regUid;
  var eID = this.eventID;

   // GET	evtUid, regUid as URL PARAMS - SEPARATED BY SPACE
   //var RECOMMENDED_API = API_URL + "/csi/event/services/analyticsServices/getMLRecommendationCustomQuery?recommendationNameAndParams=matchAttendeeByInterest%20623%202112906";
   var RECOMMENDED_API = API_URL + "/csi/event/services/analyticsServices/getMLRecommendationCustomQuery?recommendationNameAndParams=matchAttendeeByInterest"+ eID + "%20" + rID;;


   this.httpClient.get(RECOMMENDED_API, { headers }).subscribe(data => {
    if (data['response']['Error'] != undefined) {
      console.log(data['response']['Error']);

    }
    else {

      console.log(data);
      /* SAMPLE RESULTS
       ""regUid"": 1357181,
                        ""Topics"": ""artificial intelligence vehicle technology content streaming service digital health software apps mobile payment digital finance commerce smart city smart home telecommunication wireless service artificial intelligence vehicle technology content streaming service digital health software apps mobile payment digital finance commerce smart city smart home telecommunication wireless service"",
                        ""InterestScore"": 0.8181818182,
                        ""Name"": ""Andreas Ropel"",
                        ""Email"": ""andreas.ropel@volvocars.com""
      */

      if (data['response'][0]['Recommendation'] === undefined) {
        console.log("NO USERS");

      } else {
        this.recommendedUsers = data['response'][0]['Recommendation'];
      }
      console.log(data);
      return data['response'];
    }
  });

}

public setMessagesToAttendee() {
   // first we use the regUid to grab that users attendeeUid
  var attendeeUidToSend = "";

   var REGUID_API = API_URL + "/csi/event/services/users/getAttendeeUidFromRegUid?regUid=" + this.sendMessageUid;

   this.httpClient.get(REGUID_API, { headers }).subscribe(data => {

    console.log(data['response']['Error']);
    if (data['response']['Error'] != undefined) {

     // window.location.href='/eventerror';
    }
    else {
      attendeeUidToSend = data['response']['attendeeUid'];


    }

  })


   var MSG_API = API_URL + "/csi/event/services/liveEventServices/postAttendeeMessage";


    console.log('user uid: ' + this.sendMessageUid);
    console.log('message: ' + this.messageSending);



   var messageFields = {
    //"attendeeUid": attendeeUidToSend,
    "attendeeUid": localStorage.getItem("attendeeUid"),
    "evtUid": this.eventID,
    "respondedFlag": '',
    "chatType": "Message",
    "subjectText": this.messageSending,
    "replyType": null,
    "sender": localStorage.getItem("attendeeUid")
   }

  this.httpClient.post<any>(MSG_API, messageFields, { headers }).subscribe(data => {
    console.log(data);

    // Check to see if "SUCCESS" Message Happens, but there is still a problem
    // If an error occurs but "SUCCESS - 200" happens, data['response'].invalidProperty will have a value
    // If that has a value, stop execution and alert user to fix it
    if (data['response'].invalidProperty !== undefined) {
        this.errorCode = data['response'].invalidProperty;
    } else {

    }
  });

}


  addEventCall () {
    $("#addNewEvent").trigger( "click" );
  }


   contentLoaded(data) {
    // Data object (via the output $event) includes your custom fields, e.g. if you have a custom field named
    // "title"
    document.title = data.data.title
    console.log("Loading Content");
  }

  ngAfterViewInit() {

    $('.fa-envelope').css("font-weight", "bold");
    $('.fa-bell').css("font-weight", "bold");




  setTimeout(() =>{
    //this.modalPopupTrigger.nativeElement.click();

    var buildersHeight = $(".builder-columns").outerHeight();

    console.log($(".builder-columns").outerHeight());
    $("builder-component").height(buildersHeight);

  }, 500)

    setTimeout(function(){
      // Loading and Replacing BuilderIO Components
      let countdownClockDiv = $( "#clockdiv" ).clone();
      console.log(countdownClockDiv);
      $( "#clockdiv" ).html(" ");
      //$( "div[data-builder-component='countdown']" ).html(countdownClockDiv);


      let calendarComponent = $( "#demoCalendar" ).clone();
      console.log(calendarComponent);
      $( "#demoCalendar" ).html(" ");
     // $( "div[data-builder-component='calendar']" ).html(calendarComponent);


      // Auto Load Modal for Polling
      var checkPolling = localStorage.getItem('pollingAnswered');


      if (checkPolling) {
        console.log('checked');
      }
      else {
        console.log('not checked');


      }


    },2000);

  }
  public sendGetRequest(){
   // return this.httpClient.get(this.REST_API_SERVER, { headers });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }


  data = {
    property: 'hello',
    fn: (text: string) => alert(text),
  };

  load(event: any) {
    console.log('load', event);

  }

  error(event: any) {
    console.log('error', event);
  }


  showTab(passedVal) {
    console.log(passedVal);
    $( "div" ).removeClass( "active-tab" );
    $( "div" ).removeClass( "hide-tab" );
    $(".my-tabs").addClass('hide-tab');
    let activeDiv = "." + passedVal;
    console.log(activeDiv);
    $(activeDiv).removeClass('hide-tab');
    $(activeDiv).addClass('active-tab');

  }

runSave() {
  window.location.href="/eventmetrics/3980ASDAS";
}



  ngOnInit(): void {
    $('#main-wrapper').toggle();

      localStorage.setItem("loadModal", '0');

    let paramID = this.activatedRoute.snapshot.params.id;
    this.eventID = paramID;

    this.getEventData(paramID);
    this.getExhibitorsList(paramID);

    function runSave() {
        //alert('Your event was saved successfully.\n\nYou will be directed to the builder for the event.');
        window.location.href="/eventmetrics/3980ASDAS";

    }

    console.log("Recommended Sessions: ");
    this.getRecommendedSessions();

    console.log("Exhibitors");
    //this.getExhibitorsList(paramID);


    console.log("Recommended Users: ");
    this.getRecommendedUsers();

    this.getAllSessions();

    function getTimeRemaining(endtime) {
      //const total = Date.parse(endtime) - Date.parse(new Date());
     /* const seconds = Math.floor((total / 1000) % 60);
      const minutes = Math.floor((total / 1000 / 60) % 60);
      const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
      const days = Math.floor(total / (1000 * 60 * 60 * 24));

      return {
        total,
        days,
        hours,
        minutes,
        seconds
      };*/
    }

    function initializeClock(id, endtime) {
      const clock = document.getElementById(id);
      const daysSpan = clock.querySelector('.days');
      const hoursSpan = clock.querySelector('.hours');
      const minutesSpan = clock.querySelector('.minutes');
      const secondsSpan = clock.querySelector('.seconds');

      function updateClock() {
        const t = getTimeRemaining(endtime);

        //daysSpan.innerHTML = t.days;
     /*   hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
        minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
        secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);
    */
      /*  if (t.total <= 0) {
          clearInterval(timeinterval);
        }*/
      }

      updateClock();
      const timeinterval = setInterval(updateClock, 1000);
    }



   // const deadline = new Date(Date.parse(new Date()) + 15 * 24 * 60 * 60 * 1000);
   // initializeClock('clockdiv', deadline);





  }


}
$(function() {

  //$('#eventType').selectpicker();



   $('.tab-content:first-child').show();
   $('.tab-nav-link').bind('click', function(e) {

    console.log("Event ID: 230849682");

    let myThis = $(this);
     console.log(myThis);
     //let myTabs = myThis.parent().parent().next();
     let target = $(myThis.data("target")); // get the target from data attribute
     myThis.siblings().removeClass('current');
     target.siblings().css("display", "none")
       myThis.addClass('current');
       target.fadeIn("fast");

   });
   $('.tab-nav-link:first-child').trigger('click');
 });
