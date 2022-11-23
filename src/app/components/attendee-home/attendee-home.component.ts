import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AttendeeService } from '../../services/attendee.service';
import { Personal } from './iPersonal';
import { Observable, Subject, Subscription, timer } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { OnDestroy } from '@angular/core';
import { ImageConstants } from 'src/app/event-pages/imageConstants';
import { RegistrationModalComponent } from 'src/app/shared/components/registration-modal/registration-modal.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { API_URL, API_URL2 } from 'src/app/services/url/url';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

var headers = new HttpHeaders()
  .set('content-type', 'application/json')
  .set('Access-Control-Allow-Headers', 'Content-Type')
  .set('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS')
  .set('Access-Control-Allow-Origin', '*');

interface attendeeQualificationsType {
  noRequiredQualifications: boolean;
  taxIDNumber: ImageConstants,
  payStub: ImageConstants,
  busLi: ImageConstants,
  photoID: ImageConstants,
  mediaArticle: ImageConstants,
  activeStudentId: ImageConstants,
  marketResearchReport: ImageConstants,
  letterFromProducer: ImageConstants,
  article: ImageConstants
}

@Component({
  selector: 'app-attendee-home',
  templateUrl: './attendee-home.component.html',
  styleUrls: ['./attendee-home.component.scss']
})
export class AttendeeHomeComponent implements OnInit, OnDestroy {
  modalRef: BsModalRef;
  firstName: string;
  lastName: string;
  empEmail: string;
  address: string;
  address2: string;
  zip: string;
  userPhoneNbr: string;
  userID: string;
  username: string;
  selectedInterests: any;
  attendeeUid: any;

  interestsList: any[];
  eventsList: any[];
  attendeeQualifications: attendeeQualificationsType;
  tmpEventLists: any;

  events: any[] = [];
  personal: Personal = {
    firstName: '',
    nameLast: '',
    empEmail: '',
    address: '',
    address2: '',
    zip: '',
    userPhoneNbr: '',
    userId: ''
  };
  regType: '';
  uid: string;
  currentTab = 1;
  currentPassword: '';
  newPassword: '';
  confirmPassword: '';
  regTypeSearchResults = [];

  @ViewChild('personalForm', { static: true }) ngForm: NgForm;
  private formChangesSubscription: Subscription;

  constructor(
    private attendeeService: AttendeeService,
    private httpClient: HttpClient,
    private cdRef: ChangeDetectorRef,
    private modalService: BsModalService
  ) {
    if (localStorage.getItem("Authorization")) {
      headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Access-Control-Allow-Headers', 'Content-Type')
      .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .set('Access-Control-Allow-Origin', '*')
      .set('Authorization', localStorage.getItem("Authorization"));
    }
    this.getEventList();
  }

  // ******* START GOOGLE API *********//

  title = 'Google Pay Demo';
  intervalId = 0;
  message = '';
  seconds = 11;


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
      currencyCode: 'EUR',
      countryCode: 'BE'
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

  ngOnInit(): void {
    this.username = localStorage.getItem('username');
    this.firstName = localStorage.getItem('firstName');
    this.lastName = localStorage.getItem('nameLast');
    this.uid = localStorage.getItem('attendeeUid');
    this.empEmail = localStorage.getItem('emailAddr');

    this.formChangesSubscription = this.ngForm.form.valueChanges.subscribe(x => {
      if (this.newPassword !== this.confirmPassword) {

      }

    });

    this.getUserInfo();
  }

  saveLastName() {
    localStorage.setItem('nameLast', this.lastName);
  }

  saveFirstName() {
    localStorage.setItem('firstName', this.firstName);
  }

  ngOnDestroy() { this.clearTimer(); }
  clearTimer() { clearInterval(this.intervalId); }

  countDown(evtName, startDate, startTime) {
    this.clearTimer();
    const source = timer(1000, 1000);
    //output: 0,1,2,3,4,5......
    const subscribe = source.subscribe(val => {
      // console.log('countDown ', evtName, startDate, startTime);
      this.seconds = new Date(`${startDate} ${startTime}`).getTime() - new Date().getTime();
      // this.seconds -= 1000;

      // Time calculations for days, hours, minutes and seconds
      let days = Math.floor(this.seconds / (1000 * 60 * 60 * 24));
      let hours = Math.floor((this.seconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((this.seconds % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((this.seconds % (1000 * 60)) / 1000);

      if (this.seconds < 0) {
        this.eventsList[evtName].countdown = `Registration Closed`;
      } else {
        //if (this.seconds < 0) { this.seconds = 10; } // reset
        this.eventsList[evtName].countdown = `${days}d : ${hours < 10 ? '0' + hours : hours}h : ${minutes < 10 ? '0' + minutes : minutes}m : ${seconds < 10 ? '0' + seconds : seconds}s`;
      }

      // console.log(evtName, this.eventsList[evtName]);
    });
  }
  /*
    ngAfterContentInit(): void {
      console.log("INTERESTS");
      console.log(this.interestsList);

    }
  */

  public getEventList() {
    var EVENT_LIST_API = API_URL2 + '/csi/event/services/eventSetupV2/findAllEvtInfoByEvtUid?evtUid=2572346';
    console.log(EVENT_LIST_API);
    this.httpClient.get(EVENT_LIST_API, { headers }).subscribe(data => {
      console.log(data);
      if (data['response']['statusCode'] != 400) {
        console.log(data['response']['Error']);
      }
      else {
        console.log("eventList");
        console.log('data[response]', data['response']);

        this.tmpEventLists = data['response'].Event;
        console.log("inside tmplist");
        console.log(this.tmpEventLists);

        var tempList = this.tmpEventLists;
        var newEventList = Array();
        console.log(tempList.length);
        for (var x = 0; x < tempList.length; x++) {
          if (tempList[x].length > 0) {
            console.log(tempList[x]);
            newEventList.push(tempList[x]);
          }
        }
        this.eventsList = newEventList;
        // this.eventsList = [
        //   {
        //     cost: "100.0",
        //     endDate: "2021-06-19",
        //     endTime: "00:00",
        //     evtName: "Breakfast ",
        //     startDate: "2021-06-09",
        //     startTime: "08:00 AM",
        //     countdown: "",
        //   }
        // ];
        this.eventsList.push({
          cost: data['response'].EventCosts[1].rates.duringEventBirdRate,
          endDate: "2021-06-12",
          endTime: "12:00:00",
          evtName: data['response'].Event.evtName,
          startDate: "2021-06-11",
          startTime: "08:00:00",
          countdown: "",
        });
        data['response'].sessions.forEach(element => {
          this.eventsList.push({
            cost: element.cost,
            endDate: element.endDate,
            endTime: element.endTime,
            evtName: element.name,
            startDate: element.startDate,
            startTime: element.startTime,
            countdown: "",
          });
        });
        this.eventsList.forEach((evt, index) => {
          this.countDown(index, evt.startDate, evt.startTime);
        });
        console.log("EVENT LIST!:");
        console.log(this.eventsList);
      }
    });
    this.attendeeQualifications = {
      "noRequiredQualifications": false,
      "taxIDNumber": localStorage.getItem("taxIDNumber") ? localStorage.getItem("taxIDNumber") : ImageConstants.taxIDNumber,
      "payStub": localStorage.getItem("payStub") ? localStorage.getItem("payStub") : ImageConstants.payStub,
      "busLi": localStorage.getItem("busLi") ? localStorage.getItem("busLi") : ImageConstants.busLi,
      "photoID": localStorage.getItem("photoID") ? localStorage.getItem("photoID") : ImageConstants.photoID,
      "mediaArticle": localStorage.getItem("mediaArticle") ? localStorage.getItem("mediaArticle") : ImageConstants.photoID,
      "activeStudentId": localStorage.getItem("activeStudentId") ? localStorage.getItem("activeStudentId") : null,
      "marketResearchReport": localStorage.getItem("marketResearchReport") ? localStorage.getItem("marketResearchReport") : null,
      "letterFromProducer": localStorage.getItem("letterFromProducer") ? localStorage.getItem("letterFromProducer") : null,
      "article": localStorage.getItem("article") ? localStorage.getItem("article") : null,
    };
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
      this.attendeeQualifications[`${imageUrl}`] = reader.result;
      switch (imageUrl) {
        case 'photoID': {
          this.attendeeQualifications['photoID'] = reader.result;
          break;
        }
        case 'payStub': {
          this.attendeeQualifications['payStub'] = reader.result;
          break;
        }
        case 'taxIDNumber': {
          this.attendeeQualifications['taxIDNumber'] = reader.result;
          break;
        }
        case 'busLi': {
          this.attendeeQualifications['busLi'] = reader.result;
          break;
        }
      }
    }
    // ChangeDetectorRef since file is loading outside the zone
    this.cdRef.markForCheck();
  }

  public changeEvent(event: any) {
    console.log(event);
    //update the ui
    //this.addDiscountType = event.target.value;
    //this.addDiscountTypeDescript =$("#addDiscountType :selected").text();
  }

  public getUserInfo() {
    let ATTENDEE_API = `${API_URL2}/csi/event/services/usersV2/findByAttendeeUid/${localStorage.getItem("attendeeUid")}`;

    this.httpClient.get(ATTENDEE_API, { headers }).subscribe(data => {

      if (data["response"]?.statusCode === 200) {
        this.username = data['response']['addUserid'];
        // this.firstName = data['response']['firstName'];
        // this.lastName = data['response']['nameLast'];
        this.empEmail = data['response']['empEmail'];
        this.address = data['response']['address'];
        this.address2 = data['response']['address2'];
        this.zip = data['response']['zip'];
        this.userPhoneNbr = data['response']['userPhoneNbr'];

        //verified so set localStorage for User Access
        localStorage.setItem("activeFlag", "true");
        localStorage.setItem('userId', data['response']['addUserid']);
        localStorage.setItem('attendeeUid', data['response']['attendeeUid']);
        localStorage.setItem('userTypeCode', data['response']['userTypeCode']);
        localStorage.setItem('firstName', data['response']['firstName']);
        localStorage.setItem('nameLast', data['response']['nameLast']);
        localStorage.setItem('canCreateEvent', data['response']['cancreateevent']);
      } else {
        console.error(data);
      }
    });
  }

  public getGoals() {
    var GOALS_API = API_URL + "/csi/event/services/attendeeServices/postAttendeeGoals";
    var goalsFields = {
      'attendeeUid': localStorage.getItem("attendeeUid"),
    };
    this.httpClient.post<any>(GOALS_API, goalsFields, { headers }).subscribe(data => {
      if (data['response']['Error'] != undefined) {
        console.log(data['response']['Error']);
      }
      else {
        // Password Reset Successful
        return data['response'];
      }
    });
  }

  public setInterests() {
    var SET_INTERESTS_API = API_URL + "/csi/event/services/attendeeServices/postAttendeeInterest";
    var interestFields = {
      "evtUid": 230611151,
      "attendeeUid": localStorage.getItem("attendeeUid"),
      "subCategory": "Consumer Electronics",
      "topics": ""
    };
    for (let i = 0, len = this.selectedInterests.length; i < len; i++) {
      interestFields['subCategory'] = this.selectedInterests[i];
      console.log("submitting interest: ");
      console.log(interestFields);
      this.httpClient.post<any>(SET_INTERESTS_API, interestFields, { headers }).subscribe(data => {
        console.log(data);
        if (data['response']['Error'] != undefined) {
          console.log(data['response']['Error']);
        }
        else {
          // Password Reset Successful
          return data['response'];
        }
      })
    }
  }

  setTab(tab: number): void {
    this.currentTab = tab;
  }

  activeMatch(passedVal) {

    $("a").removeClass("active-state");
    let activeDiv = "." + passedVal;
    $(activeDiv).addClass('active-state');

  }

  openEventRegisterModal(eventSlug, id) {
    const initialState = {
      paramEventId: id,
      paramID: eventSlug,
    };

    this.modalRef = this.modalService.show(RegistrationModalComponent, {
      class: 'modal-lg modal-dialog-centered',
      initialState,
      ignoreBackdropClick: true,
      keyboard: false
    });

    this.modalRef.content.hide.subscribe(result => {
      this.hideModal();
    });
  }

  hideModal() {
    this.modalService.hide();
  }
}
