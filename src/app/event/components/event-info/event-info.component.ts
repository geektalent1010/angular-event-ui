import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { API_URL2 } from 'src/app/services/url/url';
import { countryCodes, sessionTopicsOptions } from './constants';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ToastService } from '../../../services/toast/toast.service';

var headers = new HttpHeaders()
  .set('content-type', 'application/json')
  .set('Access-Control-Allow-Headers', 'Content-Type')
  .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  .set('Access-Control-Allow-Origin', '*');

declare const google: any;
// let autocomplete: google.maps.places.Autocomplete;

@Component({
  selector: 'app-event-info',
  templateUrl: './event-info.component.html',
  styleUrls: ['./event-info.component.scss'],
})
export class EventInfoComponent implements OnInit {
  @Input('eventForm')
  get eventForm(): FormGroup {
    return this.eventInfoForm;
  }
  set eventForm(eventForm: FormGroup) {
    this.eventInfoForm = eventForm;
    this.initFunc();
  }
  eventInfoForm: FormGroup;
  @Input('eventInfo') eventInfo: any;
  @Input('evtUid') evtUid: string;
  @Input('pageType') pageType: string;
  @Output() onHandlePaymentWayChange = new EventEmitter<any>();

  sessionTopicsOptions: string[] = sessionTopicsOptions.sort();
  listOfCountries: any[] = countryCodes;
  paymentWayList: any[] = [
    { label: 'Braintree', value: 'braintree' },
    { label: 'RaiseNow', value: 'raiseNow' },
    { label: 'Authorize.net', value: 'authorizenet' },
  ];
  eventNameList: string[] = [];

  blockedCountries: any[] = [];
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'code',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true,
  };

  constructor(
    private httpClient: HttpClient,
    private toastService: ToastService
  ) {
    if (localStorage.getItem('Authorization')) {
      headers = new HttpHeaders()
        .set('content-type', 'application/json')
        .set('Access-Control-Allow-Headers', 'Content-Type')
        .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        .set('Access-Control-Allow-Origin', '*')
        .set('Authorization', localStorage.getItem('Authorization'));
    }
  }
  ngOnInit(): void {
    this.getAllEvents();
    this.initFunc();
  }

  ngOnChanges(changes) {
    if (changes.eventInfo) {
      this.blockedCountries = this.eventInfo?.blockedCountries;
    }
  }

  private initFunc() {
    this.lf.eventName.valueChanges
      .pipe(startWith(''), debounceTime(10), distinctUntilChanged())
      .subscribe((eventName: string) => {
        this.isEventNameFound();
      });
    this.lf.eventYear.valueChanges
      .pipe(startWith(''), debounceTime(10), distinctUntilChanged())
      .subscribe((eventYear: string) => {
        this.isEventNameFound();
      });

    /** Handle the payment way change subscription regarding braintree and authorizenet */
    this.eventInfoForm.controls['paymentWay'].valueChanges.subscribe(
      (paymentWay: string) => {
        this.onHandlePaymentWayChange.emit(paymentWay);
      }
    );
  }

  changeSecurityLevel(value) {
    if (value === 'private') {
      this.eventInfoForm
        .get('eventAccessCode')
        .setValidators([
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(6),
        ]);
      this.eventInfoForm.get('eventAccessCode').updateValueAndValidity();
    } else {
      this.eventInfoForm.get('eventAccessCode').setValue('');
      this.eventInfoForm.get('eventAccessCode').clearValidators();
      this.eventInfoForm.get('eventAccessCode').updateValueAndValidity();
    }
  }

  get lf() {
    return this.eventInfoForm.controls;
  }

  private getAllEvents() {
    var GET_ALL_EVENTS =
      API_URL2 + '/csi/event/services/eventV2/getAllEventNames';
    this.httpClient.get(GET_ALL_EVENTS, { headers }).subscribe((data) => {
      if (data['response']['Error'] != undefined) {
        console.log(data['response']['Error']);
      } else {
        const response = data['response'];
        response.forEach((valArr) => {
          if (Number(valArr[0]) !== Number(this.evtUid)) {
            this.eventNameList.push(valArr[1].toUpperCase());
          }
        });
      }
    });
  }

  private isEventNameFound() {
    const name = this.eventInfoForm.get('eventName').value;
    const year = this.eventInfoForm.get('eventYear').value;

    if (this.eventNameList.length === 0) {
      return false;
    }
    if (!name) return false;
    let result = year
      ? this.eventNameList.includes(`${name} ${year}`.toUpperCase())
      : this.eventNameList.includes(name.toUpperCase());
    if (result) {
      this.lf['eventName'].setErrors({ eventNameFound: true });
    } else {
      if (this.eventInfoForm.controls.eventName.errors?.['eventNameFound'])
        delete this.eventInfoForm.controls.eventName.errors['eventNameFound'];
    }
    return result;
  }

  private get typeOfEvent() {
    const result =
      this.eventInfoForm.controls.Seminar.value ||
      this.eventInfoForm.controls.Social.value ||
      this.eventInfoForm.controls.Trade.value ||
      this.eventInfoForm.controls.Workshop.value;
    return result;
  }

  public isValidTab() {
    let isValid = true;
    const fieldName = {
      reqProjMgrName: 'Manager',
      salesExecName: 'Sales Executive',
      preferredMethod: 'Preferred Method',
      custServiceEmailAddress: 'Email',
      custServicePhoneNumber: 'Phone',
      eventName: 'Name',
      eventDisplayName: 'Event Display Name',
      description: 'Description',
      eventSecurityLevel: 'Security Level',
      eventAccessCode: 'Private Access Code',
      eventFormat: 'Format',
      categories: 'Category Selection',
      showCode: 'Show Code',
      tradeShowName: 'Trade Show Name',
      eventYear: 'Year',
      startDate: 'Start Date',
      startTime: 'Start Time',
      endDate: 'End Date',
      endTime: 'End Time',
      address1: 'Address',
      city: 'City',
      county: 'County',
      zip: 'Zip Code',
      country: 'Country',
      countryCode: 'Country Code',
      phone: 'Contact Phone',
      paymentWay: ' Payment Way',
      homePageOnShowInfo: 'Show Home Page',
      blockedCountries: 'Blocked Registration Countries',
    };
    Object.keys(this.eventInfoForm.controls).forEach((key) => {
      this.eventInfoForm.controls[key].markAsDirty();
      this.eventInfoForm.controls[key].updateValueAndValidity();
    });
    if (this.eventInfoForm.invalid) {
      let errFields = [];
      Object.keys(this.eventInfoForm.controls).forEach((key) => {
        if (
          this.eventInfoForm.controls[key].hasError('required') ||
          this.eventInfoForm.controls[key].hasError('maxlength') ||
          this.eventInfoForm.controls[key].hasError('minlength') ||
          this.eventInfoForm.controls[key].hasError('pattern') ||
          this.eventInfoForm.controls[key].hasError('eventNameFound')
        ) {
          errFields.push(fieldName[key]);
        }
      });
      this.toastService.show('Error fields: \n' + errFields.join(',\n'), {
        delay: 8000,
        classname: 'bg-warning text-light',
        headertext: 'Warning',
        autohide: true,
      });
      isValid = false;
    }
    if (this.isEventNameFound()) {
      this.toastService.show('Event name is already in use', {
        delay: 8000,
        classname: 'bg-warning text-light',
        headertext: 'Warning',
        autohide: true,
      });
      isValid = false;
    }
    if (!this.typeOfEvent) {
      this.toastService.show('Event type is missing', {
        delay: 8000,
        classname: 'bg-warning text-light',
        headertext: 'Warning',
        autohide: true,
      });
      isValid = false;
    }
    if (
      this.isTimeOutOfOrder(
        this.eventInfoForm.get('startDate'),
        this.eventInfoForm.get('endDate'),
        this.eventInfoForm.get('startTime'),
        this.eventInfoForm.get('endTime')
      )
    ) {
      this.toastService.show(
        'Start date and time is behind of End date and time',
        {
          delay: 8000,
          classname: 'bg-warning text-light',
          headertext: 'Warning',
          autohide: true,
        }
      );
      isValid = false;
    }

    // if (this.lf.homePageOnShowInfo.hasError('pattern')) {
    //   this.toastService.show('Invalid URL: Show Home Page', {
    //     delay: 8000,
    //     classname: 'bg-warning text-light',
    //     headertext: 'Warning',
    //     autohide: true,
    //   });
    //   isValid = false;
    // }
    return isValid;
  }

  private isTimeOutOfOrder(startDate, endDate, startTime, endTime) {
    if (
      startDate.value === (null || '') ||
      endDate.value === (null || '') ||
      startTime.value === (null || '') ||
      endTime.value === (null || '')
    ) {
      return false;
    }

    const sDate = new Date(startDate.value + ' ' + startTime.value);
    const eDate = new Date(endDate.value + ' ' + endTime.value);
    if (eDate < sDate) {
      return true;
    }
    return false;
  }

  handleLogoUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.lf.eventLogo.setValue(reader.result);
    };
  }

  handleAddressChange(address: any) {
    if (Array.isArray(address?.address_components)) {
      const countryObj: any = address?.address_components?.find((item: any) =>
        item?.types?.includes('country')
      );
      const county: string =
        address?.address_components?.find((item: any) =>
          item?.types?.includes('administrative_area_level_2')
        )?.long_name ?? '';
      const city: string =
        address?.address_components?.find((item: any) =>
          item?.types?.includes('locality')
        )?.long_name ?? '';
      const postal_code: string =
        address?.address_components?.find((item: any) =>
          item?.types?.includes('postal_code')
        )?.long_name ?? '';
      this.lf['country'].setValue(countryObj.long_name);
      this.lf['countryCode'].setValue(countryObj.short_name);
      this.lf['county'].setValue(county);
      this.lf['city'].setValue(city);
      if (postal_code) this.lf['zip'].setValue(postal_code);
    }
  }
}
