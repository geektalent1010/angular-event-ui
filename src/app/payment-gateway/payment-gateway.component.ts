import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { API_URL2 } from '../services/url/url';

var headers = new HttpHeaders()
  .set('content-type', 'application/json')
  .set('Access-Control-Allow-Headers', 'Content-Type')
  .set('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS')
  .set('Access-Control-Allow-Origin', '*');

@Component({
  selector: 'app-payment-gateway',
  templateUrl: './payment-gateway.component.html',
  styleUrls: ['./payment-gateway.component.scss']
})
export class PaymentGatewayComponent implements OnInit {
  //API = `https://test.csi-event.com:8443/apiv2`;
  API = API_URL2;

  attendeeUid;
  guid;
  personalInfo;
  eventInfo = null;
  paymentInfo = null;
  discounts;
  showGooglePay = false;
  environment;
  googleEnvironnement;

  constructor(private activatedRoute: ActivatedRoute, private httpClient: HttpClient) {

    if (localStorage.getItem("Authorization")) {
      headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Access-Control-Allow-Headers', 'Content-Type')
      .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .set('Access-Control-Allow-Origin', '*')
      .set('Authorization', localStorage.getItem("Authorization"));
    }

  }

  // ******* START GOOGLE API *********//

  title = 'Google Pay Demo';
  intervalId = 0;
  message = '';
  seconds = 11;
  paymentRequest: google.payments.api.PaymentDataRequest;




  onLoadPaymentData = (
    event: Event
  ): void => {
    const eventDetail = event as CustomEvent<google.payments.api.PaymentData>;
    console.log('load payment data', eventDetail.detail);
  }

  onPaymentDataAuthorized: google.payments.api.PaymentAuthorizedHandler = (
    paymentData
  ) => {
    this.postPayment();
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
    this.attendeeUid = this.activatedRoute.snapshot.params.attendeeUid;
    this.guid = this.activatedRoute.snapshot.params.guid;
    this.environment = environment.production ? 'production' : 'local';
    this.googleEnvironnement = environment.production ? 'PRODUCTION' : 'TEST';
    this.getPersonalInfo();

  }

  public setGooglePay() {
    console.log('GooglePaymentData', this.eventInfo.GooglePaymentData[0]);
    console.log('Total', this.paymentInfo?.total);
    console.log('googleEnvironnement', this.googleEnvironnement);
    this.paymentRequest = {
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
              gateway: this.eventInfo.GooglePaymentData[0].gateway,
              gatewayMerchantId: this.eventInfo.GooglePaymentData[0].gatewayID,
            }
          }
        }
      ],
      merchantInfo: {
        merchantId: this.eventInfo.GooglePaymentData[0].paymentId,
        merchantName: 'A4SAFE'
      },
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPriceLabel: 'Total',
        totalPrice: this.paymentInfo?.total,
        currencyCode: 'USD',
        countryCode: 'US'
      },
      callbackIntents: ['PAYMENT_AUTHORIZATION']
    };
    this.showGooglePay = true;
  }

  private getPersonalInfo() {
    const GET_PERSONAL_INFO_URL = this.API + `/csi/event/services/attendeeV2/getAttendeePersonalInformation?guid=${this.guid}&attendeeUid=${this.attendeeUid}`;

    this.httpClient.get(GET_PERSONAL_INFO_URL, { headers }).subscribe(data => {
      if (data['response']['Error'] != undefined) {
        console.log(data['response']['Error']);
        Swal.fire({
          icon: 'warning',
          title: 'Error detected',
          text: 'User Not Found',
          confirmButtonColor: '#3085d6',
        });
      } else {
        this.personalInfo = data['response'];
        this.getEventInfo();
      }
    });
  }

  public getEventInfo() {
    const GET_EVENT_INFO_URL = this.API + `/csi/event/services/eventSetupV2/findAllEvtInfoByGuid?guid=${this.guid}`;
    // const GET_EVENT_INFO_URL = `https://test.csi-event.com:8443/apiv2/csi/event/services/eventSetupV2/findAllEvtInfoByGuid?guid=${this.guid}`;

    this.httpClient.get(GET_EVENT_INFO_URL, { headers }).subscribe(data => {
      if (data['response']['Error'] != undefined) {
        console.log(data['response']['Error']);
        Swal.fire({
          icon: 'warning',
          title: 'Error detected',
          text: 'User Not Found',
          confirmButtonColor: '#3085d6',
        });
      } else {
        this.eventInfo = data['response'];
        this.getPaymentInfo();
      }
    });
      console.log('event info', this.eventInfo);

  }

  private getPaymentInfo() {
    const GET_PAYMENT_INFO_URL = this.API + `/csi/event/services/attendeeV2/getPaymentItems?guid=${this.guid}&attendeeUid=${this.attendeeUid}`;

    this.httpClient.get(GET_PAYMENT_INFO_URL, { headers }).subscribe(data => {
      if (data['response']['Error'] != undefined) {
        console.log(data['response']['Error']);
        Swal.fire({
          icon: 'warning',
          title: 'Error detected',
          text: 'User Not Found',
          confirmButtonColor: '#3085d6',
        });
      } else {
        this.paymentInfo = data['response'];
        this.setGooglePay();
      }
    });
  }

  public postPayment() {
    const POST_PAYMENT_INFO_URL = this.API + `/csi/event/services/attendeeV2/paymentSuccess`;

    this.httpClient.post<any>(POST_PAYMENT_INFO_URL, {
      'attendeeUid': this.attendeeUid,
      'guid': this.guid,
      'environment' : this.environment,
    }, { headers }).subscribe(data => {
      if (data['response']['Error'] != undefined) {
        console.log(data['response']['Error']);
      }
      else {
        return data['response'];
      }
    });
  }


}
