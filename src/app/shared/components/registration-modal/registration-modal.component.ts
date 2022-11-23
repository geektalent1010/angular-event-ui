import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { BuilderModule } from '@builder.io/angular';
import { CommonModule } from "@angular/common";
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import $ from 'jquery';
import { FormControl, FormGroup } from '@angular/forms';
import Stepper from 'bs-stepper';
import { AfterViewInit } from '@angular/core';
import { ModalOptions } from 'ngx-bootstrap/modal';
import { CalendarComponent } from 'src/app/components/calendar/calendar.component';
import { SessionServiceService } from 'src/app/services/session-service.service';
import { ImageConstants } from '../../../event-pages/imageConstants';
import { emit } from 'process';
import { API_URL, API_URL2 } from 'src/app/services/url/url';

var headers= new HttpHeaders()
  .set('content-type', 'application/json')
  .set('Access-Control-Allow-Headers', 'Content-Type')
  .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  .set('Access-Control-Allow-Origin', '*');

@Component({
  selector: 'app-registration-modal',
  templateUrl: './registration-modal.component.html',
  //template: '<builder-component name="page" [entry]="d8a95230b7a3482eb5caae1de5c01d93"></builder-component>',
  styleUrls: ['./registration-modal.component.scss'],
  providers: [DatePipe]
})
export class RegistrationModalComponent implements OnInit, AfterViewInit {

  modalReference: NgbModal;
  stepper: Stepper;
  rates:any =[];
  eventCosts = [];
  eventName: String;
  eventVenueAddress: String;
  eventVenueCity: String;
  eventVenueState: String;
  eventVenuePostalCode: String;
  eventDescription: String;
  privacyPolicy = false;
  termsAndConditions = false;

  questions: Array<{}>;
  goals: Array<{}>;
  qualifications:any = {};

  photoID: any;
  payStub: any;
  taxIDNumber: any;
  busLi: any;

  image = ImageConstants.image;

  category: string;
  subCategory: string;
  addUserid: string;
  eventID: string;
  eventType: String;
  startDate: String;
  endDate: String;
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
  closeResult: string;
  recommendedUsers;
  recommendedSessions;
  allSessions: any[];
  sendMessageUid: string;
  messageSending: string;
  sessionName: string;
  sessionSpeaker: string;
  sessionSynopsis: string;
  sessionStartDate: Date;
  sessionEndDate: Date;
  sessionCost: number;
  sessionDiscount: number;
  sessionType: any;
  sessionPrivateSession: boolean;
  sessionAttendeeCapacity: number;
  regUid: string;
  allExhibitors: any[];
  // menu bar
  attendeeUid: string;
  fontColor: string;
  firstName: string;

  pageKey: string;
  pagePath: string;

  thisURL: any;
  safeURL: any;

  customPages = []
  registration:any = {};
  questionForm = new FormGroup({});
  goalForm = new FormGroup({});
  qualificationsForm = new FormGroup({});
  interestForm = new FormGroup({});

  @ViewChild('modalPopupTrigger', {static : true}) modalPopupTrigger:ElementRef;
  @ViewChild(CalendarComponent) private calendarChild: CalendarComponent;
  @Input() public paramEventId: string;
  @Input() public paramID: string;
  @Output() hide: EventEmitter<any> = new EventEmitter();
  userTypeId: string;
  registrationSubcategory: string = null;
  cart = [];
  paymentAuthorized = true;

  registrationForm = new FormGroup({
    registrationCategory: new FormControl('')
  });
    // ******* GOOGLE API *********//

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
        totalPrice: '600',
        currencyCode: 'USD',
        countryCode: 'US'
      },
      callbackIntents: ['PAYMENT_AUTHORIZATION']
    };

    onLoadPaymentData = (
      event: Event
    ): void => {
      console.log('paymentRequest ', this.paymentRequest);
      const eventDetail = event as CustomEvent<google.payments.api.PaymentData>;
      console.log('load payment data', eventDetail.detail);
      this.paymentAuthorized = false;
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
      console.log('paymentRequest ', this.paymentRequest);
      console.error('error', event.error);
    }

    // ******* END GOOGLE API *********//





    next() {
      console.log('this.stepper ', this.stepper);
      this.stepper.next();
    }

    prev() {
      console.log('this.stepper ', this.stepper);
      this.stepper.previous();
    }

    onSubmit() {
      return false;
    }

  constructor(private modalService: NgbModal, private httpClient: HttpClient, private activatedRoute: ActivatedRoute, private sanitizer: DomSanitizer, private datePipe: DatePipe, private sessionService: SessionServiceService, private cdRef: ChangeDetectorRef) {
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

    this.userTypeId = localStorage.getItem('userTypeCode');


  }



  ngOnInit(): void {


    this.taxIDNumber = localStorage.getItem("taxIDNumber") ? localStorage.getItem("taxIDNumber") : ImageConstants.taxIDNumber,
    this.payStub =  localStorage.getItem("payStub") ? localStorage.getItem("payStub") : ImageConstants.payStub,
    this.busLi = localStorage.getItem("busLi") ? localStorage.getItem("busLi") : ImageConstants.busLi,
    this.photoID = localStorage.getItem("photoID") ? localStorage.getItem("photoID") : ImageConstants.photoID,

    this.attendeeUid = localStorage.getItem('attendeeUid');

        // check if user has attendeeUid session already set, if so display their info bar
        let activeSession = localStorage.getItem('attendeeUid');
        if (activeSession !== null) {
          this.firstName = localStorage.getItem('firstName');
        }

        this.attendeeUid = localStorage.getItem('attendeeUid');

    this.fontColor = "#000";
    console.log('this.activatedRoute.url', this.activatedRoute.url);

    this.paramID = 'world-of-concrete-and-building-show-2022';
    console.log('------>>>> paramEventId', this.paramEventId);

    this.sessionService.set('eventID', this.paramEventId);
    console.log(
      this.sessionService.get('eventID'),
      this.paramEventId
    );

    var EVENT_DATA_API1 = API_URL2 + '/csi/event/services/eventSetupV2/findAllEvtInfoByEvtUid?evtUid=' + this.paramEventId;
    this.httpClient.get(EVENT_DATA_API1, { headers }).subscribe(data => {
      console.log('EVENT_DATA_API1', data);
      if (data && data['response'] && data['response']['Event']) {
        this.eventCosts = data['response'].EventCosts;
        this.eventName = data['response'].Event.evtName;
        this.tradeShowEvent = data['response'].Event.tradeShowEvent;

        this.startDate = this.datePipe.transform(data['response'].Event.startDate, 'MM-dd-yyyy');
        this.endDate = this.datePipe.transform(data['response'].Event.endDate, 'MM-dd-yyyy');
        this.eventID = data['response'].Event.evtUid;

        this.addUserid = data['response'].Event.addUserid;
        this.eventVenueAddress = data['response'].Event.venueAddress;
        this.eventVenueCity = data['response'].Event.venueCity;
        this.eventVenueState = data['response'].Event.venueState;
        this.eventVenuePostalCode = data['response'].Event.venuePostalCode;
        this.eventDescription = data['response'].Event.evtInfoText;
         this.questions = data['response'].questions;
        this.goals = data['response'].goals;
        this.qualifications = data['response'].Qualifications;

        this.paymentRequest.allowedPaymentMethods[0].tokenizationSpecification.parameters['gateway'] = data['response'].GooglePaymentData[0]['gateway'];
        this.paymentRequest.allowedPaymentMethods[0].tokenizationSpecification.parameters['gatewayMerchantId'] = data['response'].GooglePaymentData[0]['gatewayID'];
        this.paymentRequest.merchantInfo.merchantId = data['response'].GooglePaymentData[0]['paymentId'];
      }
    });
    this.pagePath = `${this.activatedRoute.snapshot.params.id}/${this.paramEventId}`;

    //comment
    console.log(this.activatedRoute.snapshot.params.id);
    // parse out the -'s from the url and replace them with %20 to pass to the URL

    var str = this.paramID;
    this.pageKey = str;

    if (str.indexOf('_') != -1) {
      this.pageKey = str.replace(/.+_/g, '');
    }


    if (str.indexOf('_') != -1) {
      str = str.replace('_' + this.pageKey, '');
    }

    console.log(str);

    var toUpperCaseString = str.toUpperCase();

    var parseString = toUpperCaseString.replace(/\-/g, '%20')


    this.paramID = parseString;

    var GET_EVENT_API = API_URL + "/csi/event/services/event/findByEvtName/" + this.paramID;

    console.log(GET_EVENT_API);


    this.getRegistrationData();



  }

  ngAfterViewInit(){
    this.initStepper();
    document.getElementById("defaultOpen").click();

  }

  private initStepper(){
    console.log('stepper', document.querySelector('#stepper1'));
    this.stepper = new Stepper(document.querySelector('#stepper1'), {
      linear: false,
      animation: true
    })
  }

  public openCity(evt, cityName) {
    // Declare all variables
    let i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
  }

  private openPayment(evt, cityName) {
    // Declare all variables
    let i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("paycontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("paylinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
  }

  private getRegistrationData() {


    this.registration = {
      "questions": [
          {
              "question": "Have you attended this show in the past?",
              "options": [
                  "Yes",
                  "No",
              ]
          },
          {
              "question": "What is your Primary Goal for this show?",
              "options": [
                '0 - 5000',
                '5001 - 10000',
                '10001 - 25000',
                '25001 - 50000',
              ]
          },
          {
            "question": "Is your company exhibiting?",
            "options": [
                "Yes",
                "No",
            ]
        },
          {
              "question": "Select ONE that best represents your job title",
              "options": [
                'Chief Executive',
                'Manager',
                'Buyer',
                'Vice President',
                'Staff',
              ]
          },
          {
              "question": "What is your objective for this show"
          },
          {
            "question": "Did you achieve your objective for the show?",
            "options": [
                "Yes",
                "No",
            ]
        },
        {
          "question": "Did you achieve your objective for the session?",
          "options": [
              "Yes",
              "No",
            ]
        },
      ],
      "goals": [
          {
              "category": "Attendee",
              "goal": "This is the goal",
              "options": [
                  "Option A",
                  "Option B",
                  "Option C"
              ]
          },
          {
              "category": "Attendee",
              "goal": "This is the goal with no options"
          }
      ],
      "payment":{
              "googleMerchantId": "GA-352101",
              "rates": {
                  "earlyBirdStartDate": "03/04/2020",
                  "earlyBirdEndDate": "07/04/2021",
                  "earlyBirdRate": 0.01,
                  "preEventBirdStartDate": "03/04/2020",
                  "preEventBirdEndDate": "03/04/2020",
                  "preEventBirdRate": 0.01,
                  "duringEventBirdStartDate": "03/04/2020",
                  "duringEventBirdEndDate": "03/04/2020",
                  "duringEventBirdRate": 0.01
              }
      },
      "interests": [
          {
              "category": "AttendeeInterest",
              "subCategory": "BUILDING & CONSTRUCTION",
              "topics": [
                  "reinforcement tool material",
                  "new tool material"
              ]
          },
          {
              "category": "Attendee",
              "subCategory": "CONSTRUCTION",
              "topics": [
                  "reinforcement tool material",
                  "new tool material"
              ]
          }
      ],
      "qualifications": {
          "taxIDNumber": "data:image/png;base64,iVBORw0KGg",
          "payStub": "data:image/png;base64,iVBORw0KGg",
          "busLi": "data:image/png;base64,iVBORw0KGg",
          "photoID": "data:image/png;base64,iVBORw0KGg"
      },
      "options":[
        "Activate a special access",
        "Use my wallet promo discount",
        "Use Achievement awards",
        "Get RSVP Access",
        "Obtain a RSVP Experience",
        "Get a recommendation for food products",
        "Get lunch recommendations",
        "Get hotel recommendations",
        "COllect data pertaining to event interactions",
        "Get a specific promotion"
      ],
      "achievement":[
        "What do you hope to gain from this experience",
        "Another achievement"
      ],
      "registration":[
        {
          "category":"Exhibitor",
          "refCodes": "EXH",
           "subcategory":["Exhibitor", "Booth", "Staff", "Product Manager", "Speaker"]
        },
        {
          "category":"Attendee",
          "refCodes": "ATT",
          "subcategory":["Corporate", "Student", "Media"]
        },
        {
          "category":"Student",
          "refCodes": "STU",
          "subcategory":["StudentX"]
        }
      ]
  };
  }


  populateQuestions(category, subcategory){
    const feedbackQuestions = {
      "Exhibitor":[
        {
          "question": "Meet and engage with at least 5 new potential customers",
          "checkbox": true,
        },
        {
          "question": "Give away at least 10 product/promotional giveaways or marketing material",
          "checkbox": true,
        },
        {
          "question": "Host at least one networking event after exhibitor floor closing time",
          "checkbox": true,
        },
        {
          "question": "Improve brand image in polls",
          "checkbox": true,
        },
      ],
       "Booth":[
        {
          "question": "Obtain product interest from at least 3 Attendees",
          "checkbox": true,
        },
        {
          "question": "Provide marketing material and/or promotional items to at least 10 Attendees",
          "checkbox": true,
        },
        {
          "question": "Provide product/service demonstrations to at least 5 attendees",
          "checkbox": true,
        },
       ],
       "Staff":[
        {
          "question": "Obtain at least 5 attendee/customer information with 8.0 event poll results",
          "checkbox": true,
        },
        {
          "question": "Obtain data analytics on product interest for 2 products/services",
          "checkbox": true,
        },
        {
          "question": "Obtain attendee feedback score greater than 8",
          "checkbox": true,
        },
       ],
       "Product Manager":[
        {
          "question": "Obtain real-time information on all booth engagement",
          "checkbox": true,
        },           {
          "question": "Obtain data analytics on driving additional visitors to your booth",
          "checkbox": true,
        },           {
          "question": "Obtain access to entire list of event sponsors",
          "checkbox": true,
        },           {
          "question": "Obtain feedback through surveys and interviews",
          "checkbox": true,
        },           {
          "question": "Achieve at least 2 product mentions",
          "checkbox": true,
        },           {
          "question": "Obtain at least 3 market needs",
          "checkbox": true,
        },
       ],
       "Speaker":[
        {
          "question": "Obtain 1 customized agenda related your events",
          "checkbox": true,
        },{
          "question": "Obtain feedback score greater than 8.5 for sessions",
          "checkbox": true,
        },
        {
          "question": "Share live feed on at least 1 social media platform",
          "checkbox": true,
        },
       ],
       "Corporate":[
        {
          "question": "Visit 5 booths and obtain related industry material",
          "checkbox": true,
        },
        {
          "question": "Network with at least 5 event attendees in related industry",
          "checkbox": true,
        },
        {
          "question": "Participate in 2 speaker sessions",
          "checkbox": true,
        },

       ],
       "Student":[
        {
          "question": "Network with at least 5 corporate attendees to expand professional network",
          "checkbox": true,
        },
        {
          "question": "Engage with 2 industry leaders for knowledge sharing session",
          "checkbox": true,
        },
        {
          "question": "Visit 5 booths related to academic focus areas",
          "checkbox": true,
        },
       ],
       "Media":[
          {
            "question": "Conduct at least 2 one on one interviews with industry leaders",
            "checkbox": true,
          },
          {
            "question": "Obtain list of speakers and attendee at least 2 sessions",
            "checkbox": true,
          },
          {
            "question": "Obtain at least 5 marketing materials for content creation ideas",
            "checkbox": true,
          },
       ],
    };


    this.questions = feedbackQuestions[subcategory];
    console.log("this.questions", this.questions);
  }

  registrationChange(reg){
    this.registrationSubcategory = this.registration['registration'].find( ({ category }) => category === reg ).subcategory;
    console.log('this.registrationSubcategory ', reg, this.registrationSubcategory[0]);
    this.category = reg;
    this.subCategory = this.registrationSubcategory[0];
    this.populateQuestions(reg, this.registrationSubcategory[0]);
    this.getRegCode();
  }

  registrationSubChange(category, subcategory){
    this.category = category;
    this.subCategory = subcategory;
    console.log('this.registrationSubcategory ', category, subcategory);
    this.populateQuestions(category, subcategory);
  }

  getRegCode(){
    console.log('this.registration ', this.registration);
    console.log('this.category ', this.category);
    console.log('this.eventCosts ', this.eventCosts);
    const refCode = this.registration['registration'].find( ({ category }) => category === this.category ).refCodes;
    this.rates = this.eventCosts.find( ({ refCodes }) => refCodes.indexOf(refCode) !== -1 ).rates;




    console.log(this.category, this.rates);
    // let result = jsObjects.filter(obj => {
    //   return obj.b === 6
    // })

    // console.log(result)
  }



  addToCart(rate, title){
    if(this.cart.length > 0 ){
      return;
    }
    this.cart.push({"rate": parseFloat(rate), "title": title});
    this.cartSum();
  }

  cartSum() {
    const total = this.cart.reduce((accum,item) => accum + item.rate, 0)
    this.paymentRequest.transactionInfo.totalPrice = total.toString();
    ;
    return total;
  }

  showPaymentOption(startDate, endDate){
    if ( startDate?.value === (null || '') || endDate?.value === (null || '') ) {
      return false;
    }
    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    const today = new Date();

    if(sDate < today && today < eDate){
      return true;
    } else {
      return false;
    }
  }

  userLogOut() {
    // use the view child here
  }

 // push
//  capitalLetter(str)
//  {
//      str = str.split("-");

//      for (var i = 0, x = str.length; i < x; i++) {
//          str[i] = str[i][0].toUpperCase() + str[i].substr(1);
//      }

//      return str.join("-");
//  }




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

  hideModal() {
    this.hide.emit({});
    console.log('hide emit');
  }

  open(content) {

    const config: ModalOptions = { class: 'modal-dialog', ariaLabelledBy: 'modal-basic-title', show: true};

    this.modalService.open(content, config,).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    this.initStepper();
    document.getElementById("defaultOpen").click();
    // document.getElementById("defaultOpen2").click();
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

  uploadFloorplan(event) {
    let reader = new FileReader(); // HTML5 FileReader API
    let file = event.target.files[0];
    if (event.target.files && event.target.files[0]) {
      reader.readAsDataURL(file);
    }
    // When file uploads set it to file formcontrol
    reader.onload = () => {
      // this.floorPlanImageUrl = reader.result;
    }

    // ChangeDetectorRef since file is loading outside the zone
    this.cdRef.markForCheck();

  }


  exhibitorsList = [];

  getExhibitorsList(passedEventID) {
    var EXHIBITORS_API = API_URL + "/csi/event/services/event/getEventExhibitorList?evtUid=" + this.eventID;
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

  displaySessions() {

    $('#calendar-comp').toggle();
  }

  createNewSession() {

    var formattedDate = this.datePipe.transform(this.sessionStartDate, 'yyyy-MM-dd');

    var sessionTypeValues = $("#fieldSessionType option:selected").map(function () {
        return $(this).text();
    }).get().join(',');

    var createEventSessionFields =  {
      'name': this.sessionName,
      'speaker': this.sessionSpeaker,
      'synopsis': this.sessionSynopsis,
      'startDate': formattedDate,
      'endDate': formattedDate,
      'cost': Number(this.sessionCost),
      'discount': Number(this.sessionDiscount),
      'sessionType': sessionTypeValues,
      'privateSession': this.sessionPrivateSession,
      'sessionAttendeeCapacity': Number(this.sessionAttendeeCapacity)
    };

    var sessionCode = null;

    console.log("eventUid: " + this.eventID);
    var userId = localStorage.getItem('userId');
    this.userTypeId = localStorage.getItem('userTypeCode');
    var attendeeUid = localStorage.getItem("attendeeUid")

    console.log("attendeeUid: " + attendeeUid);

    if (!attendeeUid || attendeeUid == 'undefined' || attendeeUid == undefined) {
      attendeeUid = "8b88446c-0fa2-497d-b82c-4d239e897ce6";
      console.log("default attendeeUid: " + attendeeUid);
    }

    var ATTENDEE_EVENT_REGISTRATION_API = API_URL + "/csi/event/services/liveEventServices/registerExhibitorToLiveEvent?evtUid=" + this.eventID + "&attendeeUid=" + attendeeUid;

    var response = false;

    var obj = {};

    console.log('POSTING');

    this.httpClient.post<any>(ATTENDEE_EVENT_REGISTRATION_API, obj, { headers }).subscribe(data => {

      console.log('POST RESPONSE');

      console.log(data);

      if (data['response']['Error'] != undefined) {
        console.log(data['response']['Error']);
      }
      else {
        var SESSION_CREATE_API = API_URL + "/csi/event/services/eventV2/createEventSession?evtUid=" + this.eventID + "&attendeeUid=" + attendeeUid;

        this.httpClient.post<any>(SESSION_CREATE_API, createEventSessionFields, { headers }).subscribe(data2 => {

        console.log(data2);

        if (data2['response']['Error'] != undefined) {
            console.log(data2['response']['Error']);

        }
        else {
            sessionCode = data2['response']['sessionCode'];
            this.calendarChild.refreshCalendarWithSessions();
            this.getAllSessions();
            console.log("refreshed sessions");
          }
        });
      }
    });

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


public submitRegistration() {
  var eventID =  $('#eventID').val();
  var ATTENDEE_EVENT_REGISTRATION_API = API_URL + "/csi/event/services/liveEventServices/registerAttendeeToLiveEvent?evtUid=" +  eventID;

  console.log("EVENT ID SUBMIT: " + eventID);
  var attendeeInfo = {
        "attendeeUid": localStorage.getItem('attendeeUid'),
        "countryName":"US",
        "addr1":"123 Street Rd.",
        "addr2":"Unit A",
        "cityId":"Chicago",
        "stateId":"IL",
        "zipCode":"60661",
        "eventInviteCd": "aabb65ae",
        "discountCode":"abc12"
  }

  this.httpClient.post<any>(ATTENDEE_EVENT_REGISTRATION_API, attendeeInfo, { headers }).subscribe(data => {


    if (data['response']['Error'] != undefined) {
        console.log(data['response']['Error']);

    }
    else {

        this.regUid = data['response']['attendee']['regUid'];
        console.log("REG UID: " + this.regUid);


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

  public getRegUid() {


    var REGUID_API = API_URL + "/csi/event/services/attendeeData/getRegUidByAttendeeUidandEvtUid?attendeeUid=" + localStorage.getItem("attendeeUid") + "&evtUid=" + this.eventID;
    //	GET	evtUid & regUid as QueryParam"
    console.log("REGUID");
    console.log(REGUID_API)

    this.httpClient.get(REGUID_API, { headers }).subscribe(data => {

      console.log(data);

      if (data['response']['Error'] != undefined) {
        console.log(data['response']['Error']);

      }
      else {
        this.regUid = data['response']['regUid'][0];

        this.getRecommendedUsers(this.regUid);
        this.getRecommendedSessions(this.regUid);

       }
    });

  }

  public getRecommendedSessions(rID) {
    var aID = localStorage.getItem("attendeeUid");
    var eID = this.eventID;

    var RECOMMENDED_API = API_URL + "/csi/event/services/analyticsServices/getMLRecommendationCustomQuery?recommendationNameAndParams=matchAttendeeByInterest"+ eID + "%20" + rID;

    console.log(RECOMMENDED_API)

    this.httpClient.get(RECOMMENDED_API, { headers }).subscribe(data => {
      if (data['response']['Error'] != undefined) {
        console.log(data['response']['Error']);

      }
      else {
        console.log(data);
        this.recommendedSessions = data['response'][0]['Recommendation'];

        return data['response'][0].Recommendations;
      }
    });

  }


  public getRecommendedUsers(rID) {
    var aID = localStorage.getItem("attendeeUid");
    var eID = this.eventID;

     // GET	evtUid, regUid as URL PARAMS - SEPARATED BY SPACE
    var RECOMMENDED_API = API_URL + "/csi/event/services/analyticsServices/getMLRecommendationCustomQuery?recommendationNameAndParams=matchAttendeeByInterest"+ eID + "%20" + rID;;
     console.log(RECOMMENDED_API);

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

  uploadQualification(event, imageUrl) {
    let reader = new FileReader(); // HTML5 FileReader API
    let file = event.target.files[0];
    if (event.target.files && event.target.files[0]) {
      reader.readAsDataURL(file);
    }
    // When file uploads set it to file formcontrol
    reader.onload = () => {
      localStorage.setItem(imageUrl, String(reader.result));
      switch(imageUrl) {
        case 'photoID': {
          this.photoID = reader.result;
          break;
        }
        case 'payStub': {
          this.payStub = reader.result;
          break;
        }
        case 'taxIDNumber': {
          this.taxIDNumber = reader.result;
          break;
        }
        case 'busLi': {
          this.busLi = reader.result;
          break;
        }
      }
    }
    // ChangeDetectorRef since file is loading outside the zone
    this.cdRef.markForCheck();
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
