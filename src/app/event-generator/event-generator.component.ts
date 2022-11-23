import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { HttpHeaders } from '@angular/common/http';
import slugify from 'slugify';
import { SessionServiceService } from '../services/session-service.service';
import { MdbTableDirective } from 'angular-bootstrap-md';
import { AfterViewInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  NgForm,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ElementRef } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ImageConstants } from '../event-pages/imageConstants';
import { finalize } from 'rxjs/operators';
import { API_URL, API_URL2 } from '../services/url/url';
import { BusinessRulesComponent } from '../business-rules/business-rules.component';
import { AddDiscountComponent } from '../shared/modals/add-discount/add-discount.component';
import { Router } from '@angular/router';
import { ExhibitorComponent } from '../exhibitor/exhibitor.component';
import { MembershipComponent } from '../membership/membership.component';
import { CreateQualificationComponent } from '../shared/modals/create-qualification/create-qualification.component';
import Swal from 'sweetalert2';
import { ToastService } from '../services/toast/toast.service';
import * as moment from 'moment';
import { WINDOW } from '../window.providers';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from '../services/local-storage.service';
import { countryCodes } from '../shared/countryCodes';
import { v4 as uuid } from 'uuid';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { UploadService } from '../services/upload.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ImportQuestionsComponent } from '../shared/modals/import-questions/import-questions.component';
import { QuestionData } from '../shared/interfaces/Question';
import { RegtypeData } from '../shared/interfaces/Regtype';
import { PackageData } from '../shared/interfaces/Package';
import { EventCostData, RateData } from '../shared/interfaces/EventCost';

const FIREBASE_URL = 'https://csi-event-a3367.firebaseapp.com/';

const sessionQueue = Array();
let regTypeQueue = Array();

var headers = new HttpHeaders()
  .set('content-type', 'application/json')
  .set('Access-Control-Allow-Headers', 'Content-Type')
  .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  .set('Access-Control-Allow-Origin', '*');

const projectId: string = environment.production
  ? 'csi-event-a3367'
  : 'test-csi-event';

@Component({
  selector: 'app-event-generator',
  templateUrl: './event-generator.component.html',
  styleUrls: ['./event-generator.component.scss'],
})
export class EventGeneratorComponent implements OnInit, AfterViewInit {
  sessionForm = new FormGroup({});
  eventInfoForm = new FormGroup({});
  pageBuilderForm = new FormGroup({});
  eventEarlyBirdCostForm = new FormGroup({});
  isEventEarlyBirdCostFormHidden = true;
  eventPreEventBirdCostForm = new FormGroup({});
  isEventPreEventBirdCostFormHidden = true;
  eventDuringEventBirdCostForm = new FormGroup({});
  isEventDuringEventBirdCostFormHidden = false;

  public regCode: string;
  //private REG_TYPE_SEARCH_API = API_URL + "/csi/event/services/eventV2/getDistinctRegTypeByEvtType?evtType=REG";
  private EVENT_TYPE_API =
    API_URL + '/csi/event/services/eventV2/getAllDistinctEventTypes';
  private ATTENDEE_TYPE_API =
    API_URL +
    '/csi/event/services/eventRegistration/getEventRegistrationUserTypes';
  private NAME_SEARCH_API =
    API_URL + '/csi/event/services/event/searchFilterAttendeesByName';
  private CREATE_EVENT_API =
    API_URL2 + '/csi/event/services/eventSetupV2/createEvent';
  private ZIPCODE_LOOKUP_API =
    API_URL2 + '/csi/event/services/eventV2/getCityStateByZipcode';
  loading = false;
  questionDialogRef;
  eventCosts = [];
  customPackage: PackageData = {
    regtype: '',
    name: '',
    description: '',
    cost: 0,
    isZero: false
  };
  regCodes = [];
  public myEventID: string;
  list1: any[];
  list2: any[];
  eventID = '0';
  postId = '';
  templateHidden: boolean;
  nameSearchResults: any[];
  emailBlastAdd: any[];
  addUserSearch: String;
  questionSearch: String;
  questionSearchResults: any[];
  regTypeSearch: String;
  regTypeResults: any[];
  addDiscountType: String = 'null';
  addDiscountTypeDescript: String;
  messageSendType: String;
  messageSendTypeDescript: String;
  createdEventComplete: string;
  noSessions = false;
  eventPages = [];
  exhibitorIOID: String;
  originalExhibitorIOID: String;
  organizerIOID: String;
  originalOrganizerIOID: String;
  builderIOID: String;
  builderPublishing: boolean;
  buildComplete: String;
  dollarDiscountFields;
  percentageDiscountFields;
  emailsComma: String;
  public csvContent: string;
  public csvResults: any[];

  // SESSION VALS
  sesName: string;
  sesDescription: string;
  sesSynopsis: string;
  sesSpeaker: string;
  sesStartDate: string;
  sesStartTime: string;
  sesEndDate: string;
  sesEndTime: string;
  sesCost: string;
  sesType: string;
  sesPrivateSession: string;
  sesCapacity: string;
  sesTopics: string;
  // sessionGoals: string;
  editSesionIndex: number = null;
  date = new Date();

  // FORM VALUES
  eventName: string;
  eventYear = [];
  description: String;
  eventSecurityLevel: String;
  eventFormat: String;
  categories: String;
  googleMerchantId: string;
  startDate: String;
  endDate: String;
  address: String;
  address2: String;
  address3: String;
  city: String;
  county: String;
  country: String;
  listOfCountries = countryCodes;
  countryCode: String;
  zip: String;
  phone: String;
  TaxIDNumber: boolean = false;
  PayStub: boolean = false;
  BusLi: boolean = false;
  PhotoID: boolean = false;
  Seminar: boolean = false;
  Social: boolean = false;
  Trade: boolean = false;
  Workshop: boolean = false;

  earlyBirdStartDate: string;
  earlyBirdEndDate: string;
  earlyBirdRate: string;

  preEventBirdStartDate: string;
  preEventBirdEndDate: string;
  preEventBirdRate: string;

  duringEventBirdStartDate: string;
  duringEventBirdEndDate: string;
  duringEventBirdRate: string;

  sessionListing = [];

  eventType: String;
  subCategories: String;
  discounts: String;
  options: String;
  webURL: String;
  requiredDoc: String;
  typeEvent: String;
  errorCode: String;
  isUpdate: boolean = false;

  // BUILDER VALS
  builderId: string = 'someID';
  builderUrl: string;
  builderUrlLoading: boolean = false;
  builderType: string = null;
  isPublishPaperBitsVisible: boolean = false;
  isLaunchPaperBitsVisible: boolean = true;
  builderTemplate = [
    {
      templateType: 'Attendee',
      templateName: 'Attendee Registration Workflow 1',
      json: 'attendee-workflow-1.json',
      url: '/workflow1/attendee/',
      includingPages:
        'Login, personal information, demographic, registration category, qualifications, sessions & events, review & payment information, registration confirmation, & dashboard',
      checked: true,
      themeType: 'Standard',
    },
    {
      templateType: 'Attendee',
      templateName: 'Attendee Registration Workflow 2',
      json: 'attendee-workflow-2.json',
      url: '/workflow2/attendee/',
      includingPages:
        'Login, Reg Type package page, personal information, demographics page, sessions & events, review & payment information, registration confirmation, dashboard',
      checked: false,
      themeType: 'Standard',
    },
    {
      templateType: 'Attendee',
      templateName: 'Attendee Registration Workflow 3',
      json: 'attendee-workflow-3.json',
      url: '/workflow3/attendee/',
      includingPages: 'No demographics page',
      checked: false,
      themeType: 'Standard',
    },
    {
      templateType: 'Attendee',
      templateName: 'Attendee Registration Workflow 4',
      json: 'attendee-workflow-4.json',
      url: '/workflow4/attendee/',
      includingPages: 'Login, personal information, demographic, Licensing Information, registration category, review & payment information, registration confirmation, & dashboard',
      checked: false,
      themeType: 'Standard',
    },
    {
      templateType: 'Exhibitor',
      templateName: 'Exhibitor Registration Workflow 1',
      json: 'exhibitor-workflow-1.json',
      url: '/workflow1/exhibitor/',
      includingPages: '',
      checked: true,
      themeType: 'Standard',
    },
    {
      templateType: 'Organizer',
      templateName: 'Organizer Registration Workflow 1',
      json: 'organizer-workflow-1.json',
      url: '/workflow1/organizer/',
      includingPages: 'Login, Dashboard, Reports',
      checked: true,
      themeType: 'Standard',
    },
  ];
  selectedTemplate;
  builderTemplateType = this.builderTemplate
    .map((item) => item.templateType)
    .filter((value, index, self) => self.indexOf(value) === index);

  floorPlanImageUrl: any;
  searchText: string;
  publishButtonText: string;
  // Qualifications tab
  qualificationRegType = '';
  qualifications: string[] = [
    'taxIDNumber',
    'payStub',
    'busLi',
    'studentID',
    'photoID',
  ];
  selectedQualifications: string[] = [];
  createdQualifications = [];
  headSelectQualifications = [
    'Qualification Name',
    'Qualification Type',
    'Reg Type Association',
    'Sample Image',
  ];
  addedQualifications: any[] = [];
  noQualifications: any = {};
  noQualificationsChecked: Boolean = false;
  qualificationError: string = '';
  // Customizations tab
  // visa letter configuration
  visaConfigTabs: any = {
    visaPreview: false,
    attendeeResponse: false,
    csiResponse: false,
  };
  visaConfigValues = {
    visaPreview: false,
    attendeeResponse: {
      passportDob: false,
      passportGender: false,
      passportNumber: false,
      passportExpirationDate: false,
      companyName: false,
      cszCountry: false,
    },
    csiResponse: {
      firstName: '',
      lastName: '',
      emailAddress: '',
      address1: '',
      address2: '',
    },
  };
  headSelectCustomizations = ['Id', 'Customization Category', 'Evaluation'];
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'value',
    textField: 'label',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 6,
    allowSearchFilter: true,
  };
  customizationUsers = ['attendee', 'exhibitor'];
  customizationCategories = {
    attendee: ['Visa Processing'],
  };
  // customizationCategories = {
  //   attendee: [
  //     'UI Access Control',
  //     'Housing Customization',
  //     'Membership',
  //     'SSO Processing',
  //     'Credential Process',
  //     'Visa Processing',
  //     'Credential Print Options'
  //   ],
  //   exhibitor: ['Sessions input', 'SSO Processing', 'ESG Upsells']
  // };
  customizationOptions: {} = {
    attendee: {
      'UI Access Control': [
        {
          value: 'Sessions',
          label: 'Sessions',
        },
        {
          value: 'Roster',
          label: 'Roster',
        },
        {
          value: 'Tickets',
          label: 'Tickets',
        },
      ],
      'Housing Customization': [
        {
          value: 'OnPeak Interface config',
          label: 'OnPeak Interface config',
        },
        {
          value: 'Custom Housing Config',
          label: 'Custom Housing Config',
        },
      ],
      Membership: [
        {
          value: 'File Layout',
          label: 'File Layout',
        },
        {
          value: 'Template Letter',
          label: 'Template Letter',
        },
      ],
      'SSO Processing': [
        {
          value: 'OnConnect Config',
          label: 'OnConnect Config',
        },
        {
          value: 'Onconnect Interface',
          label: 'Onconnect Interface',
        },
      ],
      'Credential Process': [
        {
          value: 'Digital Badge Template Screenshot',
          label: 'Digital Badge Template Screenshot',
        },
        {
          value: 'Physical Credential template',
          label: 'Physical Credential template',
        },
      ],
      'Visa Processing': [
        {
          value: 'VisaTemplateId',
          label: 'VisaTemplateId',
        },
      ],
      'Credential Print Options': [
        {
          value: 'Badge ExplosionColor',
          label: 'Badge ExplosionColor',
        },
        {
          value: 'BadgeColorBar',
          label: 'BadgeColorBar',
        },
        {
          value: 'BarExplosionText',
          label: 'BarExplosionText',
        },
        {
          value: 'Ribbons',
          label: 'Ribbons',
        },
      ],
    },
    exhibitor: {
      'Sessions input': [
        {
          value: 'Expert Clinic',
          label: 'Expert Clinic',
        },
        {
          value: 'Product Demo',
          label: 'Product Demo',
        },
      ],
      'SSO Processing': [
        {
          value: 'A2Z Interface',
          label: 'A2Z Interface',
        },
      ],
      'ESG Upsells': [
        {
          value: 'Lead Retrieval',
          label: 'Lead Retrieval',
        },
        {
          value: 'TrafficMax',
          label: 'TrafficMax',
        },
        {
          value: 'Virtual Booth',
          label: 'Virtual Booth',
        },
      ],
    },
  };
  customizationSubCategories = {
    'UI Access Control': [
      {
        value: 'Sessions',
        label: 'Sessions',
      },
      {
        value: 'Roster',
        label: 'Roster',
      },
      {
        value: 'Tickets',
        label: 'Tickets',
      },
    ],
    'Housing Customization': [
      {
        value: 'OnPeak Interface config',
        label: 'OnPeak Interface config',
      },
      {
        value: 'Custom Housing Config',
        label: 'Custom Housing Config',
      },
    ],
    Membership: [
      {
        value: 'File Layout',
        label: 'File Layout',
      },
      {
        value: 'Template Letter',
        label: 'Template Letter',
      },
    ],
    'SSO Processing': [
      {
        value: 'OnConnect Config',
        label: 'OnConnect Config',
      },
      {
        value: 'Onconnect Interface',
        label: 'Onconnect Interface',
      },
    ],
    'Credential Process': [
      {
        value: 'Digital Badge Template Screenshot',
        label: 'Digital Badge Template Screenshot',
      },
      {
        value: 'Physical Credential template',
        label: 'Physical Credential template',
      },
    ],
    'Visa Processing': [
      {
        value: 'VisaTemplateId',
        label: 'VisaTemplateId',
      },
      {
        value: 'Passport Name',
        label: 'Passport Name',
      },
      {
        value: 'Passport Date of Birth',
        label: 'Passport Date of Birth',
      },
      {
        value: 'Passport Gender',
        label: 'Passport Gender',
      },
    ],
    'Credential Print Options': [
      {
        value: 'Badge ExplosionColor',
        label: 'Badge ExplosionColor',
      },
      {
        value: 'BadgeColorBar',
        label: 'BadgeColorBar',
      },
      {
        value: 'BarExplosionText',
        label: 'BarExplosionText',
      },
      {
        value: 'Ribbons',
        label: 'Ribbons',
      },
    ],
  };
  tooltips = {
    'Visa Processing':
      'Visa letter includes basic event information for Visa requirements for international visitors',
  };
  customizationCategory: string = 'UI Access Control';
  optionSubcateogries: any[] = [];
  selectedCustomizations: any[] = [];
  selectedCustomizationId: number = -1;
  submittedCustomizations: any[] = [];
  visaLetterTemplate = {
    'Visa letter': ` [DATE]
    PASSPORT FN, LN*
    PASSPORT DOB*
    PASSPORT GENDER*
    PASSPORT NUMBER*
    PASSPORT EXPIRATION DATE*
    COMPANY*
    ADDRESS1*
    ADDRESS2
    CSZ COUNTRY*
    Dear [name_first] [name_last]*
    Thank you for registering for [Event Name]. The purpose of this letter is to invite you to attend the single most
    important and comprehensive international marketplace for Builder professionals. The exposition will be held
    [Event Date] at [Event location] and will host [Event Background] For additional information about [Event
    Name], please visit our website at www.compusystems.com.
    Please apply for your visa as quickly as possible. If you have any questions, please contact [POC] by email:
    [HYPERLINK=info@compusystems.com DISPLAY TEXT=same as link] or by phone: [Phone Number]
    During your stay in the United States, we understand that you will be responsible for your travel expenses
    including airfare, ground transportation, hotel, meals and insurance.
    We at [Event Organizer], along with our [Event Name] sponsors, are excited that you have expressed interest in
    [Event Name]; however, we have no influence on the decision of any U. S. embassy or consulate to approve or
    reject any application for a visa to enter the United States. As an applicant, it is your responsibility to present
    legitimate reasons for attending [Event Name] and provide all necessary documentation to support your request
    for a visa. If you have specific questions about obtaining a visa, contact the U. S. Department of State Bureau
    of Consulate Affairs Visa Services at [HYPERLINK=http://travel.state.gov/visa_services.html DISPLAY
    TEXT=same as link]`,
  };
  //EMAIL VLAS
  isaddAttendessFormSubmit = false;
  patchInfo = {} as any;
  columns = {} as any;
  data = {} as any;
  isReadMode = true;
  customQuestionsForm: FormGroup;
  customQuestionsForm2: FormGroup;
  currentFile: any;
  addUserid = localStorage.getItem('addUserid');
  enableTabs = false;
  displayTabs = {
    eventInfoTab: false,
    psmTab: true,
    // customizationsTab: false,
    qualificationTab: false,
    regtypesTab: false,
    packagesTab: false,
    discountTab: false,
    sessionCalendarTab: false,
    eventFloorplanTab: false,
    regCodeTab: false,
    builderTab: false,
    exhibitorTab: false,
    membershipTab: false,
    themingTab: false,
    startEvent: false,
  };
  addNewRowResp = false;
  pollingTypeCodes = [
    'Registration',
    'Session',
    'Post-Event',
    'Goal',
    'Interest',
    'Achievement',
    'Qualification',
    'Survey',
    'Marketing',
    'Metric',
    'Open-Ended',
  ];
  myNewEvent = {};
  events = [];
  pageBuilder = [];
  builderSelection = null;
  exhibitorSelection = null;
  organizerSelection = null;
  allowedGateways = [
    { gateway: 'chase', label: 'Chase' },
    { gateway: 'authorizenet', label: 'Authorizenet' },
    { gateway: 'worldpay', label: 'WorldPay/Vantiv' },
    { gateway: 'cybersource', label: 'Cybersource' },
  ];

  // ******* GOOGLE API *********//
  paymentRequestPass = false;
  paymentRequest: google.payments.api.PaymentDataRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [
      {
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['AMEX', 'VISA', 'MASTERCARD'],
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: 'example',
            gatewayMerchantId: 'exampleGatewayMerchantId',
          },
        },
      },
      //   {
      //     type: 'PAYPAL',
      //     parameters:{}
      //     tokenizationSpecification: {
      //       type: 'PAYMENT_GATEWAY',
      //       parameters: {
      //         gateway: 'example',
      //         gatewayMerchantId: 'exampleGatewayMerchantId'
      //       }
      //     }
      // }
    ],
    merchantInfo: {
      merchantId: '12345678901234567890',
      merchantName: 'Demo Merchant',
    },
    transactionInfo: {
      totalPriceStatus: 'FINAL',
      totalPriceLabel: 'Total',
      totalPrice: '0.10',
      currencyCode: 'USD',
      countryCode: 'US',
    },
    callbackIntents: ['PAYMENT_AUTHORIZATION'],
  };
  customCategories = ['Attendee', 'Exhibitor', 'Student', 'Media'];

  onLoadPaymentData = (event: Event): void => {
    console.log(this.paymentRequest);
    const eventDetail = event as CustomEvent<google.payments.api.PaymentData>;
    console.log('load payment data', eventDetail.detail);
  };
  discountCodes: any;
  psmImported: boolean = false;
  selectedDiscounts = [];
  discountList: any[] = [];
  newPaperBits: any;
  membershipAllotmentData: any = [];
  exhibitorAllotmentData: any = [];
  eventcost_editIndex: any = null;
  regtypeEditIndex: number = null;

  uploadLogo(event) {
    let reader = new FileReader(); // HTML5 FileReader API
    let file = event.target.files[0];
    if (event.target.files && event.target.files[0]) {
      reader.readAsDataURL(file);
    }
    // When file uploads set it to file formcontrol
    reader.onload = () => {
      localStorage.setItem('logo', `${reader.result}`);
    };
    this.cdRef.markForCheck();
  }
  onPaymentDataAuthorized: google.payments.api.PaymentAuthorizedHandler = (
    paymentData
  ) => {
    console.log(
      'Integration successful, keep in mind we cannot verify your Merchant ID or Gateway Merchant ID, until you make a real purchase'
    );
    this.paymentRequestPass = true;
    return {
      transactionState: 'SUCCESS',
    };
  };

  onError = (event: ErrorEvent): void => {
    this.eventInfoForm.controls.gateway.setErrors({
      gatewayMerchantIdNotFound: true,
    });
    console.log(`Integration unsuccessful ${event.error.statusMessage}`);
    this.paymentRequestPass = false;
  };

  // ******* END GOOGLE API *********//

  @ViewChild('NameFirstRef', { static: true }) NameFirstRef: ElementRef;
  @ViewChild('addDiscountTypeRef') addDiscountTypeRef: any;
  @ViewChild(MdbTableDirective, { static: true }) mdbTable: MdbTableDirective;
  questionElements: QuestionData[] = [];
  headQuestionElements = [
    {
      field: 'checked',
      label: 'Id',
    },
    {
      field: 'questionName',
      label: 'Question Name',
    },
    {
      field: 'question',
      label: 'Question',
    },
    {
      field: 'PollingType',
      label: 'Polling Type',
    },
  ];
  searchQuestionText: string = '';
  allQuestions: QuestionData[] = [];

  sessionTypesOptions = [
    'On-Site',
    'Virtual',
    // 'Lightning Talk',
    // 'Show and Tell',
    // 'Product Demo',
    // 'Expert Clinic',
    // 'Solution Room',
    // 'Think & Feedback',
    // 'Scenario Solving Exercise',
    // 'Roleplay',
    // 'Campfire Stories',
    // 'Founder Stories',
    // 'Interactive Quiz',
    // 'Business Pitch',
    // 'Hackathon',
    // 'Debate',
    // 'Brainstorm',
    // 'Newtwork Roundtable',
    // 'Meetup',
    // 'Streaming'
  ];

  sessionTopicsOptions = [
    'AGRICULTURE & FARMING',
    'AMUSEMENT, ENTERTAINMENT & GAMING',
    'SPORTING GOODS & RECREATION',
    'CONSUMER GOODS & RETAIL TRADE',
    'TOYS, HOBBIES & GIFTS',
    'EDUCATION, TRAINING, SCIENCE & RESEARCH',
    'ELECTRICAL & ELECTRONICS',
    'AUTOMOTIVE, TRUCKING & TRANSPORTATION',
    'TRAVEL, HOTELS & RESTAURANTS',
    'INDUSTRIAL',
    'MEDICAL & HEALTHCARE PRODUCTS',
    'BUILDING & CONSTRUCTION',
    'EXHIBITION & MEETING INDUSTRY',
    'FOOD & BEVERAGE',
    'MANUFACTURING & PACKAGING',
    'APPAREL, BEAUTY, SHOES & TEXTILES',
    'COMMUNICATIONS & BROADCASTING',
    'COMPUTERS & SOFTWARE APPLICATIONS',
    'AEROSPACE & AVIATION',
    'WASTE MANAGEMENT',
    'WATER, ENERGY & POWER',
    'POLICE, FIRE, SECURITY & EMERGENCY SERVICES',
    'MANAGEMENT, HUMAN RESOURCES & NETWORKING',
    'BUSINESS',
    'GOVERNMENT & MILITARY',
    'PRINTING, GRAPHICS, PHOTOGRAPHY & PUBLISHING',
    'MINING',
    'DENTAL',
  ];

  sessionGoalsOptions = [
    'Reconnect with my current suppliers/vendors about business opportunities',
    'Learn more about whats happening in my industry and my role in it (including Education sessions and Networking opportunities)',
    'Explore the event, look for new and interesting trends/ideas (i.e. walk every aisle)',
    'Socialize and meet up with friends and colleagues',
    'Create new opportunities by meeting as many new people as possible (Attendees or Exhibitors)',
    'Build a network of new people to create new business opportunities',
    'Explore the event for new and interesting products and ideas',
    'Target select people or exhibitors through pre-set meetings',
    'Learn about my profession and industry trends through education sessions or product demonstrations',
    'Address specific needs by meeting a few targeted people or Exhibitors.',
    'Achieve a defined business goal',
    'Target exhibitors through scheduled meetings',
    'Find Buyers',
    'Employment Opportunities',
    'Discover new vendors & solutions',
    'Requested to attend by my company',
    'Evaluate exhibiting in the future',
    'Gather information for a purchasing decision',
    'Career Advancement',
    'To meet with customers',
    'To present my work',
    'Discovering Products',
    'Learning',
    'Placing Orders',
    'Building Relationships',
    'Complete a story in progress',
    'Collect background info for future story',
    'Establish Relationships with Industry Leaders',
    'Other, please specify',
    'Meeting with Customers',
    'Finding new Suppliers',
  ];

  jobsCategory = [];
  questionEditIndex = null;
  // @ViewChild(MdbTableDirective, { static: true }) mdbGoalTable: MdbTableDirective;
  // @ViewChild(MdbTablePaginationComponent, { static: true }) mdbGoalTablePagination: MdbTablePaginationComponent;
  goalElements: any = [];
  headGoalElements = ['id', 'goal', 'response Value'];
  searchGoalText: string = '';
  previousGoal: string;

  goals = [
    {
      goal: 'Estimated Number of Registrations Achievement',
      dedDescription: [
        '0 - 5000',
        '5001 - 10000',
        '10001 - 15000',
        '15001 - 25000',
        '25001 - 40000',
        '40001 - 60000',
        'over 60000',
      ],
    },
    {
      goal: 'Estimated Number Session Attendance Achievement',
      dedDescription: [
        '0 - 5000',
        '5001 - 10000',
        '10001 - 15000',
        '15001 - 25000',
        '25001 - 40000',
        '40001 - 60000',
        'over 60000',
      ],
    },
    {
      goal: 'Estimated Number of Leads Achievement',
      dedDescription: [
        '0 - 5000',
        '5001 - 10000',
        '10001 - 15000',
        '15001 - 25000',
        '25001 - 40000',
        '40001 - 60000',
        'over 60000',
      ],
    },
    {
      goal: 'Average Event and Session Sentiment score',
      dedDescription: [
        '0 - 25%',
        '26 - 40%',
        '41 - 60%',
        '61 - 75%',
        '76 - 100%',
      ],
    },
    {
      goal: 'Estimated Number of Exhibitors Registered Achievement',
      dedDescription: [
        '0 - 100',
        '101 - 500',
        '501 - 1000',
        '1001 - 2000',
        'over 2000',
      ],
    },
    {
      goal: 'Average Number shared/repost on social Media',
      dedDescription: [
        '0 - 250',
        '251 - 500',
        '501 - 1000',
        '1001 - 2500',
        '2501 - 5000',
        '5001 - 10000',
        'over 10000',
      ],
    },
    {
      goal: 'Average Number of Attendee Chats',
      dedDescription: [
        '0 - 250',
        '251 - 500',
        '501 - 1000',
        '1001 - 2500',
        '2501 - 5000',
        '5001 - 10000',
        'over 10000',
      ],
    },
    {
      goal: 'Estimated Event Revenue Achievement',
      dedDescription: [
        '$0 - 5000',
        '$5001 - 10000',
        '$10001 - 25000',
        '$25001 - 150000',
        '$150001 - 500000',
        '$500001 - 1 million',
        '$1 million - 5 million',
      ],
    },
    {
      goal: 'Average Event Feedback Rating',
      dedDescription: ['1 - 6', '7', '8', '9', '10'],
    },
    {
      goal: 'Average Event Session Rating',
      dedDescription: ['1 - 6', '7', '8', '9', '10'],
    },
    {
      goal: 'Average Number of Attendees Finishing Session',
      dedDescription: [
        '0 - 25%',
        '26 - 40%',
        '41 - 60%',
        '61 - 75%',
        'over 75%',
      ],
    },
    {
      goal: 'Average Positive Polling Response',
      dedDescription: [
        '0 - 25%',
        '26 - 40%',
        '41 - 60%',
        '61 - 75%',
        'over 75%',
      ],
    },
  ];

  numAttendeesOptions = ['5', '10', '25', '50', '100', '200', 'No Limit'];

  addUsersEmail = {
    NameFirst: '',
    NameLast: '',
    EmailAddrTxt: '',
  };
  currentUsersEmail = [] as any;
  allRegCodes = [];
  regtypesList: RegtypeData[] = [];
  addNewRegTypes = false;
  newRegType = {
    type: '',
    description: '',
  };
  regtypeForm: FormGroup = new FormGroup({
    code: new FormControl("", [Validators.required, Validators.maxLength(3)]),
    name: new FormControl("", [Validators.required]),
    description: new FormControl("", [Validators.required])
  });

  launchBuilder = true;

  eventUid: string = '2593418';
  themesData = [
    {
      url: '/assets/img/theme-chicago.png',
      type: 'Chicago Bears',
      json: '<theme_type>-workflow-<wfNum>-chicago-bears.json',
    },
    {
      url: '/assets/img/theme2.png',
      type: 'Standard',
      json: '<theme_type>-workflow-<wfNum>.json',
    },
  ];
  themeModlRef;
  dedDescriptionMaxLength = 255;
  activeSpeakerTab = 1;
  speakerList = [];
  addNewSpeakerRef;
  createNewSpeakerForm: FormGroup;

  @ViewChild(BusinessRulesComponent) businessRulesComponent;
  @ViewChild(ExhibitorComponent) exhibitorComponent;
  @ViewChild(MembershipComponent) membershipComponent;

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private sessionService: SessionServiceService,
    private httpClient: HttpClient,
    public fb: FormBuilder,
    public fb2: FormBuilder,
    private cdRef: ChangeDetectorRef,
    public toastService: ToastService,
    @Inject(WINDOW) private window: Window,
    private localStorageService: LocalStorageService,
    private bucket: UploadService,
    private sanitizer: DomSanitizer
  ) {

    if (localStorage.getItem("Authorization")) {
      headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Access-Control-Allow-Headers', 'Content-Type')
      .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .set('Access-Control-Allow-Origin', '*')
      .set('Authorization', localStorage.getItem("Authorization"));
    }
    console.log('builderTemplateType', this.builderTemplateType);
    this.discountCodes = sessionService.discountCodes;
    this.templateHidden = true;
    if (this.sessionService.get('selectedEvent') != undefined) {
      this.isUpdate = true;
      this.myEventID = this.sessionService.get('selectedEvent');
      this.sessionService.remove('selectedEvent');
      var EVENT_DATA_API =
        API_URL + '/csi/event/services/event/findById/' + this.myEventID;
      this.httpClient.get(EVENT_DATA_API, { headers }).subscribe((data) => {
        console.log(data);
        if (data && data['response'] && data['response']['event']) {
          this.eventName = data['response']['event']['evtName']
            ? data['response']['event']['evtName']
            : '';
          this.description = data['response']['event']['eventInfoText']
            ? data['response']['event']['eventInfoText']
            : '';
          this.startDate = data['response']['event']['showStartDate']
            ? data['response']['event']['showStartDate'].split(' ')[0]
            : '';
          this.endDate = data['response']['event']['showEndDate']
            ? data['response']['event']['showEndDate'].split(' ')[0]
            : '';
          this.builderIOID = data['response']['event']['builderId']
            ? data['response']['event']['builderId']
            : '';
        }
      });
    }
  }

  // @HostListener('input') oninput() {
  //   this.searchItems();
  // }

  public addOption() {
    var options = $('#regCodeList').find(':selected').text();
    $('select.multiselect2').append(options);
  }

  public addAllOptions() {
    // var options = $('select.regCodeList option').toArray().sort().clone();
    // $('select.multiselect2').append(options);
  }

  public setBuilderType(event: any) {
    console.log('fired', event);
    this.builderType = event.target.value;
    console.log('this.builderType = type', event.target.value);
  }

  public filterBuilderTemplateName() {
    if (this.builderType === null) {
      return [];
    }
    console.log('this.builderType', this.builderType);
    console.log('this.builderTemplate', this.builderTemplate);

    const result = this.builderTemplate.filter(
      (template) => template.templateType === this.builderType
    );
    console.log(result);
    return result;
  }

  public delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  public async launchPaperBits(jsonValue, url, i) {
    var userName = this.localStorageService.get('username');
    if (!userName) {
      this.toastService.show('Username does not exist. Please login again.', {
        delay: 6000,
        classname: 'bg-warning text-dark',
        headertext: 'Warning',
        autohide: true,
      });
      return false;
    }

    let selectedType = this.builderTemplate[i]?.templateType;
    /** Check if the url is new with builderSelection and launch the paperbits */
    if (
      this.builderSelection === url &&
      this.builderIOID &&
      this.newPaperBits &&
      this.newPaperBits.json === jsonValue
    ) {
      this.builderUrlLoading = false;
      this.isLaunchPaperBitsVisible = true;
      this.openBuilderUrl(this.builderIOID, userName, url);
      return;
    }

    if (
      this.exhibitorSelection === url &&
      this.exhibitorIOID &&
      this.newPaperBits &&
      this.newPaperBits.json === jsonValue
    ) {
      this.builderUrlLoading = false;
      this.isLaunchPaperBitsVisible = true;
      this.openBuilderUrl(this.exhibitorIOID, userName, url);
      return;
    }

    if (
      this.organizerSelection === url &&
      this.organizerIOID &&
      this.newPaperBits &&
      this.newPaperBits.json === jsonValue
    ) {
      this.builderUrlLoading = false;
      this.isLaunchPaperBitsVisible = true;
      this.openBuilderUrl(this.organizerIOID, userName, url);
      return;
    }

    console.log('index: ', i);
    this.builderTemplate = this.builderTemplate?.map((template, index) => {
      if (template.templateType == selectedType && index == i) {
        return {
          ...template,
          checked: true,
        };
      } else if (template.templateType != selectedType) {
        return template;
      }
      return {
        ...template,
        checked: false,
      };
    });
    console.log('launchPaperBits parameters', jsonValue, url);
    this.isLaunchPaperBitsVisible = false;
    this.builderUrlLoading = true;
    // var userId = localStorage.getItem('userId');

    var PAPBERBITS_SERVICE_API =
      API_URL2 + '/csi/event/services/eventSetupV2/paperBitsDBInit';

    var pBitsInitBody = {
      projectId: projectId,
      clientName: userName,
      json: jsonValue,
    };

    this.newPaperBits = pBitsInitBody;

    if (jsonValue === '') {
      delete this.newPaperBits.json;
    }

    console.log(pBitsInitBody);

    /** Set the builder Selection from the builderTemplate url */
    if (selectedType == 'Attendee') {
      this.builderSelection = url;
    } else if (selectedType == 'Exhibitor') {
      this.exhibitorSelection = url;
    } else {
      this.organizerSelection = url;
    }
    await this.delay(1000);
    await this.httpClient
      .post<any>(PAPBERBITS_SERVICE_API, pBitsInitBody, { headers })
      .pipe(
        finalize(() => {
          this.builderUrlLoading = false;
          this.isLaunchPaperBitsVisible = true;
        })
      )
      .subscribe(
        (data) => {
          console.log(PAPBERBITS_SERVICE_API);
          console.log(data);
          this.isLaunchPaperBitsVisible = true;

          if (data['response'].invalidProperty !== undefined) {
            this.errorCode = data['response'].invalidProperty;
            Swal.fire({
              icon: 'error',
              title: 'Error detected',
              text: 'An error occurred' + this.errorCode,
              confirmButtonColor: '#3085d6',
            });
          } else {
            console.log('success');
            this.errorCode = null;
            if (selectedType == 'Attendee') {
              this.builderIOID = data['response']['guid'];
              this.openBuilderUrl(this.builderIOID, userName, url);
            } else if (selectedType == 'Exhibitor') {
              this.exhibitorIOID = data['response']['guid'];
              this.openBuilderUrl(this.exhibitorIOID, userName, url);
            } else {
              this.organizerIOID = data['response']['guid'];
              this.openBuilderUrl(this.organizerIOID, userName, url);
            }
          }
        },
        (error) => {
          const errorMessage = `Launching your page builder failed. Error -  ${error.message}`;
          Swal.fire({
            icon: 'error',
            title: 'Error detected',
            text: errorMessage,
            confirmButtonColor: '#3085d6',
          });
          console.log(error);
        }
      );
  }

  private openBuilderUrl(IOID, userName, url) {
    this.builderUrl =
      environment.PAPERBITS_URL + '/' + userName + '/' + IOID + url;
    console.log(this.builderUrl);
    window.open(this.builderUrl, '_blank');
  }

  viewGeneratedPage() {
    console.log(`viewing generated builderUrl ${this.builderUrl}`);
    if (this.builderUrl) {
      window.open(this.builderUrl, '_blank').focus();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error detected',
        text: 'Page not generated',
        confirmButtonColor: '#3085d6',
      });
    }
  }

  public publishPaperBits() {
    if (this.builderPublishing == true) {
      this.toastService.show(
        'Please wait for the publisher to finish publishing',
        {
          delay: 6000,
          classname: 'bg-warning text-light',
          headertext: 'One moment',
          autohide: true,
        }
      );
      return;
    }
    this.builderPublishing = true;
    // var userId = localStorage.getItem('userId');
    var userName = this.localStorageService.get('username');
    if (!userName) {
      this.toastService.show('Username does not exist. Please login again.', {
        delay: 6000,
        classname: 'bg-warning text-dark',
        headertext: 'Warning',
        autohide: true,
      });
      return false;
    }
    var PAPBERBITS_SERVICE_API =
      API_URL + '/csi/event/services/eventV2/publishPaperbitsForEvent';
    var newPaperBits = {
      projectId: projectId,
      clientName: userName,
      guid: this.builderIOID,
    };
    this.httpClient
      .post<any>(PAPBERBITS_SERVICE_API, newPaperBits, { headers })
      .subscribe(
        (data) => {
          console.log(PAPBERBITS_SERVICE_API);
          console.log(data);
          if (data['response'].invalidProperty !== undefined) {
            this.errorCode = data['response'].invalidProperty;
          } else {
            console.log('success');
            this.errorCode = null;
            this.builderPublishing = true;
            this.publishButtonText = 'Waiting for Publisher';
            // this.isPublishPaperBitsVisible = false;
            console.log('timeout checkIsPublishPaperBitsDone()');
            setTimeout(() => {
              this.checkIsPublishPaperBitsDone();
            }, 1000);
          }
        },
        (error: HttpErrorResponse) => {
          console.error(error);
        }
      );
  }

  public checkIsPublishPaperBitsDone() {
    // var userId = localStorage.getItem('userId');
    var userName = this.localStorageService.get('username');
    var PAPBERBITS_SERVICE_API =
      API_URL +
      '/csi/event/services/eventV2/isPublishPaperbitsForEventCompleted';
    var newPaperBits = {
      projectId: projectId,
      clientName: userName,
      guid: this.builderIOID,
    };
    this.httpClient
      .post<any>(PAPBERBITS_SERVICE_API, newPaperBits, { headers })
      .subscribe((data) => {
        console.log(PAPBERBITS_SERVICE_API);
        console.log(data);
        if (data['response'].invalidProperty !== undefined) {
          this.errorCode = data['response'].invalidProperty;
        } else {
          console.log('success');
          this.errorCode = null;
          this.buildComplete = data['response']['buildComplete'];
          if (this.buildComplete == 'yes') {
            this.builderPublishing = false;
            this.publishButtonText = 'Publish Paperbits';
            // this.isPublishPaperBitsVisible = true;
            this.builderUrl =
              FIREBASE_URL + userName + '/' + this.builderIOID + '/';
            console.log(this.builderUrl);
            window.open(this.builderUrl, '_blank');
          } else {
            console.log('success');
            this.errorCode = null;
            this.builderPublishing = true;
            this.publishButtonText = 'Waiting for Publisher';
            this.isPublishPaperBitsVisible = false;
            console.log('timeout checkIsPublishPaperBitsDone()');
            setTimeout(() => {
              this.checkIsPublishPaperBitsDone();
            }, 1000);
          }
        }
      });
  }

  public setBuilderTheme() {
    var THEME_API =
      API_URL + '/csi/event/services/event/createEventTheme?evtUid=';

    var newTheme = {
      themeFileLocation: this.builderIOID,
      eventThemeId: '',
      eventThemeDescTxt: 'Event Page',
      logoFileLoc: 'logoFileLoc',
      backroundColor: '#03DAC6',
      backgroundImageFileLoc: 'backgroundImageFileLoc',
      primaryTxtColor: '#FFFFFF',
      secondaryTxtColor: '#000000',
    };

    /*  ""themeFileLocation"":""builder.io page id"",
    ""eventThemeId"":""SystemGeneratedThemeId"",
    ""eventThemeDescTxt"":""Event Theme Description (BuilderIO - Page Name)?"",
    ""logoFileLoc"":""logoFileLoc"",
    ""backroundColor"":""#03DAC6"",
    ""backgroundImageFileLoc"":""backgroundImageFileLoc"",
    ""primaryTxtColor"":""#FFFFFF"",
    ""secondaryTxtColor"":""#000000"" */
  }

  public sendGetRequest() {
    //return this.httpClient.get(this.REST_API_SERVER, { headers });
  }

  public generatedEventID() {
    // Since we're sending the emails when the event is created, create a temp EventID for EventBuilderIO

    this.eventID = '999';
  }

  public createNewEvent() {
    this.createdEventComplete = 'true';
    console.log('createdEvent');

    //this.createEventProcess();
  }

  changedMessageSendType(event: any) {
    //update the ui
    this.messageSendType = event.target.value;
    this.messageSendTypeDescript = $('#messageSendType :selected').text();

    if (this.messageSendType == '1' || this.messageSendType == '3') {
      this.templateHidden = false;
    } else {
      this.templateHidden = true;
    }

    console.log('templateHidden: ' + this.templateHidden);
  }

  //event handler for the select element's change event
  changedDiscount(event: any) {
    //update the ui
    this.addDiscountType = event.target.value;
    this.addDiscountTypeDescript = $('#addDiscountType :selected').text();

    if (event.target.value == 'null') {
      this.selectedDiscounts = [];
      this.dollarDiscounts = [];
      this.percentageDiscounts = [];
    }
  }

  percentageDiscounts = [];
  dollarDiscounts = [];
  dollarDiscountAmounts = [];
  percentageDiscountAmounts = [];
  customPages = [];

  addDiscount() {
    if (!this.addDiscountType) {
      return;
    }

    // const existingDiscount = this.discountList.filter(discount => discount.discountType === this.addDiscountType && discount.discountStatus === "active");
    // if (existingDiscount.length > 0) {
    //   Swal.fire({
    //     icon: 'error',
    //     title: 'Error detected',
    //     text: "Duplicates are not allowed.",
    //     confirmButtonColor: '#3085d6',
    //   });
    //   return;
    // }

    const addDiscountRef = this.modalService.open(AddDiscountComponent, {
      size: 'lg',
      windowClass: 'modal-custom-addDiscount',
      backdrop: 'static',
    });

    addDiscountRef.componentInstance.discountType = this.addDiscountType;
    addDiscountRef.componentInstance.discountList = this.discountList;
    addDiscountRef.componentInstance.regtypesList = this.regtypesList;
    addDiscountRef.componentInstance.isEdit = false;

    addDiscountRef.result.then((newDiscount: any) => {
      console.log('newDiscount: ', newDiscount);
      if (newDiscount) {
        newDiscount['startDate'] = moment(
          this.eventInfoForm.controls.startDate.value
        ).toDate();
        newDiscount['endDate'] = moment(
          this.eventInfoForm.controls.endDate.value
        ).toDate();
        this.discountList.push(newDiscount);
      }
    });

    return false;
  }

  editDiscount(discount: any, index: number) {
    const editDiscountRef = this.modalService.open(AddDiscountComponent, {
      size: 'lg',
      windowClass: 'modal-custom-addDiscount',
      backdrop: 'static',
    });

    editDiscountRef.componentInstance.discountType = discount.discountType;
    editDiscountRef.componentInstance.discount = discount;
    editDiscountRef.componentInstance.discountList = this.discountList;
    editDiscountRef.componentInstance.regtypesList = this.regtypesList;
    editDiscountRef.componentInstance.index = index;
    editDiscountRef.componentInstance.isEdit = true;

    editDiscountRef.result.then((discount) => {
      console.log('edit discount: ', discount);
      if (discount) {
        discount['startDate'] = moment(
          this.eventInfoForm.controls.startDate.value
        ).toDate();
        discount['endDate'] = moment(
          this.eventInfoForm.controls.endDate.value
        ).toDate();
        this.discountList[index] = discount;
      }
    });
  }

  deleteDiscount(discount: any, index: number) {
    this.discountList.splice(index, 1);
  }

  get allDiscountsVerified() {
    if (this.discountList?.length < 1) {
      return false;
    }
    return true;
  }

  namesToDisplay = [];

  public addUser(passedVal) {
    this.namesToDisplay.push(passedVal);
  }

  public parseCommaText() {
    console.log('this.emailsComma', this.emailsComma);
    var rawText = this.emailsComma;
    var emailsSeparated = rawText.split(',');

    for (let i = 0, len = emailsSeparated.length; i < len; i++) {
      var myNewUser = {
        internetAddr: emailsSeparated[i],
        nameFirst: '[Text',
        nameLast: 'Upload]',
      };

      this.addUser(myNewUser);
    }
  }

  public addCSVUsers() {
    var getText = $('#csvText').val();
    var emailsSeparated = (<string>getText).split('\n');
    this.csvResults = emailsSeparated;

    console.log(emailsSeparated);

    for (let i = 0, len = emailsSeparated.length; i < len; i++) {
      if (emailsSeparated[i] != '') {
        var myNewUser = {
          internetAddr: emailsSeparated[i],
          nameFirst: '[CSV',
          nameLast: 'Upload]',
        };

        this.addUser(myNewUser);
      }
    }
  }

  public onFileLoad(fileLoadedEvent) {
    console.log('ONFILELOAD');
    const textFromFileLoaded = fileLoadedEvent.target.result;
    this.csvContent = textFromFileLoaded;

    $('#csvText').val(this.csvContent);

    //this.addCSVUsers();
  }

  public onFileSelect(input: HTMLInputElement) {
    console.log('ONFILESELECT');
    const files = input.files;
    var content = this.csvContent;
    if (files && files.length) {
      const fileToRead = files[0];

      const fileReader = new FileReader();
      fileReader.onload = this.onFileLoad;

      fileReader.readAsText(fileToRead, 'UTF-8');
    }
  }

  onSelectEarlyBirdCostForm() {
    if (this.isEventEarlyBirdCostFormHidden) {
      this.isEventEarlyBirdCostFormHidden = true;
      this.eventEarlyBirdCostForm.controls.earlyBirdStartDate.reset();
      this.eventEarlyBirdCostForm.controls.earlyBirdEndDate.reset();
      this.eventEarlyBirdCostForm.controls.earlyBirdRate.reset();
      this.eventEarlyBirdCostForm.controls.earlyBirdStartDate.setErrors(null);
      this.eventEarlyBirdCostForm.controls.earlyBirdEndDate.setErrors(null);
      this.eventEarlyBirdCostForm.controls.earlyBirdRate.setErrors(null);
    } else {
      this.isEventEarlyBirdCostFormHidden = false;
    }
    this.isEventEarlyBirdCostFormHidden = !this.isEventEarlyBirdCostFormHidden;
  }

  onSelectPreEventCostForm() {
    if (this.isEventPreEventBirdCostFormHidden) {
      this.isEventPreEventBirdCostFormHidden = true;
      this.eventPreEventBirdCostForm.controls.preEventBirdStartDate.reset();
      this.eventPreEventBirdCostForm.controls.preEventBirdEndDate.reset();
      this.eventPreEventBirdCostForm.controls.preEventBirdRate.reset();
      this.eventPreEventBirdCostForm.controls.preEventBirdStartDate.setErrors(
        null
      );
      this.eventPreEventBirdCostForm.controls.preEventBirdEndDate.setErrors(
        null
      );
      this.eventPreEventBirdCostForm.controls.preEventBirdRate.setErrors(null);
    } else {
      this.isEventPreEventBirdCostFormHidden = false;
    }
    this.isEventPreEventBirdCostFormHidden =
      !this.isEventPreEventBirdCostFormHidden;
  }

  public addRegType(passedVal) {
    regTypeQueue.push(passedVal);
    regTypeQueue = [...new Set(regTypeQueue)];
    this.eventDuringEventBirdCostForm.controls.duringEventBirdStartDate.patchValue(
      this.eventInfoForm.controls.startDate.value
    );
    this.eventDuringEventBirdCostForm.controls.duringEventBirdEndDate.patchValue(
      this.eventInfoForm.controls.endDate.value
    );
  }

  searchByQuestion() {
    console.log(this.questionSearch);

    var questionToSearch = this.questionSearch;
    var SEARCH_QUESTION_API =
      API_URL +
      '/csi/event/services/event/searchFilterQuestionsGoals?question=' +
      questionToSearch;

    this.httpClient.get(SEARCH_QUESTION_API, { headers }).subscribe((data) => {
      this.questionSearchResults = data['response'].results;
      console.log(data);
    });
  }

  open(content) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          // console.log(`Closed with: ${result}`);
        },
        (reason) => {
          // console.log(`Dismissed ${this.getDismissReason(reason)}`);
        }
      );
  }

  openQuestionDialog(content) {
    this.questionEditIndex = null;
    if (!this.searchQuestionText) {
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: 'Please select a regtype category',
        confirmButtonColor: '#3085d6',
      });
      return;
    }
    this.demDetailsClear();
    this.customQuestionsForm.reset();

    /** Set the Custom Questions Unique Id as uuid */
    let patchValue = {
      ...this.customQuestionsForm.value,
      demQuestion: 'question_gen_' + (this.allQuestions.length + 100),
    };
    this.customQuestionsForm.patchValue(patchValue);

    this.questionDialogRef = this.modalService.open(content, {
      size: 'lg',
      windowClass: 'modal-custom-question',
    });

    this.questionDialogRef.result.then((result) => {
      this.questionEditIndex = null;
    });
  }

  openThemeSelector(content, template) {
    this.selectedTemplate = template;
    this.themeModlRef = this.modalService.open(content, {
      size: 'lg',
      windowClass: 'modal-custom-question',
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  checkNoSessions() {
    if (this.noSessions) {
      this.sessionListing = [];
    }
  }

  public addSessionToQueue() {
    // Add all created sessions to the "sessionQueue" to be processed after
    // event is created and we have an event id
    if (this.noSessions) {
      return;
    }
    console.log(
      'addSessionToQueue - this.editSesionIndex',
      this.editSesionIndex
    );

    if (
      this.sessionForm.invalid ||
      this.isDateOutOfOrder(
        this.sessionForm.get('sesStartDate'),
        this.sessionForm.get('sesEndDate')
      ) ||
      this.isTimeOutOfOrder(
        this.sessionForm.get('sesStartDate'),
        this.sessionForm.get('sesEndDate'),
        this.sessionForm.get('sesStartTime'),
        this.sessionForm.get('sesEndTime')
      )
    ) {
      this.markFormGroupTouched(this.sessionForm);
      this.toastService.show('Please fill all mandatory fields in Sessions', {
        delay: 6000,
        classname: 'bg-warning text-light',
        headertext: 'Warning',
        autohide: true,
      });

      return;
    }
    if (+this.sessionForm.controls.sesCost.value > 9999) {
      this.toastService.show('Please validate values in Sessions', {
        delay: 6000,
        classname: 'bg-warning text-light',
        headertext: 'Warning',
        autohide: true,
      });
      return;
    }

    var newSession = {
      name: this.sessionForm.controls.sesName.value,
      sessionType: this.sessionForm.controls.sesType.value,
      privateSession: this.sessionForm.controls.sesPrivateSession.value,
      sessionAttendeeCapacity: this.sessionForm.controls.sesCapacity.value,
      topics: this.sessionForm.controls.sesTopics.value,
      speaker: this.sessionForm.controls.sesSpeaker.value,
      synopsis: this.sessionForm.controls.sesSynopsis.value,
      cost: this.sessionForm.controls.sesCost.value,
      discount: this.sessionForm.controls.sesDiscount.value,
      startDate: this.sessionForm.controls.sesStartDate.value,
      startTime: this.sessionForm.controls.sesStartTime.value,
      endDate: this.sessionForm.controls.sesEndDate.value,
      endTime: this.sessionForm.controls.sesEndTime.value,
      // "sessionGoals": this.sessionForm.controls.sessionGoals.value,
    };

    // if (
    //   this.checkIfSessionExistsForDates(
    //     this.getDateWithDateTime(newSession.startDate, newSession.startTime),
    //     this.getDateWithDateTime(newSession.endDate, newSession.endTime)
    //   )
    // ) {
    //   alert('Already session exists for the given date range');
    //   return;
    // }

    if (this.editSesionIndex != null) {
      this.sessionListing[this.editSesionIndex] = newSession;
      sessionQueue[this.editSesionIndex] = newSession;
      this.toastService.show('Your session has been updated', {
        delay: 6000,
        classname: 'bg-success text-light',
        headertext: 'Session Updated',
        autohide: true,
      });
    } else {
      this.sessionListing.push(newSession);
      sessionQueue.push(newSession);
      this.toastService.show('Your session has been added', {
        delay: 6000,
        classname: 'bg-success text-light',
        headertext: 'Session Added',
        autohide: true,
      });
    }

    console.log('this.sessionForm', this.sessionForm);
    console.log('this.sessionListing', this.sessionListing);
    console.log(sessionQueue);
    window.scroll(0, 0);
    this.clearSession();
  }

  dateRangeOverlaps(startDateA, endDateA, startDateB, endDateB) {
    return !(endDateA < startDateB || startDateA > endDateB);
  }
  getDateWithDateTime(date, time) {
    return new Date(date + (time ? ' ' + time : ' 00:00'));
  }
  checkIfSessionExistsForDates(startDate, endDate) {
    if (this.sessionListing.length === 0) {
      return false;
    }
    return this.sessionListing
      .map(
        (session, index) =>
          this.editSesionIndex != index &&
          this.dateRangeOverlaps(
            startDate,
            endDate,
            this.getDateWithDateTime(session.startDate, session.startTime),
            this.getDateWithDateTime(session.endDate, session.endTime)
          )
      )
      .every((x) => x === true);
  }
  clearSession() {
    this.editSesionIndex = null;
    this.sessionForm.controls.sesName.setValue('');
    this.sessionForm.controls.sesName.markAsUntouched();
    this.sessionForm.controls.sesName.markAsPristine();
    this.sessionForm.controls.sesType.setValue('');
    this.sessionForm.controls.sesType.markAsUntouched();
    this.sessionForm.controls.sesType.markAsPristine();
    this.sessionForm.controls.sesPrivateSession.setValue('');
    this.sessionForm.controls.sesPrivateSession.markAsUntouched();
    this.sessionForm.controls.sesPrivateSession.markAsPristine();
    this.sessionForm.controls.sesCapacity.setValue('');
    this.sessionForm.controls.sesCapacity.markAsUntouched();
    this.sessionForm.controls.sesCapacity.markAsPristine();
    this.sessionForm.controls.sesTopics.setValue('');
    this.sessionForm.controls.sesTopics.markAsUntouched();
    this.sessionForm.controls.sesTopics.markAsPristine();
    this.sessionForm.controls.sesSpeaker.setValue('');
    this.sessionForm.controls.sesSpeaker.markAsUntouched();
    this.sessionForm.controls.sesSpeaker.markAsPristine();
    this.sessionForm.controls.sesSynopsis.setValue('');
    this.sessionForm.controls.sesSynopsis.markAsUntouched();
    this.sessionForm.controls.sesSynopsis.markAsPristine();
    this.sessionForm.controls.sesCost.setValue('');
    this.sessionForm.controls.sesCost.markAsUntouched();
    this.sessionForm.controls.sesCost.markAsPristine();
    this.sessionForm.controls.sesDiscount.setValue('');
    this.sessionForm.controls.sesDiscount.markAsUntouched();
    this.sessionForm.controls.sesDiscount.markAsPristine();
    this.sessionForm.controls.sesStartDate.setValue('');
    this.sessionForm.controls.sesStartDate.markAsUntouched();
    this.sessionForm.controls.sesStartDate.markAsPristine();
    this.sessionForm.controls.sesStartTime.setValue('');
    this.sessionForm.controls.sesStartTime.markAsUntouched();
    this.sessionForm.controls.sesStartTime.markAsPristine();
    this.sessionForm.controls.sesEndDate.setValue('');
    this.sessionForm.controls.sesEndDate.markAsUntouched();
    this.sessionForm.controls.sesEndDate.markAsPristine();
    this.sessionForm.controls.sesEndTime.setValue('');
    this.sessionForm.controls.sesEndTime.markAsUntouched();
    this.sessionForm.controls.sesEndTime.markAsPristine();
    // this.sessionForm.controls.sessionGoals.setValue('');
    // this.sessionForm.controls.sessionGoals.markAsUntouched();
    // this.sessionForm.controls.sessionGoals.markAsPristine();
  }

  private removeSession(index) {
    this.sessionListing.splice(index, 1);
    sessionQueue.splice(index, 1);
    this.toastService.show('Your session has been removed', {
      delay: 6000,
      classname: 'bg-success text-light',
      headertext: 'Session Removed',
      autohide: true,
    });
    if (this.editSesionIndex == index) {
      this.clearSession();
    }
  }

  private editSession(index) {
    if (this.noSessions) {
      return;
    }
    this.editSesionIndex = index;
    console.log('editSession', this.sessionListing[index]);

    this.sessionForm.controls.sesName.setValue(this.sessionListing[index].name);
    this.sessionForm.controls.sesType.setValue(
      this.sessionTypesOptions.includes(this.sessionListing[index].sessionType)
        ? this.sessionListing[index].sessionType
        : ''
    );
    this.sessionForm.controls.sesPrivateSession.setValue(
      this.sessionListing[index].privateSession
    );
    this.sessionForm.controls.sesCapacity.setValue(
      this.sessionListing[index].sessionAttendeeCapacity
    );
    this.sessionForm.controls.sesTopics.setValue(
      this.sessionTopicsOptions.includes(
        this.sessionListing[index].topics.toString()
      )
        ? this.sessionListing[index].topics
        : ''
    );
    this.sessionForm.controls.sesSpeaker.setValue(
      this.sessionListing[index].speaker
    );
    this.sessionForm.controls.sesSynopsis.setValue(
      this.sessionListing[index].synopsis
    );
    this.sessionForm.controls.sesCost.setValue(this.sessionListing[index].cost);
    this.sessionForm.controls.sesDiscount.setValue(
      this.sessionListing[index].discount
    );
    this.sessionForm.controls.sesStartDate.setValue(
      this.sessionListing[index].startDate
    );
    this.sessionForm.controls.sesStartTime.setValue(
      this.sessionListing[index].startTime
    );
    this.sessionForm.controls.sesEndDate.setValue(
      this.sessionListing[index].endDate
    );
    this.sessionForm.controls.sesEndTime.setValue(
      this.sessionListing[index].endTime
    );
    // this.sessionForm.controls.sessionGoals.setValue(this.sessionListing[index].sessionGoals);
  }

  addEventCall() {
    $('#addNewEvent').trigger('click');

    this.addSessionToQueue();
  }

  isEmailAddressAdded(): boolean {
    return this.currentUsersEmail.length > 0;
  }

  runSave() {
    if (this.isEventNameFound()) {
      Swal.fire({
        icon: 'warning',
        title: 'Duplicate event name',
        text: 'You will be redirected to change the event name',
        confirmButtonColor: '#3085d6',
      });
      this.enableTab('eventInfoTab');
      return;
    }

    if(!(this.exhibitorComponent.getExhibitorData().length > 0)){
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: 'Add atleast one exhibitor allotment data',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    if(!(this.membershipComponent.getMembershipData().length > 0)){
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: 'Add atleast one membershipTab data',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    // if (this.isQuestionResultBtnDisabled) {
    //   Swal.fire({
    //     icon: 'warning',
    //     title: 'Question no selected',
    //     text: 'Please select at least one Question',
    //     confirmButtonColor: '#3085d6',
    //   });
    //   this.enableTab('regCodeTab');
    //   return;
    // }
    // if (!this.isEmailAddressAdded()) {
    //   const confirm = window.confirm(
    //     'Do you want to continue without adding any email addresses?'
    //   );
    //   if (!confirm) {
    //     this.NameFirstRef.nativeElement.focus();
    //     return;
    //   }
    // }
    // if (this.isGoalResultBtnDisabled) {
    //   alert('Please select at least one Goal');
    //   this.enableTab('regCodeTab');
    //   return;
    // }

    this.loading = true;
    this.createEventProcess();
  }

  public setNotifications(msg) {
    localStorage.setItem('notifications', msg);
  }
  public getRegTypes() {
    return regTypeQueue;
  }

  public createEventProcess() {
    //this.getBuilderIOKey();
    this.createDiscounts();
    this.createEvent();
    // Have to wait for create event to be done processing to get eventID before other items can be done
    //this.attachSessions();
    this.attachRegTypes();
    this.sendMailBlasts();
    console.log('event creation finished');
  }

  public attachSessions() {
    // Before you can add session, you must register user to be an exhibitor for the event
    var sessionsToProcesss = sessionQueue;
    var createdEventID = this.eventID;
    var creatorAttendeeID = localStorage.getItem('attendeeUid');

    var EXHIBITOR_API =
      API_URL +
      '/csi/event/services/liveEventServices/registerExhibitorToLiveEvent?evtUid=' +
      createdEventID +
      '&attendeeUid=' +
      creatorAttendeeID;

    console.log('Exhibitor API: ' + EXHIBITOR_API);

    var newExhibitor = {
      newProductShowFlag: 'Y',
      publishFlag: 'Y',
      facebookLink: '',
      linkedinLink: '',
      twitterLink: '',
      googleplusLink: '',
    };

    this.httpClient
      .post<any>(EXHIBITOR_API, newExhibitor, { headers })
      .subscribe(
        (data) => {
          console.log(EXHIBITOR_API);
          console.log(data);

          console.log(data);
          if (data['response'].invalidProperty !== undefined) {
            this.errorCode = data['response'].invalidProperty;
          } else {
            console.log('success');
            this.errorCode = null;

            // since exhibitor adding was a success, now add Sessions

            for (var x = 0; x < sessionsToProcesss.length; x++) {
              var ADD_SESSION_API =
                API_URL +
                '/csi/event/services/eventV2/createEventSession?evtUid=' +
                createdEventID +
                '&attendeeUid=' +
                creatorAttendeeID;

              console.log('Add Session URL: ' + ADD_SESSION_API);

              var newSession = {
                name: sessionsToProcesss[x]['name'],
                speaker: sessionsToProcesss[x]['speaker'],
                synopsis: sessionsToProcesss[x]['synopsis'],
                startDate: sessionsToProcesss[x]['startDate'],
                endDate: sessionsToProcesss[x]['endDate'],
                cost: '100',
                sessionType: 'Interactive Quiz',
                privateSession: sessionsToProcesss[x]['privateSession'],
                sessionAttendeeCapacity:
                  sessionsToProcesss[x]['sessionAttendeeCapacity'],
              };

              console.log('Processing.... ' + sessionsToProcesss[x]['name']);
              console.log(newSession);

              this.httpClient
                .post<any>(ADD_SESSION_API, newSession, { headers })
                .subscribe(
                  (data) => {
                    console.log(data);

                    // Check to see if "SUCCESS" Message Happens, but there is still a problem
                    // If an error occurs but "SUCCESS - 200" happens, data['response'].invalidProperty will have a value
                    // If that has a value, stop execution and alert user to fix it
                    if (data['response'].invalidProperty !== undefined) {
                      this.errorCode = data['response'].invalidProperty;
                    } else {
                      console.log('success');
                      this.errorCode = null;
                      console.log(data);
                      var eventID = this.eventID;
                      console.log(eventID);

                      this.setNotifications('A new session has been created!');
                      // window.location.href='/';
                    }
                  },
                  (error) => {
                    // If "FAILED" with a 400 error happens, display stop execution and display error to User
                    this.errorCode = error;
                    console.log(error);
                  }
                );
            }
          }
        },
        (error) => {
          // If "FAILED" with a 400 error happens, display stop execution and display error to User
          this.errorCode = error;
          console.log(error);
        }
      );
  }

  public attachRegTypes() {}

  public sendMailBlasts() {
    var BLAST_API =
      API_URL +
      `/csi/event/services/event/createEvtAttEmailBlast?evtUid=${this.eventUid}`;

    /* this.httpClient.post<any>(BLAST_API, , { headers }).subscribe(data => {

       // Check to see if "SUCCESS" Message Happens, but there is still a problem
       // If an error occurs but "SUCCESS - 200" happens, data['response'].invalidProperty will have a value
       // If that has a value, stop execution and alert user to fix it
       if (data['response'].invalidProperty !== undefined) {
           this.errorCode = data['response'].invalidProperty;
       } else {
           console.log('success');
           this.errorCode = null;
           console.log(data);
           var eventID = data['response'].eventCreator['id'];
           console.log(eventID);

           this.setNotifications("A new event, <a href='/event/" + eventID + "/'>" + this.eventName+ "</a> has been created!");
          // window.location.href='/';
       }

     },  error => {
         // If "FAILED" with a 400 error happens, display stop execution and display error to User
         this.errorCode = error;
         console.log(error);
     });*/
  }

  public createDiscounts() {
    var x = 0;
    var discArray: {};

    //First build dollar discounts
    $('.dollarDiv').each(function () {
      //var discountVal =   $(this).find('input[type=text]').val();

      var n = x.toString();

      discArray = {
        discountName: $(this).children('label').html(),
        discountDescription: $(this).children('label').html(),
        discountValue: $(this).children(':input').val(),
        discountPercentage: '0',
      };

      //this.dollarDiscountFields = discArray;

      x++;
    });

    // Then build percentage discounts
    $('.percentage').each(function (i) {
      var n = x.toString();

      discArray = {
        discountName: $(this).children('label').html(),
        discountDescription: $(this).children('label').html(),
        discountValue: $(this).children(':input').val(),
        discountPercentage: '0',
      };

      // this.percentageDiscountFields = discArray;

      x++;
    });
  }

  removeRate(i) {
    /** Remove the regtype from the eventCosts */
    this.eventCosts.splice(i, 1);
    if (this.eventcost_editIndex === i) this.eventcost_editIndex = null;
  }

  removeRegAssociation(regCode: string, removedRegType: string) {
    /** Remove the regtype from the jobsCategory and qualificationRegTypeArray */
    const removedIndex: number = this.jobsCategory.findIndex(
      (regtype: string) => {
        return removedRegType === regtype;
      }
    );
    this.jobsCategory?.splice(removedIndex, 1);
    let newJobsCategory: string[] = [];
    this.jobsCategory.forEach((regtype: string) =>
      newJobsCategory.push(regtype)
    );
    this.jobsCategory = newJobsCategory;

    /** Filter the questions related to the removed regtypes */
    this.allQuestions = this.allQuestions.filter(
      (q: any) => q.category !== removedRegType
    );
    this.searchItems();

    /** Remove the apply regtypes related to the deleted regtype on discounts */
    let newDiscountList: any[] = [];
    this.discountList?.forEach((discount: any) => {
      const appliedRegtypes: string[] = discount?.appliedRegtypes;
      const newAppliedRegtypes: string[] = appliedRegtypes?.filter(
        (regtype: string) => regtype !== regCode
      );
      newDiscountList.push({
        ...discount,
        appliedRegtypes: newAppliedRegtypes,
      });
    });
    this.discountList = newDiscountList;

    /** Remove the qualification related to the deleted regtype */
    this.addedQualifications = this.addedQualifications?.filter(
      (q: any) => q?.regType !== removedRegType
    );

    /** Remove regtype from the allRegCodes variable */
    this.allRegCodes = this.allRegCodes?.filter((el: any) => el !== regCode);
  }

  addRate() {
    /** Get the form values */
    let earlyBird = {};
    let preEventBird = {};
    let duringEventBird = {};
    let rate: RateData|any = {};
    if (this.eventEarlyBirdCostForm.valid) {
      earlyBird = {
        earlyBirdStartDate: `${this.eventEarlyBirdCostForm.controls.earlyBirdStartDate.value}`,
        earlyBirdEndDate: `${this.eventEarlyBirdCostForm.controls.earlyBirdEndDate.value}`,
        earlyBirdRate: `${this.eventEarlyBirdCostForm.controls.earlyBirdRate.value}`,
      };
      rate = { ...rate, ...earlyBird };
    }

    if (this.eventPreEventBirdCostForm.valid) {
      preEventBird = {
        preEventBirdStartDate: `${this.eventPreEventBirdCostForm.controls.preEventBirdStartDate.value}`,
        preEventBirdEndDate: `${this.eventPreEventBirdCostForm.controls.preEventBirdEndDate.value}`,
        preEventBirdRate: `${this.eventPreEventBirdCostForm.controls.preEventBirdRate.value}`,
      };
      rate = { ...rate, ...preEventBird };
    }
    if (this.eventDuringEventBirdCostForm.valid) {
      duringEventBird = {
        duringEventBirdStartDate: `${this.eventDuringEventBirdCostForm.controls.duringEventBirdStartDate.value}`,
        duringEventBirdEndDate: `${this.eventDuringEventBirdCostForm.controls.duringEventBirdEndDate.value}`,
        duringEventBirdRate: `${this.eventDuringEventBirdCostForm.controls.duringEventBirdRate.value}`,
      };
      rate = { ...rate, ...duringEventBird };
    }
    const regtype: RegtypeData = this.regtypesList.find((regtype: RegtypeData) => regtype.description === this.customPackage.regtype);
    const eventCost: EventCostData = {
      refCodes: regtype.code + " - " + regtype.description,
      rates: rate,
      customPackage: {
        name: this.customPackage.name,
        description: this.customPackage.description,
        cost: this.customPackage.isZero ? 0 : this.customPackage.cost,
        isZero: this.customPackage.isZero,
      }
    };

    /** Check the form validation */
    let valid = true;
    let alert = '';
    if (
      eventCost.rates.earlyBirdStartDate && eventCost.rates.earlyBirdEndDate &&
      this.isDateOutOfOrder(
        this.addValue(eventCost.rates.earlyBirdStartDate),
        this.addValue(eventCost.rates.earlyBirdEndDate)
      )
    ) {
      alert = 'Earlybird start dates are out of order';
      valid = false;
    } else if (
      eventCost.rates.preEventBirdStartDate && eventCost.rates.preEventBirdEndDate &&
      this.isDateOutOfOrder(
        this.addValue(eventCost.rates.preEventBirdStartDate),
        this.addValue(eventCost.rates.preEventBirdEndDate)
      )
    ) {
      alert = 'PreEvent start dates are out of order';
      valid = false;
    } else if (
      eventCost.rates.duringEventBirdStartDate && eventCost.rates.duringEventBirdEndDate &&
      this.isDateOutOfOrder(
        this.addValue(eventCost.rates.duringEventBirdStartDate),
        this.addValue(eventCost.rates.duringEventBirdEndDate)
      )
    ) {
      alert = 'DuringEvent start dates are out of order';
      valid = false;
    } else if (
      (eventCost.rates.earlyBirdStartDate &&
        eventCost.rates.earlyBirdEndDate &&
        (eventCost.rates.earlyBirdRate == undefined ||
          eventCost.rates.earlyBirdRate == '')) ||
      (eventCost.rates.duringEventBirdStartDate &&
        eventCost.rates.duringEventBirdEndDate &&
        (eventCost.rates.duringEventBirdRate == undefined ||
          eventCost.rates.duringEventBirdRate == '')) ||
      (eventCost.rates.preEventBirdStartDate &&
        eventCost.rates.preEventBirdEndDate &&
        (eventCost.rates.preEventBirdRate == undefined ||
          eventCost.rates.preEventBirdRate == '')) ||
      (!eventCost.customPackage.cost && !eventCost.customPackage.isZero) ||
      !eventCost.customPackage.description ||
      !eventCost.customPackage.name
    ) {
      alert = 'Please fill all the fields';
      valid = false;
    }

    if (!valid) {
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: alert,
        confirmButtonColor: '#3085d6',
      });
      return;
    } else {
      if (this.eventcost_editIndex === null) {
        this.eventCosts.push(eventCost);
      } else {
        this.eventCosts[this.eventcost_editIndex] = eventCost;
      }
      this.resetRate();
    }
  }

  /** Cancel the adding/editing rate package */
  resetRate() {
    this.eventEarlyBirdCostForm.controls.earlyBirdStartDate.setValue("");
    this.eventEarlyBirdCostForm.controls.earlyBirdEndDate.setValue("");
    this.eventEarlyBirdCostForm.controls.earlyBirdRate.setValue("");
    this.eventPreEventBirdCostForm.controls.preEventBirdStartDate.setValue("");
    this.eventPreEventBirdCostForm.controls.preEventBirdEndDate.setValue("");
    this.eventPreEventBirdCostForm.controls.preEventBirdRate.setValue("");

    this.eventEarlyBirdCostForm.controls.earlyBirdStartDate.setErrors(null);
    this.eventEarlyBirdCostForm.controls.earlyBirdEndDate.setErrors(null);
    this.eventEarlyBirdCostForm.controls.earlyBirdRate.setErrors(null);
    this.eventPreEventBirdCostForm.controls.preEventBirdStartDate.setErrors(null);
    this.eventPreEventBirdCostForm.controls.preEventBirdEndDate.setErrors(null);
    this.eventPreEventBirdCostForm.controls.preEventBirdRate.setErrors(null);

    /** Set the During Event Start Date and End Date from the Event Start and End Date */
    const eventInfo: any = this.eventInfoForm.value;
    this.eventDuringEventBirdCostForm.patchValue({
      duringEventBirdStartDate: eventInfo?.startDate,
      duringEventBirdEndDate: eventInfo?.endDate,
      duringEventBirdRate: 0
    });

    this.customPackage = {
      regtype: '',
      name: '',
      description: '',
      cost: 0
    };

    this.eventcost_editIndex = null;
    this.isEventEarlyBirdCostFormHidden = true;
    this.isEventPreEventBirdCostFormHidden = true;
  }

  public createEvent() {
    const questions = this.questionResult.map((item) => {
      return {
        questionName: item['questionName'],
        category: item['category'],
        question: item['question'],
        PollingType: 'Registration',
        demDetails: item['demDetails'] ? item['demDetails'] : [],
        responseLayout: item['responseLayout'] ? item['responseLayout'] : '',
        columns: item['columns'] ? item['columns'] : '',
        checked: item['checked'],
      };
    });

    const goals = this.goalResult.map((item) => {
      return {
        questionName: item['questionName'],
        goal: item['goal'],
        responseValue: item['responseValue'],
        importance: item['importance'],
        PollingType: item['PollingType'],
      };
    });

    const address = `${this.eventInfoForm.controls.address1.value}${
      this.eventInfoForm.controls.address2.value
        ? ', ' + this.eventInfoForm.controls.address2.value
        : ''
    }${
      this.eventInfoForm.controls.address3.value
        ? ', ' + this.eventInfoForm.controls.address3.value
        : ''
    }`;

    this.myNewEvent = {
      noSessions: this.noSessions,
      psmImported: this.psmImported,
      attendeeUid: localStorage.getItem('attendeeUid'),
      builderId: this.builderIOID,
      exhibitorId: this.exhibitorIOID,
      exhibitorSelection: this.exhibitorSelection,
      organizerId: this.organizerIOID,
      organizerSelection: this.organizerSelection,
      builderURL: this.builderUrl,
      regWorkflowUrls: [],
      speakers: this.speakerList,
      // theme: this.selectedTemplate? this.selectedTemplate.theme.type: "",
      businessRules: [], //this.businessRulesComponent.getBusinessRule(),
      exhibitorInfo: this.exhibitorComponent.getExhibitorData(),
      membershipInfo: this.membershipComponent.getMembershipData(),
      addUserid: this.localStorageService.get('username'),
      eventInfo: {
        name: this.eventInfoForm.controls.eventYear.value
          ? `${this.eventInfoForm.controls.eventName.value} ${this.eventInfoForm.controls.eventYear.value}`
          : this.eventInfoForm.controls.eventName.value,
        description: this.eventInfoForm.controls.description.value,
        reqProjMgrName: this.eventInfoForm.controls.reqProjMgrName.value,
        salesExecName: this.eventInfoForm.controls.salesExecName.value,
        custServicePhoneNumber:
          this.eventInfoForm.controls.custServicePhoneNumber.value,
        custServiceEmailAddress:
          this.eventInfoForm.controls.custServiceEmailAddress.value,
        eventSecurityLevel:
          this.eventInfoForm.controls.eventSecurityLevel.value,
        eventFormat: this.eventInfoForm.controls.eventFormat.value,
        categories: this.eventInfoForm.controls.categories.value,
        googleMerchantId: this.eventInfoForm.controls.googleMerchantId.value,
        gateway: this.eventInfoForm.controls.gateway.value,
        gatewayMerchantId: this.eventInfoForm.controls.gatewayMerchantId.value,
        discounts: this.discountList,
        startDate: this.eventInfoForm.controls.startDate.value,
        startTime: this.eventInfoForm.controls.startTime.value,
        endDate: this.eventInfoForm.controls.endDate.value,
        endTime: this.eventInfoForm.controls.endTime.value,
        venueAddress: address,
        venueAddress1: this.eventInfoForm.controls.address1.value,
        venueAddress2: this.eventInfoForm.controls.address2.value,
        venueAddress3: this.eventInfoForm.controls.address3.value,
        venueCity: this.eventInfoForm.controls.city.value,
        venueCounty: this.eventInfoForm.controls.county.value,
        venueStateProvinceRegion: this.eventInfoForm.controls.state.value,
        venueCountrySpecificCode: this.eventInfoForm.controls.countryCode.value,
        venueCountry: this.eventInfoForm.controls.country.value,
        venuePostalCode: this.eventInfoForm.controls.zip.value,
        mainPhoneNumber: this.eventInfoForm.controls.phone.value,
        associationPhoneNumb: this.eventInfoForm.controls.phone.value,
        typeOfEvent: {
          seminar: this.eventInfoForm.controls.Seminar.value,
          social: this.eventInfoForm.controls.Social.value,
          trade: this.eventInfoForm.controls.Trade.value,
          workshop: this.eventInfoForm.controls.Workshop.value,
        },
      },
      eventCosts: this.eventCosts,
      qualifications: this.addedQualifications.map((x) => {
        delete x.sampleQualificationFileDataData;
        return x;
      }),
      // .map((q: any) => {
      //   return {
      //     regType: q.regType,
      //     qualification: q.qualification,
      //   };
      // }),
      sessions: this.sessionListing.map((e) => {
        delete e.isValid;
        return e;
      }),
      eventFloorPlan: {
        floorPlanImageUrl: this.floorPlanImageUrl
          ? this.floorPlanImageUrl
          : null,
      },
      questions: questions,
      customizations: this.submittedCustomizations,
      goals: goals,
      builderPageInfoList: this.pageBuilder,
      builderSelection: this.builderSelection,
      eBlastList: this.currentUsersEmail,
      builderTemplates: this.builderTemplate,
    };
    console.log(this.myNewEvent);
    console.log(JSON.stringify(this.myNewEvent));
    console.log(this.CREATE_EVENT_API);

    this.httpClient
      .post<any>(this.CREATE_EVENT_API, this.myNewEvent, { headers })
      .subscribe(
        (data) => {
          console.log(data);
          // Check to see if "SUCCESS" Message Happens, but there is still a problem
          // If an error occurs but "SUCCESS - 200" happens, data['response'].invalidProperty will have a value
          // If that has a value, stop execution and alert user to fix it
          if (data['response'].invalidProperty !== undefined) {
            this.errorCode = data['response'].invalidProperty;
          } else {
            console.log(data);
            // const exhibitor_membership_data = {evtuid:  data.response.evtuid, data: {exhibitor: this.exhibitorComponent.getExhibitorData(), membership: this.membershipComponent.getMembershipData()} };
            // localStorage.setItem('exhibitor_membership_data', JSON.stringify(exhibitor_membership_data))
            this.errorCode = null;
            this.toastService.show('Your Event Has Been Created', {
              delay: 6000,
              classname: 'bg-success text-light',
              headertext: 'Success',
              autohide: true,
            });
            this.router.navigate(['']);

            // var eventID = data['response']['eventNode']['evtUid'];

            // console.log(eventID);
            // this.eventID = eventID;
            // console.log('EVENT ID: ' + this.eventID);

            // TODO

            // var builderPageInfoList = [];

            // for (const key in this.eventPages) {
            //   var eventType = this.eventPages[key]['pageName'];
            //   eventType = eventType.toLowerCase().replaceAll(' ', '-');

            //   var builderPageInfo = {
            //     evtUid: this.eventID,
            //     eventName: this.eventPages[key]['pageName'],
            //     eventBuilderUuid: this.eventPages[key]['builderUuid'],
            //     evtType: eventType,
            //     menuName: this.eventPages[key]['menuName']
            //   };

            //   builderPageInfoList.push(builderPageInfo);
            // }

            // var SAVE_BUILDER_UUID_API =
            //   API_URL +
            //   '/csi/event/services/event/saveBuilderUuidsForEvent?evtUid=' +
            //   this.eventID;
            // console.log(SAVE_BUILDER_UUID_API);

            // var obj = {
            //   evtUid: this.eventID,
            //   builderPageInfoList: builderPageInfoList
            // };

            // this.httpClient
            //   .post<any>(SAVE_BUILDER_UUID_API, obj, { headers })
            //   .subscribe(data => {
            //     if (data['response']['Error'] != undefined) {
            //       console.log(data['response']['Error']);
            //     } else {
            //       console.log(data);
            //     }
            //   });

            // this.attachSessions();

            // now that we have an eventUid, save the builderID to themes
            // var THEME_API =
            //   API_URL +
            //   '/api/csi/event/services/event/createEventTheme?evtUid=' +
            //   this.eventID;

            // adding default values for colors and file locations... this will be for badging later
            // var newTheme = {
            //   themeFileLocation: this.builderIOID,
            //   eventThemeId: '',
            //   eventThemeDescTxt: 'Event Page',
            //   logoFileLoc: 'logoFileLoc',
            //   backroundColor: '#03DAC6',
            //   backgroundImageFileLoc: 'backgroundImageFileLoc',
            //   primaryTxtColor: '#FFFFFF',
            //   secondaryTxtColor: '#000000'
            // };

            // this.httpClient.post<any>(THEME_API, JSON.stringify(newTheme), { headers }).subscribe(data => {
            //   console.log(THEME_API);
            //   console.log(data);
            //   // Check to see if "SUCCESS" Message Happens, but there is still a problem
            //   // If an error occurs but "SUCCESS - 200" happens, data['response'].invalidProperty will have a value
            //   // If that has a value, stop execution and alert user to fix it
            //   if (data['response'].invalidProperty !== undefined) {
            //       this.errorCode = data['response'].invalidProperty;
            //   } else {

            //   }
            // });

            // alert('Your Event Has Been Created');
            // this.setNotifications(
            //   "A new event, <a href='/event/" +
            //     eventID +
            //     "/'>" +
            //     this.eventName +
            //     '</a> has been created!'
            // );
          }
        },
        (error) => {
          // If "FAILED" with a 400 error happens, display stop execution and display error to User
          this.errorCode = error;

          Swal.fire({
            icon: 'error',
            title: 'Event Not Detected',
            text: 'There was an error creating your event. Try again.',
            confirmButtonColor: '#3085d6',
          });

          this.loading = false;

          console.log(error);
        }
      );
  }
  initializeForm() {
    this.customQuestionsForm = this.fb.group({
      pollingTypeCode: ['', [Validators.required, Validators.maxLength(30)]],
      responseLayout: ['', [Validators.required, Validators.maxLength(30)]],
      columns: [1, []],
      demQuestion: ['', [Validators.required, Validators.maxLength(30)]],
      description: ['', [Validators.required, Validators.maxLength(200)]],
      demDetails: this.fb.array([]),
    });

    this.createNewSpeakerForm = new FormGroup({
      speakerName: new FormControl('', Validators.required),
      description: new FormControl(''),
      company: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      phone: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      website: new FormControl('', Validators.required),
      subcategory: new FormControl([]),
      highLevelCat: new FormControl(''),
      photoUpload: new FormControl(''),
    });
    this.createNewSpeakerForm.controls['website'].valueChanges.subscribe(
      (value: string) => {
        if (value) {
          const weblinkPattern: RegExp =
            /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm;
          const valid: boolean = weblinkPattern.test(value);
          if (!valid) {
            this.cnsf['website'].setErrors({ link: true });
          } else {
            this.cnsf['website'].setErrors(null);
          }
        }
      }
    );
  }
  ngOnInit(): void {
    this.publishButtonText = 'Publish Paperbits';
    this.initializeForm();
    this.getAllEvents();

    this.formValidation();

    this.setEventYear();

    this.getDefaultQuestions();

    var modal = document.getElementById('myModal');
    modal.style.display = 'none';

    // Get the button that opens the modal
    var btn = document.getElementById('myBtn');

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName('close')[0];

    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = 'none';
      }
    };

    function toggleColor(src) {
      $(src).addClass('col-3-clicked');
    }

    function launchSignup() {
      modal.style.display = 'block';
    }

    function updateBlock() {}

    $(function () {
      $('.tab-content:first-child').show();
      $('.tab-nav-link').bind('click', function (e) {
        console.log('Event ID: 230849682');

        let myThis = $(this);
        let target = $(myThis.data('target')); // get the target from data attribute
        myThis.siblings().removeClass('current');
        target.siblings().css('display', 'none');
        myThis.addClass('current');
        target.fadeIn('fast');
      });
      $('.tab-nav-link:first-child').trigger('click');
    });

    this.regCode = $('#eventType option:selected').text();

    this.mdbTable.setDataSource(this.allQuestions);

    // Get Goal data
    let i = 0;
    this.goals.forEach((element) => {
      this.goalElements.push({
        id: i,
        questionName: `goal${String(i++).padStart(3, '0')}`,
        goal: element.goal,
        dedDescription: element.dedDescription,
        responseValue: null,
        importance: 10,
        PollingType: 'Goal',
        checked: false,
      });
    });
  }

  private setEventYear() {
    let i = 0;
    for (let i = 0; i < 10; i++) {
      this.eventYear.push(this.date.getFullYear() + i);
    }
  }

  private getDefaultQuestions() {
    const GET_DEFAULT_QUESTIONS =
      API_URL2 + '/csi/event/services/eventSetupV2/getDefaultQuestions';
    this.httpClient.get(GET_DEFAULT_QUESTIONS, { headers }).subscribe(
      (data: any) => {
        console.error(data);
        if (data?.response?.Error != undefined) {
          console.error(data?.response?.Error);
          Swal.fire({
            icon: 'warning',
            title: 'Error detected',
            text: 'The session selected has no information associated with it.',
            confirmButtonColor: '#3085d6',
          });
        } else {
          const defaultQuestions: QuestionData[] = data?.response?.questions;
          defaultQuestions.forEach((ele) => {
            ele.id = this.allQuestions.length;
            ele.checked = false;
            this.allQuestions.push(ele);
          });
          this.searchItems();
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  private getAllEvents() {
    var GET_ALL_EVENTS = API_URL2 + '/csi/event/services/eventV2/getAllEvents';

    this.httpClient.get(GET_ALL_EVENTS, { headers }).subscribe((data) => {
      if (data['response']['Error'] != undefined) {
        console.log(data['response']['Error']);
        Swal.fire({
          icon: 'warning',
          title: 'Error detected',
          text: 'The session selected has no information associated with it.',
          confirmButtonColor: '#3085d6',
        });
      } else {
        const response = data['response'].events;
        response.forEach((event) => {
          this.events.push(event.evtName.toUpperCase());
        });
      }
    });
  }

  formValidation(): void {
    this.eventInfoForm = this.fb.group({
      eventName: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(75),
        ],
      ],
      reqProjMgrName: ['', [Validators.required, Validators.maxLength(30)]],
      salesExecName: ['', [Validators.required, Validators.maxLength(30)]],
      custServicePhoneNumber: [
        '',
        [
          Validators.required,
          Validators.maxLength(20),
          // Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-s./0-9]*$')
        ],
      ],
      custServiceEmailAddress: ['', [Validators.required, Validators.email]],
      eventYear: [''],
      description: ['', [Validators.required, Validators.maxLength(4000)]],
      eventSecurityLevel: ['', [Validators.required]],
      eventFormat: ['', [Validators.required]],
      categories: ['', [Validators.required]],
      googleMerchantId: ['', [Validators.required, Validators.maxLength(30)]],
      gateway: ['', [Validators.required]],
      gatewayMerchantId: ['', [Validators.required, Validators.maxLength(30)]],
      startDate: ['', [Validators.required]],
      startTime: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      address1: [
        '',
        [
          Validators.required,
          Validators.maxLength(255),
          // Validators.pattern(
          //   /^(?:[Pp][Oo]\s[Bb][Oo][Xx]|[0-9]+)\s(?:[0-9A-Za-z\.'#]|[^\S\r\n])+/
          // )
        ],
      ],
      address2: ['', [Validators.maxLength(40)]],
      address3: ['', [Validators.maxLength(40)]],
      city: ['', [Validators.required, Validators.maxLength(40)]],
      state: ['', [Validators.required, Validators.maxLength(40)]],
      county: ['', [Validators.maxLength(40)]],
      country: ['The United States of America', [Validators.maxLength(40)]],
      countryCode: ['US', [Validators.maxLength(40)]],
      zip: ['', [Validators.required]],
      phone: [
        '',
        [
          Validators.required,
          Validators.maxLength(20),
          // Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-s./0-9]*$')
        ],
      ],

      TaxIDNumber: new FormControl(false),
      PayStub: new FormControl(false),
      BusLi: new FormControl(false),
      PhotoID: new FormControl(false),
      Seminar: new FormControl(false),
      Social: new FormControl(false),
      Trade: new FormControl(false),
      Workshop: new FormControl(false),
    });

    this.eventEarlyBirdCostForm = this.fb.group({
      earlyBirdStartDate: [''],
      earlyBirdEndDate: [''],
      earlyBirdRate: [''],
    });

    this.eventPreEventBirdCostForm = this.fb.group({
      preEventBirdStartDate: ['', [Validators.max(9999)]],
      preEventBirdEndDate: ['', [Validators.max(9999)]],
      preEventBirdRate: ['', [Validators.max(9999)]],
    });

    this.eventDuringEventBirdCostForm = this.fb.group({
      duringEventBirdStartDate: ['', [Validators.required]],
      duringEventBirdEndDate: ['', [Validators.required]],
      duringEventBirdRate: ['', [Validators.required, Validators.max(9999)]],
    });

    this.pageBuilderForm = this.fb.group({
      menuName: ['', [Validators.required]],
      pageName: ['', [Validators.required]],
      main: ['', [Validators.required]],
    });

    this.sessionForm = this.fb.group({
      sesName: ['', [Validators.required, Validators.maxLength(300)]],
      sesType: ['', [Validators.required]],
      sesPrivateSession: ['', [Validators.required]],
      sesCapacity: [
        '',
        [Validators.required, Validators.max(9999), Validators.min(1)],
      ],
      sesTopics: ['', [Validators.required]],
      sesSynopsis: ['', [Validators.required, Validators.maxLength(2500)]],
      sesCost: ['', [Validators.required]],
      sesDiscount: [''],
      sesSpeaker: [''],
      sesStartDate: ['', [Validators.required]],
      sesStartTime: ['', [Validators.required]],
      // sessionGoals: [''],
      sesEndDate: ['', [Validators.required]],
      sesEndTime: ['', [Validators.required]],
    });

    // console.log('------->>>>>>', this.eventInfoForm.controls);
  }

  ngAfterViewInit() {
    this.cdRef.detectChanges();
  }

  buildPaymentRequest() {
    this.paymentRequestPass = false;

    if (this.eventInfoForm.controls.gateway.value != '') {
      this.eventInfoForm.controls.gateway.setErrors(null);
    }

    this.paymentRequest.merchantInfo.merchantId =
      this.eventInfoForm.controls.googleMerchantId.value;
    this.paymentRequest.allowedPaymentMethods[0].tokenizationSpecification.parameters =
      {
        gateway: this.eventInfoForm.controls.gateway.value,
        gatewayMerchantId: this.eventInfoForm.controls.gatewayMerchantId.value,
      };
  }

  searchItems() {
    this.mdbTable.setDataSource(this.allQuestions);
    if (this.searchQuestionText) {
      this.questionElements = this.mdbTable.filterLocalDataByMultipleFields(
        this.searchQuestionText,
        ['category']
      );
    } else {
      this.questionElements = [];
    }
  }

  imageUrl: any = '';

  uploadFloorplan(event) {
    let reader = new FileReader(); // HTML5 FileReader API
    let file = event.target.files[0];
    if (event.target.files && event.target.files[0]) {
      reader.readAsDataURL(file);
    }
    // When file uploads set it to file formcontrol
    reader.onload = () => {
      // this.imageUrl = reader.result;
      this.floorPlanImageUrl = reader.result;
      // console.log(this.imageUrl);
      // console.log("this.floorPlanImageUrl", this.floorPlanImageUrl);
    };

    // ChangeDetectorRef since file is loading outside the zone
    this.cdRef.markForCheck();
  }

  removeFloorplanImage() {
    this.floorPlanImageUrl = null;
    // console.log("this.floorPlanImageUrl", this.floorPlanImageUrl);
    let imageUpload = document.getElementById('imageUpload');
    if (imageUpload) (imageUpload as HTMLInputElement).value = '';
    this.cdRef.markForCheck();
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  enableTab(tabName, validCheckReq: boolean = true) {
    if (tabName === 'qualificationTab') {
      regTypeQueue.forEach((type: string) => {
        this.noQualifications[type] = false;
      });
    }
    if(tabName == 'builderTab'){
      this.builderTemplate.forEach((template, i) => {
        const $event = { target: {checked: template.checked} }
        this.changeTemplate($event, template, i);
      })
    }
    if (tabName === 'regCodeTab') {
      if(this.jobsCategory.length > 0){
        this.searchQuestionText = this.jobsCategory[0];
        this.searchItems();
      }
    }
    if (tabName === 'packagesTab') {
      /** Set the During Event Start Date and End Date from the Event Start and End Date */
      const eventDuringEventBirdCost: any = this.eventDuringEventBirdCostForm.value;
      if (
        !eventDuringEventBirdCost.duringEventBirdStartDate &&
        !eventDuringEventBirdCost.duringEventBirdEndDate &&
        !eventDuringEventBirdCost.duringEventBirdRate
      ) {
        const eventInfo: any = this.eventInfoForm.value;
        this.eventDuringEventBirdCostForm.patchValue({
          duringEventBirdStartDate: eventInfo?.startDate,
          duringEventBirdEndDate: eventInfo?.endDate,
          duringEventBirdRate: 0
        });
      }
    }
    window.scroll(0, 0);
    if (validCheckReq) {
      if (tabName === 'regtypesTab') {
        this.markFormGroupTouched(this.eventInfoForm);
        Swal.fire({
          icon: 'warning',
          title: 'Check Again',
          text: 'Please fill all mandatory fields in Event Info',
          confirmButtonColor: '#3085d6',
        });
        return;
      }
      if (tabName === 'discountTab') {
        if (this.eventCosts.length < 1) {
          this.markFormGroupTouched(this.eventEarlyBirdCostForm);
          this.markFormGroupTouched(this.eventPreEventBirdCostForm);
          this.markFormGroupTouched(this.eventDuringEventBirdCostForm);
          Swal.fire({
            icon: 'warning',
            title: 'Check Again',
            text: 'Please build at least a Event Cost',
            confirmButtonColor: '#3085d6',
          });
          return;
        }
        const allRegtypeMatched: boolean = this.regtypesList.every((regtype: RegtypeData) => this.eventCosts.find((eventCost: EventCostData) => eventCost.refCodes === regtype.code + " - " + regtype.description));
        if (!allRegtypeMatched) {
          let notMappedList: string[] = [];
          this.regtypesList.forEach((regtype: RegtypeData) => {
            const mappingExisting: boolean = Boolean(this.eventCosts.find((eventCost: EventCostData) => eventCost.refCodes === regtype.code + " - " + regtype.description));
            if (!mappingExisting) {
              notMappedList.push(regtype.description);
            }
          });
          Swal.fire({
            icon: 'warning',
            title: 'Check Again',
            text: 'Every reg type must have at least one package mapping: ' + notMappedList.join(", ") + ".",
            confirmButtonColor: '#3085d6',
          });
          return;
        }
      }
      if (tabName === 'builderTab') {
        this.submitCustomizations();
        // if (this.hasCheckedCustomizations()) {
        // } else {
        //   alert('Please check at least one customization');
        //   return;
        // }
      }
      if (
        tabName === 'eventFloorplanTab' &&
        !this.noSessions &&
        (this.sessionListing.length < 1 ||
          (this.sessionListing.length < 1 && this.sessionForm.invalid))
      ) {
        this.markFormGroupTouched(this.sessionForm);
        if (this.sessionForm.valid) {
          Swal.fire({
            icon: 'warning',
            title: 'Check Again',
            text: 'Please add at least one session',
            confirmButtonColor: '#3085d6',
          });
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Check Again',
            text: 'Please fill all mandatory fields in Sessions',
            confirmButtonColor: '#3085d6',
          });
        }
        return;
      }
      if (
        tabName === 'eventFloorplanTab' &&
        !this.noSessions &&
        this.sessionListing.length > 1
      ) {
        let anySessionInvalid = false;
        this.sessionListing.forEach((e, index) => {
          this.editSession(index);
          e.isValid = this.sessionForm.valid;
          if (!this.sessionForm.valid) {
            anySessionInvalid = true;
          }
        });
        this.clearSession();
        if (anySessionInvalid) {
          Swal.fire({
            icon: 'warning',
            title: 'Check Again',
            text: 'Please Enter Valid Values into highlighted sessions',
            confirmButtonColor: '#3085d6',
          });
          return;
        }
      }
      // if (tabName === 'themingTab' && this.pageBuilderForm.controls.main.invalid) {
      //   alert("Please select Main Page");
      //   return;
      // }
      // if (tabName === 'themingTab' && this.customPages.length < 1) {
      //   alert("Please create at least one Page Builder");
      //   return;
      // }
      // if (tabName === 'regCodeTab' && !this.floorPlanImageUrl) {
      //   alert('Please upload a floorplan image');
      //   return false;
      // }

      if('membershipTab' === tabName && !(this.exhibitorComponent.getExhibitorData().length > 0)){
        Swal.fire({
          icon: 'warning',
          title: 'Check Again',
          text: 'Add atleast one exhibitor allotment data',
          confirmButtonColor: '#3085d6',
        });
        return;
      }

      if('startEvent' === tabName && !(this.membershipComponent.getMembershipData().length > 0)){
        Swal.fire({
          icon: 'warning',
          title: 'Check Again',
          text: 'Add atleast one membershipTab data',
          confirmButtonColor: '#3085d6',
        });
        return;
      }

      if (
        tabName === 'exhibitorTab' &&
        !(this.builderIOID && this.exhibitorIOID)
      ) {
        const alert = 'Please Launch the Website Builder';
        Swal.fire({
          icon: 'warning',
          title: 'Check Again',
          text: alert,
          confirmButtonColor: '#3085d6',
        });
        return;
      }
      if (
        tabName === 'exhibitorTab' &&
        this.builderIOID &&
        this.builderPublishing == true
      ) {
        const alert = 'Please wait for the publisher to finish publishing';
        this.toastService.show(alert, {
          delay: 6000,
          classname: 'bg-warning text-light',
          headertext: 'One Moment',
          autohide: true,
        });
        return;
      }

      if (tabName === 'qualificationTab' && this.checkIfRegtypeExists()) {
        const alert = 'One or more discounts are missing a reg type';
        Swal.fire({
          icon: 'warning',
          title: 'Check Again',
          text: alert,
          confirmButtonColor: '#3085d6',
        });
        return;
      }
      // if (tabName === 'customizationsTab' && this.isQuestionResultBtnDisabled) {
      //   alert('Please select at least one Question');
      //   return;
      // }
      // if (tabName === 'customizationsTab' && this.isGoalResultBtnDisabled) {
      //   alert('Please select at least one Goal');
      //   return;
      // }
    }

    // if (tabName === 'customizationsTab' && !this.validateSelectedQuestion()) {
    //   return;
    // }

    // if (tabName === 'membershipTab') {//businessRulesTab
    //   if (!this.isEmailAddressAdded()) {
    //     const confirm = window.confirm(
    //       'Do you want to continue without adding any email addresses?'
    //     );
    //     if (!confirm) {
    //       this.NameFirstRef.nativeElement.focus();
    //       return;
    //     }
    //   }
    // }

    this.displayTabs = {
      eventInfoTab: false,
      psmTab: false,
      // customizationsTab: false,
      qualificationTab: false,
      regtypesTab: false,
      packagesTab: false,
      discountTab: false,
      sessionCalendarTab: false,
      eventFloorplanTab: false,
      regCodeTab: false,
      builderTab: false,
      exhibitorTab: false,
      membershipTab: false,
      themingTab: false,
      startEvent: false,
    };
    this.displayTabs[tabName] = true;
  }

  validateSelectedQuestion() {
    for (let i of this.questionResult) {
      if (
        !i.responseLayout ||
        (i.demDetails &&
          i.demDetails.length == 0 &&
          i.responseLayout != 'Freetext')
      ) {
        const alert = `Response is missing in '${i.question}' for '${i.category}'`;
        Swal.fire({
          icon: 'warning',
          title: 'Check Again',
          text: alert,
          confirmButtonColor: '#3085d6',
        });
        return false;
      }
    }
    return true;
  }

  isTabValidate(tabName, clickedOnTab?): boolean {
    if (
      tabName === 'eventInfoTab' &&
      (this.eventInfoForm.invalid ||
        !this.typeOfEvent ||
        this.isDateOutOfOrder(
          this.eventInfoForm.get('startDate').value,
          this.eventInfoForm.get('endDate').value
        ) ||
        this.isEventNameFound())
    ) {
      // this.markFormGroupTouched(this.eventInfoForm);
      const alert = 'Please fill all mandatory fields in Event Info';
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: alert,
        confirmButtonColor: '#3085d6',
      });
      return false;
    }
    if (
      tabName === 'packagesTab' &&
      this.eventCosts.length < 1 &&
      (!this.eventPreEventBirdCostForm.valid ||
        !this.eventEarlyBirdCostForm.valid ||
        !this.eventDuringEventBirdCostForm.valid ||
        this.isDateOutOfOrder(
          this.eventPreEventBirdCostForm.get('preEventBirdStartDate'),
          this.eventPreEventBirdCostForm.get('preEventBirdEndDate')
        ) ||
        this.isDateOutOfOrder(
          this.eventEarlyBirdCostForm.get('earlyBirdStartDate'),
          this.eventEarlyBirdCostForm.get('earlyBirdEndDate')
        ) ||
        this.isDateOutOfOrder(
          this.eventDuringEventBirdCostForm.get('duringEventBirdStartDate'),
          this.eventDuringEventBirdCostForm.get('duringEventBirdEndDate')
        ) ||
        this.isDateOutOfOrder(
          this.eventPreEventBirdCostForm.get('preEventBirdEndDate'),
          this.eventDuringEventBirdCostForm.get('duringEventBirdStartDate')
        ) ||
        this.isDateOutOfOrder(
          this.eventEarlyBirdCostForm.get('earlyBirdEndDate'),
          this.eventPreEventBirdCostForm.get('preEventBirdStartDate')
        ))
    ) {
      this.markFormGroupTouched(this.eventEarlyBirdCostForm);
      this.markFormGroupTouched(this.eventPreEventBirdCostForm);
      this.markFormGroupTouched(this.eventDuringEventBirdCostForm);
      const alert = 'Please fill all mandatory fields in Event Costs';
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: alert,
        confirmButtonColor: '#3085d6',
      });
      return false;
    }
    if (
      tabName === 'packagesTab' &&
      (this.isDateOutOfOrder(
        this.eventEarlyBirdCostForm.get('earlyBirdStartDate'),
        this.eventEarlyBirdCostForm.get('earlyBirdEndDate')
      ) ||
        this.isDateOutOfOrder(
          this.eventDuringEventBirdCostForm.get('duringEventBirdStartDate'),
          this.eventDuringEventBirdCostForm.get('duringEventBirdEndDate')
        ) ||
        this.isDateOutOfOrder(
          this.eventPreEventBirdCostForm.get('preEventBirdStartDate'),
          this.eventPreEventBirdCostForm.get('preEventBirdEndDate')
        ))
    ) {
      const alert = 'Please check the dates in Event Costs';
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: alert,
        confirmButtonColor: '#3085d6',
      });
      return false;
    }

    if (
      !this.noSessions &&
      tabName === 'sessionCalendarTab' &&
      (this.sessionListing.length < 1 ||
        (this.sessionListing.length < 1 && this.sessionForm.invalid))
    ) {
      this.markFormGroupTouched(this.sessionForm);
      if (this.sessionForm.valid) {
        const alert = 'Please Add at least one session';
        Swal.fire({
          icon: 'warning',
          title: 'Check Again',
          text: alert,
          confirmButtonColor: '#3085d6',
        });
      } else {
        const alert = 'Please fill all mandatory fields in Sessions';
        Swal.fire({
          icon: 'warning',
          title: 'Check Again',
          text: alert,
          confirmButtonColor: '#3085d6',
        });
      }
      return false;
    }
    if (tabName === 'sessionCalendarTab' && this.sessionListing.length > 1) {
      let anySessionInvalid = false;
      this.sessionListing.forEach((e, index) => {
        this.editSession(index);
        e.isValid = this.sessionForm.valid;
        if (!this.sessionForm.valid) {
          anySessionInvalid = true;
        }
      });
      this.clearSession();
      if (anySessionInvalid) {
        const alert = 'Please Enter Valid Values into highlighted sessions';
        Swal.fire({
          icon: 'warning',
          title: 'Check Again',
          text: alert,
          confirmButtonColor: '#3085d6',
        });
        return;
      }
    }
    // if (tabName === 'eventFloorplanTab' && !this.floorPlanImageUrl) {
    //   alert('Please upload a floorplan image');
    //   return false;
    // }
    // if (tabName === 'themingTab' && this.pageBuilderForm.controls.main.invalid) {
    //   alert("Please select Main Page");
    //   return false;
    // }
    // if (tabName === 'themingTab' && this.customPages.length < 1) {
    //   alert("Please create at least one Page Builder");
    //   return false;
    // }
    // if (tabName === 'regCodeTab' && this.isQuestionResultBtnDisabled) {
    //   const alert = 'Please select at least one Question';
    //   Swal.fire({
    //     icon: 'warning',
    //     title: 'Check Again',
    //     text: alert,
    //     confirmButtonColor: '#3085d6',
    //   });
    //   return false;
    // }
    if (tabName === 'regCodeTab' && !this.validateSelectedQuestion()) {
        return false;
    }
    if (clickedOnTab === 'regCodeTab') {
      if(this.jobsCategory.length > 0){
        this.searchQuestionText = this.jobsCategory[0];
        this.searchItems();
      }
    }
    if(clickedOnTab == 'builderTab'){
      this.builderTemplate.forEach((template, i) => {
        const $event = { target: {checked: template.checked} }
        this.changeTemplate($event, template, i);
      })
    }
    // if (tabName === 'regCodeTab' && this.isGoalResultBtnDisabled) {
    //   alert('Please select at least one Goal');
    //   return false;
    // }

    if('exhibitorTab' === tabName && !(this.exhibitorComponent.getExhibitorData().length > 0)){
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: 'Add atleast one exhibitor allotment data',
        confirmButtonColor: '#3085d6',
      });
      return false;
    }

    if('membershipTab' === tabName && !(this.membershipComponent.getMembershipData().length > 0)){
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: 'Add atleast one membershipTab data',
        confirmButtonColor: '#3085d6',
      });
      return false;
    }

    if (tabName === 'discountTab' && this.checkIfRegtypeExists()) {
      const alert = 'One or more discounts are missing a reg type';
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: alert,
        confirmButtonColor: '#3085d6',
      });
      return false;
    }

    return true;
  }
  enableTabNav() {
    this.enableTabs = !this.enableTabs;
  }
  gotoTab(tabName: string) {
    // this.enableTab(tabName);
    if (this.enableTabs) {
      if (tabName === 'packagesTab') {
        /** Set the During Event Start Date and End Date from the Event Start and End Date */
        const eventDuringEventBirdCost: any = this.eventDuringEventBirdCostForm.value;
        if (
          !eventDuringEventBirdCost.duringEventBirdStartDate &&
          !eventDuringEventBirdCost.duringEventBirdEndDate &&
          !eventDuringEventBirdCost.duringEventBirdRate
        ) {
          const eventInfo: any = this.eventInfoForm.value;
          this.eventDuringEventBirdCostForm.patchValue({
            duringEventBirdStartDate: eventInfo?.startDate,
            duringEventBirdEndDate: eventInfo?.endDate,
            duringEventBirdRate: 0
          });
        }
      }
      if (tabName === 'qualificationTab') {
        regTypeQueue.forEach((type: string) => {
          this.noQualifications[type] = false;
        });
      }
      const currentTab = Object.keys(this.displayTabs).find(
        (tab) => this.displayTabs[tab] === true
      );
      if (this.isTabValidate(currentTab, tabName)) {
        console.log('this.builderUrl', this.builderUrl);
        if (tabName === 'exhibitorTab' && this.builderUrl === undefined) {
          const alert =
            'You must launch the paperbits designer at least once before continuing';
          Swal.fire({
            icon: 'warning',
            title: 'Check Again',
            text: alert,
            confirmButtonColor: '#3085d6',
          });
        } else {
          this.displayTabs = {
            eventInfoTab: false,
            psmTab: false,
            // customizationsTab: false,
            qualificationTab: false,
            regtypesTab: false,
            packagesTab: false,
            discountTab: false,
            sessionCalendarTab: false,
            eventFloorplanTab: false,
            regCodeTab: false,
            builderTab: false,
            exhibitorTab: false,
            membershipTab: false,
            themingTab: false,
            startEvent: false,
          };
          this.displayTabs[tabName] = true;
        }
      }
    }
  }

  gotoConfigTab(tabName: string) {
    this.visaConfigTabs = {
      visaPreview: false,
      attendeeResponse: false,
      csiResponse: false,
    };
    this.visaConfigTabs[tabName] = true;
  }

  get typeOfEvent() {
    const result =
      this.eventInfoForm.controls.Seminar.value ||
      this.eventInfoForm.controls.Social.value ||
      this.eventInfoForm.controls.Trade.value ||
      this.eventInfoForm.controls.Workshop.value;
    return result;
  }

  get typeOfEventFormTouched() {
    const result =
      this.eventInfoForm.controls.Seminar.dirty ||
      this.eventInfoForm.controls.Seminar.touched ||
      this.eventInfoForm.controls.Social.dirty ||
      this.eventInfoForm.controls.Social.touched ||
      this.eventInfoForm.controls.Trade.dirty ||
      this.eventInfoForm.controls.Trade.touched ||
      this.eventInfoForm.controls.Workshop.dirty ||
      this.eventInfoForm.controls.Workshop.touched;
    return result;
  }

  get questionResult() {
    const temp = this.mdbTable.getDataSource();
    return temp;
  }
  // get isQuestionResultBtnDisabled() {
  //   if (this.questionResult.length === 0) {
  //     return true;
  //   }
  //   return this.questionResult.some(item => item.PollingType === null);
  // }

  // get isGoalResultBtnDisabled() {
  //   if (this.goalResult.length === 0) {
  //     return true;
  //   }
  //   return this.goalResult.some(
  //     item => item.responseValue === null || item.responseValue === ''
  //   );
  // }

  isEventNameFound() {
    const name = this.eventInfoForm.get('eventName').value;
    const year = this.eventInfoForm.get('eventYear').value;
    if (this.events.length === 0) {
      return false;
    }
    let result = year
      ? this.events.includes(`${name} ${year}`.toUpperCase())
      : this.events.includes(name.toUpperCase());

    if (result) {
      this.eventInfoForm.controls.eventName.setErrors({ eventNameFound: true });
    } else {
      this.eventInfoForm.controls.eventName.setErrors(null);
    }
    return result;
    // this.eventInfoForm.controls.eventName.updateValueAndValidity();
  }

  isPageNameFound(name) {
    if (this.customPages.length === 0) {
      return false;
    }
    const result = this.customPages.filter((x) => x.pageName === name);
    return result.length > 0;
  }

  isMenuItemFound(name) {
    if (this.customPages.length === 0) {
      return false;
    }
    const result = this.customPages.filter((x) => x.menuName === name);
    return result.length > 0;
  }

  setRateValidator(startDate, endDate, rate) {
    if (startDate.value || endDate.value || rate.value > 0) {
      startDate.setValidators([Validators.required]);
      startDate.updateValueAndValidity();
      endDate.setValidators([Validators.required]);
      endDate.updateValueAndValidity();
      rate.setValidators([Validators.required]);
      rate.updateValueAndValidity();
    } else {
      startDate.clearValidators();
      startDate.updateValueAndValidity();
      endDate.clearValidators();
      endDate.updateValueAndValidity();
      rate.clearValidators();
      rate.updateValueAndValidity();
    }
  }

  isDateOutOfOrder(startDate, endDate) {
    if (startDate.value === (null || '') || endDate.value === (null || '')) {
      return false;
    }
    const sDate = new Date(startDate.value);
    const eDate = new Date(endDate.value);

    if (eDate < sDate) {
      return true;
    }
    return false;
  }

  isTimeOutOfOrder(startDate, endDate, startTime, endTime) {
    if (
      startDate.value == '' ||
      endDate.value == '' ||
      startTime.value == '' ||
      endTime.value == ''
    ) {
      return false;
    }

    if (startDate.value == endDate.value) {
      const sDate = new Date(startDate.value + ' ' + startTime.value);
      const eDate = new Date(endDate.value + ' ' + endTime.value);

      if (eDate < sDate) {
        return true;
      }
    }
    return false;
  }

  get goalResult() {
    const temp = this.goalElements.filter((item) => item.checked);
    return temp;
    // return this.goalElements.filter(item => item.checked);
  }

  addEmailAddresses(addAttendessForm: NgForm) {
    this.isaddAttendessFormSubmit = true;
    if (addAttendessForm.invalid) {
      return;
    }
    this.currentUsersEmail.push({ ...this.addUsersEmail });
    this.addUsersEmail = {} as any;
    this.isaddAttendessFormSubmit = false;
    addAttendessForm.reset();
  }
  removeExistingUserEmail(emailAddress) {
    this.currentUsersEmail = this.currentUsersEmail.filter(
      (x) => x.EmailAddrTxt != emailAddress
    );
  }
  // zipCodeLookUp() {
  //   const zip = this.eventInfoForm.controls.zip.value;
  //   const regexp = /^[0-9]{5}(?:-[0-9]{4})?$/;
  //   if (regexp.test(this.eventInfoForm.controls.zip.value)) {
  //     this.httpClient
  //       .get<any>(`${this.ZIPCODE_LOOKUP_API}?zipcode=${zip}`, { headers })
  //       .subscribe(
  //         data => {
  //           if (
  //             data.response.GeoLocation.city &&
  //             data.response.GeoLocation.state
  //           ) {
  //             this.eventInfoForm.controls.zip.setErrors(null);
  //             this.eventInfoForm.controls.address2.setValue(
  //               `${data.response.GeoLocation.city}, ${data.response.GeoLocation.state}`
  //             );
  //             return;
  //           } else {
  //             //handles cases such as 12345
  //             this.eventInfoForm.controls.zip.setErrors({ zipNotFound: true });
  //             this.eventInfoForm.controls.address2.setValue('');
  //           }
  //         },
  //         error =>{
  //           const alert =`An error has occurred, please try again: ${error.message}`;
  //           Swal.fire({
  //             icon: 'warning',
  //             title: 'Check Again',
  //             text: alert,
  //             confirmButtonColor: '#3085d6',
  //           });
  //         }
  //       );
  //   } else {
  //     //handles cases where the format is incorrect
  //     this.eventInfoForm.controls.zip.setErrors({ zipFormat: true });
  //     this.eventInfoForm.controls.address2.setValue('');
  //   }
  // }

  patchFormData(data) {
    this.psmImported = true;
    const patchDetails = {};
    console.log(data);
    data.psmIds.forEach((formName) => {
      if (data.data[formName]) {
        if (formName == 'event_info') {
          this.builderUrl;
          this.eventInfoForm.patchValue(data.data[formName]);
          patchDetails[formName] = 1;
        } else if (formName == 'eblast') {
          this.currentUsersEmail = data.data[formName];
        } else if (
          formName == 'event_costs' &&
          data.data[formName].length > 0
        ) {
          this.eventCosts = [];
          this.allRegCodes = [];
          data.data[formName].forEach((element) => {
            let existingRegCode = false;
            this.eventCosts.push({
              refCodes: element.refCodes,
              rates: element.rates,
              customPackage: element.customPackage,
            });
            for (let i = 0; i < this.allRegCodes.length; i++) {
              if (
                this.allRegCodes[i].split('-')[0].trim().toLowerCase() ==
                  element.refCodes.split('-')[0].toLowerCase() ||
                this.allRegCodes[i].split('-')[1].trim().toLowerCase() ==
                  element.refCodes.split('-')[1].toLowerCase()
              ) {
                existingRegCode = true;
                break;
              }
            }
            if (!existingRegCode) {
              let index = element.refCodes.indexOf('-');
              this.regtypesList.push({
                code: element.refCodes.slice(0, index - 1),
                description: element.refCodes.slice(index + 2)
              });
              this.regtypesList = [...new Set(this.regtypesList)];
              this.allRegCodes.push(element.refCodes);
              this.jobsCategory.push(element.refCodes.slice(index + 2));
              this.customCategories.push(element.refCodes.slice(index + 2));
              this.customCategories = [...new Set(this.customCategories)];
              regTypeQueue.push(element.refCodes.slice(index + 2));
              regTypeQueue = [...new Set(regTypeQueue)];
              this.jobsCategory = [...new Set(this.jobsCategory)];
            }
          });
          patchDetails[formName] = this.eventCosts.length;
        } else if (
          formName == 'qualifications' &&
          data.data[formName].length > 0
        ) {
          this.addedQualifications = [];
          data.data[formName].map((e) => {
            this.addedQualifications.push(e);
            if (!this.customCategories.includes(e.regType)) {
              this.customCategories.push(e.regType);
            }
          });
          patchDetails[formName] = this.addedQualifications.length;
          // this.addedQualifications = this.addedQualifications.filter((v,i,a)=>a.findIndex(t=>(t.regType === v.regType && t.qualification===v.qualification))===i)
        } else if (formName == 'sessions' && data.data[formName].length > 0) {
          this.sessionListing = [];
          data.data[formName].map((e) => {
            this.sessionListing.push(e);
          });
          patchDetails[formName] = this.sessionListing.length;
        } else if (
          formName == 'questions_goals' &&
          data.data[formName].length > 0
        ) {
          data.data[formName] = data.data[formName].filter(
            (thing, index, self) =>
              index ===
              self.findIndex(
                (t) =>
                  data.PollingType == 'Goal' ||
                  (t.question === thing.question &&
                    t.category == thing.category &&
                    t.PollingType === thing.PollingType)
              )
          );
          this.searchQuestionText = data.data[formName][0]['category'];
          const currentQuestions = this.questionElements;
          const existingQuestionsLength = currentQuestions.length;
          const currentGoals = this.goalElements;
          data.data[formName].forEach((data) => {
            if (data.PollingType != 'Goal') {
              currentQuestions.forEach((question) => {
                if (
                  data.question == question.question &&
                  data.category == question.category &&
                  data.PollingType == question.PollingType
                ) {
                  question.checked = false;
                }
              });
            } else {
              currentGoals.forEach((goal) => {
                if (
                  data.question == goal.goal &&
                  data.PollingType == goal.PollingType
                ) {
                  goal.checked = false;
                  goal.responseValue = data.dedDescription;
                }
              });
            }
          });
          let customQues = [];
          data.data[formName].forEach((d) => {
            let checked = false;
            currentQuestions.forEach((question) => {
              if (
                d.question == question.question &&
                d.questionName == question.questionName &&
                d.category == question.category &&
                d.PollingType == question.PollingType
              ) {
                question.checked = false;
                checked = true;
              }
            });
            if (checked === false) {
              customQues.push(d);
            }
          });
          if (customQues.length > 0) {
            customQues.forEach((ele) => {
              ele.id = this.allQuestions.length;
              ele.checked = false;
              this.allQuestions.push(ele);
              if (!this.customCategories.includes(ele.category)) {
                this.customCategories.push(ele.category);
                this.customCategories = [...new Set(this.customCategories)];
                regTypeQueue.push(ele.category);
                regTypeQueue = [...new Set(regTypeQueue)];
              }
            });
          }
          const afterQuestionsLength = currentQuestions.length;
          patchDetails[formName] = afterQuestionsLength - existingQuestionsLength;
          this.searchItems();
        } else if (formName == 'discounts') {
          this.discountList = data.data[formName].discountList?.map(
            (discount: any) => {
              let regType;
              if (Array.isArray(discount?.appliedRegtypes)) {
                regType = discount?.appliedRegtypes.map(x => {
                  return data.data['event_costs']?.find(
                    (cost: any) => cost?.EventRegType === x.trim()
                  )?.refCodes
                })
              } else {
                regType = data.data['event_costs']?.find(
                  (cost: any) => cost?.EventRegType === discount?.appliedRegtypes
                )?.refCodes;
              }
              return {
                ...discount,
                discountauthcode: discount.discountcd,
                discountcd: '',
                appliedRegtypes: regType ? (Array.isArray(regType) ? regType : [regType]) : [],
              };
            }
          );
          if (this.discountList?.length > 0) {
            this.addDiscountType = '';
          }
          patchDetails[formName] = this.discountList.length;
        } else if (formName == 'exhibitorAllotment') {
          patchDetails[formName] = data.data[formName].length;
          this.exhibitorAllotmentData = data.data[formName];
        } else if (formName == 'membsershipAllotment') {
          patchDetails[formName] = data.data[formName].length;
          this.membershipAllotmentData = data.data[formName];
        }
      }
    });
    this.patchInfo = {};
    this.patchInfo.details = patchDetails;
    this.patchInfo.success = true;
  }

  saveNewRegType() {
    if (!!this.newRegType.type && !!this.newRegType.description) {
      if (this.regtypeEditIndex !== null) {
        const oldRegtype: RegtypeData = {
          ...this.regtypesList[this.regtypeEditIndex]
        };
        this.regtypesList[this.regtypeEditIndex] = {
          code: this.newRegType.type,
          description: this.newRegType.description
        };
        this.allRegCodes = this.allRegCodes.map((regCode: string) => {
          if (regCode === oldRegtype.code + ' - ' + oldRegtype.description) {
            return regCode;
          }
          return this.newRegType.type + ' - ' + this.newRegType.description
        });
        const editedJobsCategoryIndex: number = this.jobsCategory.findIndex((category: string) => category === oldRegtype.description);
        this.jobsCategory[editedJobsCategoryIndex] = this.newRegType.description;

        const editedCustomCategoryIndex: number = this.jobsCategory.findIndex((category: string) => category === oldRegtype.description);
        this.customCategories[editedCustomCategoryIndex] = this.newRegType.description;

        this.jobsCategory = [...new Set(this.jobsCategory)];
        this.customCategories = [...new Set(this.customCategories)];

        /** Update the discounts related to the regtype on discounts */
        let newDiscountList: any[] = [];
        this.discountList?.forEach((discount: any) => {
          const appliedRegtypes: string[] = discount?.appliedRegtypes;
          const newAppliedRegtypes: string[] = appliedRegtypes?.map(
            (regtype: string) => regtype === oldRegtype.code + ' - ' + oldRegtype.description ? this.newRegType.type + ' - ' + this.newRegType.description : regtype
          );
          newDiscountList.push({
            ...discount,
            appliedRegtypes: newAppliedRegtypes,
          });
        });
        this.discountList = newDiscountList;

        /** Update the qualification related to the regtype */
        this.addedQualifications = this.addedQualifications?.map(
          (q: any) => q?.regType === oldRegtype.description ? { ...q, regType: this.newRegType.description } : q
        );

        this.regtypeEditIndex = null
        const alert = 'Successfully Updated';
        this.toastService.show(alert, {
          delay: 6000,
          classname: 'bg-success text-light',
          headertext: 'Reg type Edit',
          autohide: true,
        });
      } else {
        for (let i = 0; i < this.allRegCodes.length; i++) {
          if (
            this.allRegCodes[i].split('-')[0].trim().toLowerCase() ==
              this.newRegType.type.toLowerCase() ||
            this.allRegCodes[i].split('-')[1].trim().toLowerCase() ==
              this.newRegType.description.toLowerCase()
          ) {
            const alert = 'Given type or description already existing';
            Swal.fire({
              icon: 'warning',
              title: 'RegType Exist',
              text: alert,
              confirmButtonColor: '#3085d6',
            });
            return;
          }
        }
        this.regtypesList.push({
          code: this.newRegType.type,
          description: this.newRegType.description
        });
        this.allRegCodes.push(
          this.newRegType.type + ' - ' + this.newRegType.description
        );
        this.jobsCategory.push(this.newRegType.description);
        this.customCategories.push(this.newRegType.description);
        this.customCategories = [...new Set(this.customCategories)];
        this.jobsCategory = [...new Set(this.jobsCategory)];
        const alert = 'Successfully Added';
        this.toastService.show(alert, {
          delay: 6000,
          classname: 'bg-success text-light',
          headertext: 'New Reg type',
          autohide: true,
        });
      }
      this.resetRegtypeForm();
    }
  }

  resetRegtypeForm() {
    this.newRegType = {
      type: '',
      description: '',
    };
    this.addNewRegTypes = false;
  }

  addNewRegTypesFn() {
    if (this.addNewRegTypes) {
      const alert = 'Please save the reg types';
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: alert,
        confirmButtonColor: '#3085d6',
      });
      return;
    } else {
      this.addNewRegTypes = true;
    }
  }

  editRegtype(regtype: RegtypeData, i: number) {
    this.newRegType = {
      type: regtype.code,
      description: regtype.description
    };
    this.regtypeEditIndex = i;
    this.addNewRegTypes = true;
  }

  removeRegtype(i: number) {
    /** Remove the regtype from the jobsCategory and qualificationRegTypeArray */
    const regCode: string = this.regtypesList[i]?.code + ' - ' + this.regtypesList[i]?.description;
    const removedRegType: string = this.regtypesList[i]?.description;

    /** Remove reg associations */
    this.removeRegAssociation(regCode, removedRegType);

    /** Remove the regtype from the eventCosts */
    const removedEventCostIndex: number = this.eventCosts.findIndex((eventCost: any) => eventCost.refCodes === regCode);
    this.eventCosts.splice(removedEventCostIndex, 1);
    if (this.eventcost_editIndex === removedEventCostIndex) this.eventcost_editIndex = null;

    /** Remove the regtype from the regtypesList */
    this.regtypesList.splice(i, 1);
    if (i === this.regtypeEditIndex) {
      this.regtypeEditIndex = null;
      this.newRegType = {
        type: "",
        description: ""
      };
    };
  }

  get formArr() {
    return this.customQuestionsForm.get('demDetails') as FormArray;
  }

  initRows() {
    return this.fb.group({
      demQuestion: [''],
      dedDescription: [
        '',
        [
          Validators.required,
          Validators.maxLength(this.dedDescriptionMaxLength),
        ],
      ],
      dedValue: ['', [Validators.required, Validators.maxLength(50)]],
    });
  }

  addNewRow() {
    this.formArr.push(this.initRows());
  }

  deleteRow(index: number) {
    this.formArr.removeAt(index);
  }

  editQuestions(customQuestionModel, values) {
    this.openQuestionDialog(customQuestionModel);
    values.demDetails = values.demDetails ? values.demDetails : [];
    let demDetails = values.demDetails?.map((row) => ({
      dedDescription: row.dedDescription,
      dedValue: row.dedValue?.toString().trim(),
    }));
    demDetails = [
      ...new Map(demDetails.map((v) => [v.dedDescription, v])).values(),
    ];
    for (let i = 0; i < demDetails.length; i++) {
      this.addNewRow();
    }

    let patchValue = {
      demQuestion: values.questionName,
      description: values.question,
      pollingTypeCode: 'Registration',
      demDetails: demDetails ? demDetails : [],
      columns: values.columns ? values.columns : 1,
      responseLayout: values.responseLayout
        ? values.responseLayout
        : 'Freetext',
    };
    if (
      patchValue.responseLayout == 'Dropdown' ||
      patchValue.responseLayout == 'CheckboxList' ||
      patchValue.responseLayout == 'RadioButtonList'
    ) {
      this.addNewRowResp = true;
    } else if (patchValue.responseLayout == 'Freetext') {
      this.addNewRowResp = false;
    } else {
      this.addNewRowResp = false;
    }
    if (!this.pollingTypeCodes.includes(values.PollingType)) {
      this.pollingTypeCodes.push(values.PollingType);
    }
    this.questionEditIndex = values.id;
    this.customQuestionsForm.patchValue(patchValue);
  }

  demDetailsClear() {
    this.formArr.controls = [];
    this.formArr.updateValueAndValidity();
  }
  responseChange(x) {
    this.demDetailsClear();
    if (x == 'Dropdown' || x == 'CheckboxList' || x == 'RadioButtonList') {
      this.addNewRow();
      this.addNewRowResp = true;
    } else if (x == 'Freetext') {
      this.addNewRowResp = false;
    } else {
      this.addNewRow();
      this.addNewRowResp = false;
    }
  }
  checkDuplicate(demDetails: any) {
    return (
      [...new Map(demDetails.map((v) => [v.dedDescription, v])).values()]
        .length != demDetails?.length
    );
  }

  saveQuestion() {
    if (this.customQuestionsForm.invalid) {
      this.markFormGroupTouched(this.customQuestionsForm);
      const alert = 'Please fill required details';
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: alert,
        confirmButtonColor: '#3085d6',
      });
      return;
    }
    if (this.checkDuplicate(this.customQuestionsForm.value.demDetails)) {
      const alert = 'Duplicate Question responses';
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: alert,
        confirmButtonColor: '#3085d6',
      });
      return;
    }
    console.log(this.customQuestionsForm.value);

    let dup = false;
    this.allQuestions.map((question: QuestionData, key: number) => {
      if (
        question.question === this.customQuestionsForm.value.description &&
        question.questionName === this.customQuestionsForm.value.demQuestion &&
        question.PollingType === this.customQuestionsForm.value.pollingTypeCode &&
        question.category.toLowerCase() === this.searchQuestionText.toLowerCase() &&
        (this.questionEditIndex === null || question.id !== this.questionEditIndex)
      ) {
        Swal.fire({
          icon: 'warning',
          title: 'Check Again',
          text: 'The question is duplicated.',
          confirmButtonColor: '#3085d6',
        });
        dup = true;
      }
    });

    if (!dup) {
      if (this.questionEditIndex) {
        const existingIndex = this.allQuestions.findIndex((q: QuestionData) => q.id == this.questionEditIndex);
        const existingQuestion: QuestionData = this.allQuestions[existingIndex];
        const updatedQuestion: QuestionData = {
          ...existingQuestion,
          PollingType: this.customQuestionsForm.value.pollingTypeCode,
          category: this.searchQuestionText,
          demDetails: this.customQuestionsForm.value.responseLayout != 'Freetext' ? this.customQuestionsForm.value.demDetails.map((dem) => {
            dem.demQuestion = this.customQuestionsForm.value.description;
            return dem;
          }) : [],
          questionName: this.customQuestionsForm.value.demQuestion,
          responseLayout: this.customQuestionsForm.value.responseLayout,
          columns: this.customQuestionsForm.value.columns
        };
        this.allQuestions[existingIndex] = updatedQuestion;

        /** Update the questionElements */
        const existingQuestionIndex = this.questionElements.findIndex((q: QuestionData) => q.id == this.questionEditIndex);
        this.questionElements[existingQuestionIndex] = updatedQuestion;

        this.toastService.show('question modified', {
          delay: 6000,
          classname: 'bg-success text-light',
          headertext: 'Success',
          autohide: true,
        });
      } else {
        let id = this.allQuestions.length;
        this.allQuestions.push({
          id,
          questionName: this.customQuestionsForm.value.demQuestion,
          category: `${this.searchQuestionText}`,
          question: `${this.customQuestionsForm.value.description}`,
          checked: true,
          PollingType: `${this.customQuestionsForm.value.pollingTypeCode}`,
          demDetails:
            this.customQuestionsForm.value.responseLayout != 'Freetext'
              ? this.customQuestionsForm.value.demDetails.map((dem) => {
                  dem.demQuestion = this.customQuestionsForm.value.description;
                  return dem;
                })
              : [],
          responseLayout: this.customQuestionsForm.value.responseLayout,
          columns: this.customQuestionsForm.value.columns
        });
        this.toastService.show('Questions added', {
          delay: 6000,
          classname: 'bg-success text-light',
          headertext: 'Success',
          autohide: true,
        });
        this.searchItems();
      }
      this.customQuestionsForm.reset();
      this.questionEditIndex == null;
      if (this.questionDialogRef) {
        this.questionDialogRef.close();
      }
    } else {
      return;
    }
  }
  // Qualification tab
  addQualification() {
    let noQualificationText = 'No Qualification Required';
    if (this.noQualificationsChecked) {
      this.selectedQualifications = [noQualificationText];
    }

    if (this.qualificationRegType && this.selectedQualifications.length > 0) {
      let isExisted = null;
      let qualificationsToAdd = [];
      const isExistingQual = this.addedQualifications.find(
        (item) =>
          this.selectedQualifications.find(
            (qual) => qual.toLowerCase() == item.qualification.toLowerCase()
          ) && item.regType === this.qualificationRegType
      );

      if (!isExistingQual) {
        this.selectedQualifications.forEach((qualification) => {
          const qualName = this.createdQualifications.find(
            (x) => x.qualification == qualification
          );
          const qual = {
            qualName: qualName
              ? qualName.qualName
              : qualification + ' qualification',
            regType: this.qualificationRegType,
            qualification: qualification,
            sampleQualificationFileData: qualName
              ? qualName.sampleQualificationFileData
              : '',
            formRequirement: qualName? qualName.formRequirement:'',
            editFlag: qualName ? qualName.editFlag : null,
          } as any;
          this.bucket
            .getFile('Qualifications', qual.sampleQualificationFileData)
            .subscribe(
              (data) => {
                qual.sampleQualificationFileDataData = data;
                qualificationsToAdd.push(qual);
              },
              (err) => {
                qual.sampleQualificationFileDataData = '';
                this.addedQualifications.push(qual);
              }
            );
        });
      } else {
        isExisted = isExistingQual;
      }

      if (isExisted) {
        alert(
          'qualification already existing for regType:' +
            isExisted.regType +
            ', qualification:' +
            isExisted.qualification
        );
        return;
      }
      this.addedQualifications = [
        ...this.addedQualifications,
        ...qualificationsToAdd,
      ];

      this.qualificationRegType = '';
      this.selectedQualifications = [];
      this.qualificationError = '';
    } else {
      this.qualificationError = 'Please fill required fields';
    }
  }

  deleteQualification(i: number) {
    this.addedQualifications.splice(i, 1);
  }
  // Customization Tab
  customizationCategoryChange() {
    this.optionSubcateogries = [];
    // this.selectedCustomizations = [];
  }
  configCustomizations(value, content) {
    this.selectedCustomizationId = value.id;
    if (value.category.toLowerCase().includes('visa')) {
      this.visaConfigTabs = {
        visaPreview: true,
        attendeeResponse: false,
        csiResponse: false,
      };

      this.visaConfigValues = {
        visaPreview: false,
        attendeeResponse: {
          passportDob: false,
          passportGender: false,
          passportNumber: false,
          passportExpirationDate: false,
          companyName: false,
          cszCountry: false,
        },
        csiResponse: {
          firstName: '',
          lastName: '',
          emailAddress: '',
          address1: '',
          address2: '',
        },
      };
      const configSelected = this.selectedCustomizations.find(
        (config) => config.id === value.id
      );

      if (configSelected && configSelected.config) {
        this.visaConfigValues = configSelected.config;
      }
      console.log('configSelected', configSelected, this.visaConfigValues);
      this.modalService.open(content, { scrollable: true });
    }
  }
  searchCustomizations() {
    this.optionSubcateogries.forEach((subCategory) => {
      // if (
      //   !this.selectedCustomizations.some(
      //     item =>
      //       item.category === this.customizationCategory &&
      //       item.evaluation === subCategory.value
      //   )
      // )
      this.selectedCustomizations.push({
        id: this.selectedCustomizations.length,
        checked: false,
        category: this.customizationCategory,
        evaluation: subCategory.value,
      });
    });
    this.optionSubcateogries = [];
    this.customizationCategory = '';
  }
  hasCheckedCustomizations() {
    const checkedCustomizations = this.selectedCustomizations.filter(
      (customization) => customization.checked === true
    );

    return checkedCustomizations.length > 0;
  }
  submitCustomizations() {
    this.submittedCustomizations = [];
    const checkedCustomizations = this.selectedCustomizations.filter(
      (customization) => customization.checked === true
    );
    checkedCustomizations.forEach((customization) => {
      this.submittedCustomizations.push(customization);
    });
    console.log(
      'customizations',
      this.submittedCustomizations,
      this.selectedCustomizations
    );
  }
  getToolTipMessage(value) {
    return this.tooltips[value.category];
  }
  submitVisaConfiguration(modal) {
    this.selectedCustomizations = this.selectedCustomizations.map(
      (customization) => {
        if (customization.id === this.selectedCustomizationId) {
          return {
            ...customization,
            config: this.visaConfigValues,
          };
        }
        return customization;
      }
    );
    modal.close('Close click');
  }

  changeTemplate(e: any, template: any, index: number) {
    if (e.target.checked === true) {
      this.launchPaperBits(template.json, template.url, index);
    }
  }

  changeQualification() {
    if (this.noQualificationsChecked) {
      this.selectedQualifications = [];
    }
  }

  changeQualificationRegType() {
    console.error(this.qualificationRegType);
    if (this.noQualificationsChecked) {
      this.selectedQualifications = [];
    }
  }

  selectTheme(theme) {
    this.selectedTemplate.themeType = theme.type;
    this.selectedTemplate.json = theme.json
      .replace('<wfNum>', this.selectedTemplate.templateName.slice(-1))
      .replace(
        '<theme_type>',
        this.selectedTemplate.templateType.toLowerCase()
      );
    if (this.themeModlRef) {
      this.themeModlRef.close();
    }
  }

  createQualification() {
    const createQualificationModalRef = this.modalService.open(
      CreateQualificationComponent,
      {
        size: 'lg',
        windowClass: 'modal-custom-createQualification',
      }
    );
    createQualificationModalRef.componentInstance.regTypes = this.jobsCategory;
    createQualificationModalRef.componentInstance.isEdit = false;
    createQualificationModalRef.result.then((qualification: any) => {
      console.error('New Created qualification: ', qualification);
      if (!qualification) {
        return;
      }
      if (!this.qualifications.includes(qualification.qualification)) {
        (this.qualifications = [
          ...this.qualifications,
          qualification.qualification,
        ]),
          this.createdQualifications.push({ ...qualification });
      }
      const isExistingQual = this.addedQualifications.find(
        (item) =>
          qualification.qualification.toLowerCase() ==
            item.qualification.toLowerCase() &&
          item.regType === qualification.regType
      );

      if (!isExistingQual) {
        this.addedQualifications.push(qualification);
      } else {
        alert('Qualification already exists');
      }
    });
  }

  editQualification(i) {
    const createQualificationModalRef = this.modalService.open(
      CreateQualificationComponent,
      {
        size: 'lg',
        windowClass: 'modal-custom-createQualification',
      }
    );
    createQualificationModalRef.componentInstance.regTypes = this.jobsCategory;
    createQualificationModalRef.componentInstance.isEdit = true;
    createQualificationModalRef.componentInstance.data =
      this.addedQualifications[i];
    createQualificationModalRef.result.then((qualification: any) => {
      if (!qualification) {
        return;
      }
      this.addedQualifications[i] = qualification;
    });
  }

  editEventCosts(eventCost, i) {
    this.eventcost_editIndex = i;
    const refCodes: string = eventCost?.refCodes;
    const regtypeDescription: string = refCodes?.slice(refCodes.indexOf('-') + 1)?.trim();
    this.customPackage = {
      ...eventCost.customPackage,
      regtype: regtypeDescription
    };

    const {
      earlyBirdStartDate,
      earlyBirdEndDate,
      earlyBirdRate,
      preEventBirdStartDate,
      preEventBirdEndDate,
      preEventBirdRate,
      duringEventBirdStartDate,
      duringEventBirdEndDate,
      duringEventBirdRate
    } = eventCost?.rates;

    if (earlyBirdStartDate || earlyBirdEndDate || earlyBirdRate) {
      this.isEventEarlyBirdCostFormHidden = false;
    } else {
      this.isEventEarlyBirdCostFormHidden = true;
    }
    this.eventEarlyBirdCostForm.controls['earlyBirdStartDate'].setValue(earlyBirdStartDate);
    this.eventEarlyBirdCostForm.controls['earlyBirdEndDate'].setValue(earlyBirdEndDate);
    this.eventEarlyBirdCostForm.controls['earlyBirdRate'].setValue(earlyBirdRate);

    if (preEventBirdStartDate || preEventBirdEndDate || preEventBirdRate) {
      this.isEventPreEventBirdCostFormHidden = false;
    } else {
      this.isEventPreEventBirdCostFormHidden = true;
    }
    this.eventPreEventBirdCostForm.controls['preEventBirdStartDate'].setValue(preEventBirdStartDate);
    this.eventPreEventBirdCostForm.controls['preEventBirdEndDate'].setValue(preEventBirdEndDate);
    this.eventPreEventBirdCostForm.controls['preEventBirdRate'].setValue(preEventBirdRate);

    this.eventDuringEventBirdCostForm.controls['duringEventBirdStartDate'].setValue(duringEventBirdStartDate);
    this.eventDuringEventBirdCostForm.controls['duringEventBirdEndDate'].setValue(duringEventBirdEndDate);
    this.eventDuringEventBirdCostForm.controls['duringEventBirdRate'].setValue(duringEventBirdRate);
  }

  addValue(object) {
    return {
      value: object,
    };
  }

  checkIfRegtypeExists() {
    return !!(
      this.discountList &&
      this.discountList.filter((x) => x.appliedRegtypes.length === 0).length > 0
    );
  }

  changeCountry(newCountry): void {
    const countryIndex = this.listOfCountries.findIndex(
      (country) => country.name === newCountry
    );
    this.eventInfoForm.controls.countryCode.setValue(
      this.listOfCountries[countryIndex].code.toUpperCase()
    );
  }

  createNewSpeaker(content) {
    this.addNewSpeakerRef = this.modalService
      .open(content, {
        windowClass: 'modal-custom-addDiscount',
        size: 'lg',
        backdrop: 'static',
      })
      .result.then((result) => {});
  }

  saveNewSpeaker(model) {
    this.markFormGroupTouched(this.createNewSpeakerForm);
    let alert;
    if (this.createNewSpeakerForm.valid) {
      if (
        this.isDuplicateSpeaker(this.createNewSpeakerForm.value.speakerName)
      ) {
        alert = 'Duplicate Speaker name';
        Swal.fire({
          icon: 'warning',
          title: 'Check Again',
          text: alert,
          confirmButtonColor: '#3085d6',
        });
        return false;
      }
      this.speakerList.push({
        ...this.createNewSpeakerForm.value,
        sessionNumber: uuid(),
      });
      this.toastService.show('', {
        delay: 6000,
        classname: 'bg-success text-light',
        headertext: 'New Speaker Successfully saved',
        autohide: true,
      });
      this.activeSpeakerTab = 1;
      this.createNewSpeakerForm.reset();
      return true;
    } else {
      /** Get the invalid field tab index and go to the tab */
      const tabFields: string[][] = [
        ['speakerName', 'description'],
        ['company', 'address', 'phone', 'email', 'website'],
        ['photoUpload'],
        ['highLevelCat', 'subcategory'],
      ];
      const invalidField: string = Object.keys(this.cnsf)?.find(
        (name: string) => this.cnsf[name].invalid
      );
      if (invalidField) {
        tabFields.forEach((tabGroup: string[], index: number) => {
          if (tabGroup.includes(invalidField))
            this.activeSpeakerTab = index + 1;
        });
      }

      /** Alert the invalidation */
      alert = 'Please fill mandatory fields in all tabs';
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: alert,
        confirmButtonColor: '#3085d6',
      });
      return false;
    }
  }

  isDuplicateSpeaker(speakerName) {
    return (
      this.speakerList.filter(
        (speaker) =>
          speaker.speakerName?.toLowerCase() == speakerName.toLowerCase()
      ).length > 0
    );
  }

  uploadPhoto(event) {
    let reader = new FileReader();
    let file = event.target.files[0];
    if (event.target.files && event.target.files[0]) {
      reader.readAsDataURL(file);
    }
    reader.onload = () => {
      this.createNewSpeakerForm.patchValue({ photoUpload: reader.result });
    };
  }

  onDrop(event: CdkDragDrop<string[]>) {
    const previousId: number = this.questionElements[event.previousIndex]?.id
    const currentId: number = this.questionElements[event.currentIndex]?.id
    moveItemInArray(
      this.questionElements,
      event.previousIndex,
      event.currentIndex
    );
    this.questionElements.forEach((q: QuestionData, idx: number) => {
      q.order = idx + 1;
    });
    const previousIndex = this.allQuestions.findIndex((q: QuestionData) => q.id === previousId);
    const currentIndex = this.allQuestions.findIndex((q: QuestionData) => q.id === currentId);
    moveItemInArray(
      this.allQuestions,
      previousIndex,
      currentIndex
    );
  }

  getDiscountType(type: string) {
    const discountCodes: any[] = this.discountCodes?.filter(
      (discount) => discount.discountType !== 'null'
    );
    const discount: any = discountCodes.find(
      (discountTypeInfo: any) => discountTypeInfo.discountType === type
    );
    if (discount) return discount.discountDescription;
    return null;
  }

  get cnsf() {
    return this.createNewSpeakerForm.controls;
  }

  openImportQuestionsDialog() {
    const importQuestionsRef = this.modalService.open(
      ImportQuestionsComponent,
      {
        size: 'lg',
        windowClass: 'modal-custom-importQuestions',
      }
    );

    importQuestionsRef.componentInstance.regTypes = this.jobsCategory;

    importQuestionsRef.result.then((questions: QuestionData[]) => {
      console.log('result: ', questions);
      if (questions) {
        let updateCount: number = 0;
        questions?.forEach((q: QuestionData) => {
          /** this.allQuestions Check the duplication */
          const prevExistingIndex: any = this.allQuestions?.findIndex(
            (oldQuestion: QuestionData) =>
              q.question === oldQuestion.question &&
              q.questionName === oldQuestion.questionName &&
              q.PollingType === oldQuestion.PollingType &&
              this.searchQuestionText.toLowerCase() === oldQuestion.category.toLowerCase()
          );
          if (prevExistingIndex > -1) {
            this.allQuestions[prevExistingIndex] = {
              ...this.allQuestions[prevExistingIndex],
              ...q
            };
            const existingTableQuestionIndex: number = this.questionElements.findIndex((tableQuestion: QuestionData) => tableQuestion.id === this.allQuestions[prevExistingIndex]?.id);
            this.questionElements[existingTableQuestionIndex] = {
              ...this.questionElements[existingTableQuestionIndex],
              ...this.allQuestions[prevExistingIndex]
            };
            updateCount++;
          } else {
            /** Add the questions */
            q.id = this.allQuestions.length;
            q.checked = false;
            this.allQuestions.push(q);
            this.questionElements.push(q);
          }
        });

        this.toastService.show(
          Number(questions.length - updateCount) +
            ' questions added. ' +
            updateCount +
            ' questions updated',
          {
            delay: 8000,
            classname: 'bg-success text-light',
            headertext: 'Successfully Imported',
            autohide: true,
          }
        );
      }
    });
  }

  paperbits =
    'data:image/png;base64,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';
}
