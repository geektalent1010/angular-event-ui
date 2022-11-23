import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { LocationStrategy, NgSwitchDefault } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  HostListener,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDropdown, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { API_URL2 } from '../services/url/url';
import { EventInfoComponent } from './components/event-info/event-info.component';
import { EventData } from './interfaces/eventData';
import { MandatoryFields, QuestionResponseUniqProps } from '../psm/data';
import { RegtypeData } from '../shared/interfaces/Regtype';
import { PageBuilderComponent } from './components/page-builder/page-builder.component';

/** Services */
import { SessionServiceService } from '../services/session-service.service';
import { StatusService } from '../services/status.service';
import { ToastService } from '../services/toast/toast.service';
import { UploadService } from '../services/upload.service';
import { LocalStorageService } from '../services/local-storage.service';
import { NgTinyUrlService } from 'ng-tiny-url';
import { SessionsComponent } from './components/sessions/sessions.component';
import { DuplicateEventComponent } from './modals/duplicate-event/duplicate-event.component';
import { PackagesComponent } from './components/packages/packages.component';
import { EventCostData } from './interfaces/EventCost';
import { RegTypesComponent } from './components/reg-types/reg-types.component';
import { SendInviteComponent } from './modals/send-invite/send-invite.component';
import { DataService } from './services/data.service';
import { QualificationsComponent } from './components/qualifications/qualifications.component';
import {
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { DeleteConfirmComponent } from './modals/delete-confirm/delete-confirm.component';
import { PSMExportComponent } from './modals/psm-export/psm-export.component';
import { LeaveEventComponent } from './modals/leave-event/leave-event.component';
import * as moment from 'moment';
import { ACTIONS } from './components/business-rules-qb/business-rules-qb.component';
import { PageCustomizationsComponent } from './components/page-customizations/page-customizations.component';
import { WorkflowList } from './components/page-customizations/defaultPageData';
import {
  FieldData,
  PageCustomizationConfig,
  PageData,
  SectionData,
  WorkflowData,
} from './interfaces/customPage';
import { EmailBuilderComponent } from './components/email-builder/email-builder.component';
import { BadgeDesignerComponent } from './components/badge-designer/badge-designer.component';
import defaultTemplate from './components/email-builder/defaultTemplate.json';
import defaultBadgeTemplate from './components/badge-designer/defaultBadgeTemplate.json';
import { v4 as uuid } from 'uuid';
import * as _ from 'lodash';
import { generateUniqueGLCode } from '../components/angular-chat-ui-kit/components/utils/common';
import {
  updatePageCustomization,
  updatePageTemplates,
  isJSON,
} from './utils/udpateDataFunctions';
import { constants } from 'perf_hooks';

type AOA = any[][];
type FileType = 'csv' | 'excel';
type ExportType = 'selected' | 'event';
type ExportDataType = {
  content: any[];
  name: string;
};
type LeaveAction = 'save' | 'ignore' | 'continue';

let headers = new HttpHeaders()
  .set('content-type', 'application/json')
  .set('Access-Control-Allow-Headers', 'Content-Type')
  .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  .set('Access-Control-Allow-Origin', '*');
const CREATE_EVENT_API =
  API_URL2 + '/csi/event/services/eventSetupV2/createEvent';
const EDIT_EVENT_API = API_URL2 + '/csi/event/services/eventSetupV2/editEvent';

const CREATE_DUPLICATE_EVENT: string = `${API_URL2}/csi/event/services/eventSetupV2/createDuplicateEvent`;
const EDIT_DUPLICATE_EVENT: string = `${API_URL2}/csi/event/services/eventSetupV2/editAndDuplicateEvent`;
const projectId: string = environment.production
  ? 'csi-event-a3367'
  : 'test-csi-event';

const httpsLinkValidator: ValidatorFn = Validators.pattern(
  '^(https:\\/\\/)[\\w\\-_]+(\\.[\\w\\-_]+)+([\\w\\-\\.,@?^=%&amp;:/~\\+#]*[\\w\\-\\@?^=%&amp;/~\\+#])?'
);

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
})
export class EventComponent implements OnInit, OnDestroy {
  timeout;
  pageType: string = 'view';
  pageTypeSubscription: Subscription;
  evtUid: string = null;
  event: EventData = {
    noSessions: false,
    noDiscounts: false,
    noQualifications: false,
    pageBuilderLaunched: false,
    EventInfo: null,
    GooglePaymentData: null,
    regtypesList: [],
    eventCosts: [],
    discountList: [],
    addedQualifications: [],
    sessionList: [],
    questionsList: [],
    exhibitorAllotmentList: [],
    membershipInfoList: [],
    businessRules: [],
    pageList: [],
    emailBuilder: [],
    badgeDesigner: [],
  };
  PUBLISHED_PAPERBITS: string = environment.PUBLISHED_PAPERBITS;
  tabList: string[] = [
    'Event Info',
    'Reg Types',
    'Packages',
    'Discounts',
    'Qualifications',
    'Sessions',
    // 'Floorplan',
    'Demographic Questions',
    'Business Rules',
    'Page Customizations',
    'Page Builder',
    'Exhibitor Allotment',
    'Membership',
    'Email Builder',
    'Badge Designer',
    'Save',
  ];
  selectedTab: string = 'Event Info';
  samplePSMFiles: any = {
    'Event Info': 'DEMO_EventInfo.csv',
    'Reg Types': 'DEMO_CostsInfo.csv',
    Discounts: 'DEMO_Discount.csv',
    Qualifications: 'DEMO_Qualifications.csv',
    Sessions: 'DEMO_Sessions.csv',
    'Demographic Questions': 'DEMO_Questions.csv',
    'Exhibitor Allotment': 'DEMO_Exhibitor_Allotment.csv',
    Membership: 'DEMO_Membership.csv',
  };
  tabIds: string[] = [
    'event_info',
    'event_costs',
    'packages',
    'discounts',
    'qualifications',
    'sessions',
    // 'floorplan',
    'questions_goals',
    'business_rules',
    'page_customizations',
    'page_builder',
    'exhibitorAllotment',
    'membershipAllotment',
    'emailBuilder',
    'badgeDesigner',
    'save',
  ];
  selectedTabIndex: number = 0;
  uploadAvailable = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11];
  sampleDownloadAvailable = [0, 1, 3, 4, 5, 6, 10, 11];
  exportAvailable = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11];
  mandatoryFields = MandatoryFields;
  questionResponseUniqProps = QuestionResponseUniqProps;

  builderUrl: string;
  builderIOID: string;
  exhibitorIOID: string;
  organizerIOID: string;
  commanderIOID: string;
  eventPortalIOID: string;
  builderSelection: string;
  exhibitorSelection: string;
  organizerSelection: string;
  commanderSelection: string;
  eventPortalSelection: string;
  thumbnailImg: string;
  addUserid: string;
  loggedUser: string;
  floorPlanImageUrl: any;

  importedData: any[];
  psmImported: boolean = false;
  errorCode: string = '';
  loading: boolean = false;
  builderTemplate: any[];

  attendeeSiteURL: string = '';
  exhibitorSiteURL: string = '';
  organizerSiteURL: string = '';
  commanderSiteURL: string = '';
  eventPortalSiteURL: string = '';
  isLoaded = null;

  pageCustomizationConfig: PageCustomizationConfig = {
    selectedWorkflow: null,
    selectedPage: null,
    selectedSection: null,
    stepIndex: 0,
  };
  exportFileType: FileType = 'csv';
  eventNameList: any[] = [];
  validTabsIndex: number[] = [];
  eventInfoForm: FormGroup = new FormGroup({
    reqProjMgrName: new FormControl('test'),
    salesExecName: new FormControl(''),
    preferredMethod: new FormControl('Email'),
    custServicePhoneNumber: new FormControl(''),
    custServiceEmailAddress: new FormControl(''),

    eventName: new FormControl('SAMPLE EVENT NAME', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(75),
    ]),
    eventDisplayName: new FormControl('SAMPLE EVENT DISPLAY NAME', [
      Validators.required,
    ]),
    eventYear: new FormControl(''),
    description: new FormControl('', [
      Validators.required,
      Validators.maxLength(4000),
    ]),
    eventLogo: new FormControl(''),
    eventSecurityLevel: new FormControl('public', [Validators.required]),
    eventAccessCode: new FormControl(''),
    eventFormat: new FormControl('', [Validators.required]),
    categories: new FormControl('', [Validators.required]),
    showCode: new FormControl('', [Validators.required]),
    tradeShowName: new FormControl('', [Validators.required]),
    paymentWay: new FormControl('braintree', [Validators.required]),
    merchantId: new FormControl('', [Validators.required]),
    publicKey: new FormControl('', [Validators.required]),
    privateKey: new FormControl('', [Validators.required]),
    homePageOnShowInfo: new FormControl('https://www.sample.com'),
    startDate: new FormControl('', [Validators.required]),
    startTime: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
    endTime: new FormControl('', [Validators.required]),
    address1: new FormControl('', [
      Validators.required,
      Validators.maxLength(255),
    ]),
    address2: new FormControl('', Validators.maxLength(40)),
    address3: new FormControl('', Validators.maxLength(40)),
    city: new FormControl('', [Validators.maxLength(40)]),
    state: new FormControl('', [Validators.maxLength(40)]),
    county: new FormControl('', Validators.maxLength(40)),
    country: new FormControl('United States', [
      Validators.required,
      Validators.maxLength(40),
    ]),
    countryCode: new FormControl('US', Validators.maxLength(40)),
    zip: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required, Validators.maxLength(40)]),
    Seminar: new FormControl(false),
    Social: new FormControl(false),
    Trade: new FormControl(false),
    Workshop: new FormControl(false),

    hideShowInfo: new FormControl(false),
    hideShowInfoTitle: new FormControl(false),
    hideShowInfoFollowUs: new FormControl(false),
    hideShowInfoButton: new FormControl(false),
  });

  @ViewChild('eventInfo', { static: false })
  eventInfoComponent: EventInfoComponent;
  @ViewChild('regTypes', { static: false })
  regTypesComponent: RegTypesComponent;
  @ViewChild('packages', { static: false })
  packagesComponent: PackagesComponent;
  @ViewChild('qualifications', { static: false })
  qualificationsComponent: QualificationsComponent;
  @ViewChild('sessions', { static: false })
  sessionsComponent: SessionsComponent;
  @ViewChild('pageBuilder', { static: false })
  pageBuilderComponent: PageBuilderComponent;
  @ViewChild('pageCustomizations', { static: false })
  pageCustomizationsComponent: PageCustomizationsComponent;
  @ViewChild('emailBuilder', { static: false })
  emailBuilder: EmailBuilderComponent;
  @ViewChild('badgeDesigner', { static: false })
  badgeDesigner: BadgeDesignerComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private toastService: ToastService,
    private sessionService: SessionServiceService,
    private statusService: StatusService,
    private bucket: UploadService,
    private localStorageService: LocalStorageService,
    private modalService: NgbModal,
    public dataService: DataService,
    private tinyUrl: NgTinyUrlService,
    private location: LocationStrategy
  ) {
    if (localStorage.getItem('Authorization')) {
      headers = new HttpHeaders()
        .set('content-type', 'application/json')
        .set('Access-Control-Allow-Headers', 'Content-Type')
        .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        .set('Access-Control-Allow-Origin', '*')
        .set('Authorization', localStorage.getItem('Authorization'));
    }
    this.evtUid = this.route.snapshot.paramMap.get('id');
    this.loggedUser = localStorage.getItem('username');

    // preventing back button in browser
    history.pushState(null, null, window.location.href);
    this.location.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });
  }

  // detecting browser back button click event
  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    this.leaveEvent();
  }

  ngOnInit(): void {
    this.statusService.showPageLoading();
    this.pageTypeSubscription = this.route.data.subscribe((data: any) => {
      this.pageType = data?.pageType || 'view';
      if (this.pageType === 'create') {
        this.addUserid = this.localStorageService.get('username');
        this.event.pageList = WorkflowList;
        let tempEmail = [];
        Object.keys(defaultTemplate).map((key) => {
          let tempItem = {
            name: key,
            content: defaultTemplate[key],
          };
          tempEmail.push(tempItem);
        });
        this.event.emailBuilder = tempEmail;
        this.event.badgeDesigner = defaultBadgeTemplate;
      } else {
        this.getEventInfo();
        // this.event.pageList = PageList;
        this.initBussinessRuleToEvent();
      }
    });

    const token = this.route.snapshot.queryParamMap.get('key') || null;

    this.getAllEvents();
  }

  /** Handle the payment way change subscription regarding braintree and authorizenet */
  handlePaymentWayChange(paymentWay: string) {
    if (paymentWay === 'braintree') {
      this.eventInfoForm.addControl(
        'merchantId',
        new FormControl(this.event.EventInfo.merchantId ?? '', [
          Validators.required,
        ])
      );
      this.eventInfoForm.addControl(
        'publicKey',
        new FormControl(this.event.EventInfo.publicKey ?? '', [
          Validators.required,
        ])
      );
      this.eventInfoForm.addControl(
        'privateKey',
        new FormControl(this.event.EventInfo.privateKey ?? '', [
          Validators.required,
        ])
      );
      this.eventInfoForm.removeControl('apiLoginId');
      this.eventInfoForm.removeControl('transactionKey');
    } else if (paymentWay === 'authorizenet') {
      this.eventInfoForm.addControl(
        'apiLoginId',
        new FormControl(this.event.EventInfo.apiLoginId ?? '', [
          Validators.required,
        ])
      );
      this.eventInfoForm.addControl(
        'transactionKey',
        new FormControl(this.event.EventInfo.transactionKey ?? '', [
          Validators.required,
        ])
      );
      this.eventInfoForm.removeControl('merchantId');
      this.eventInfoForm.removeControl('publicKey');
      this.eventInfoForm.removeControl('privateKey');
    } else {
      this.eventInfoForm.removeControl('merchantId');
      this.eventInfoForm.removeControl('publicKey');
      this.eventInfoForm.removeControl('privateKey');
      this.eventInfoForm.removeControl('apiLoginId');
      this.eventInfoForm.removeControl('transactionKey');
    }
    this.eventInfoForm.updateValueAndValidity();
  }

  patchEventInfoForm() {
    if (this.pageType === 'view') {
      this.eventInfoForm = new FormGroup({
        Seminar: new FormControl({
          value: this.event.EventInfo?.Seminar,
          disabled: true,
        }),
        Social: new FormControl({
          value: this.event.EventInfo?.Social,
          disabled: true,
        }),
        Trade: new FormControl({
          value: this.event.EventInfo?.Trade,
          disabled: true,
        }),
        Workshop: new FormControl({
          value: this.event.EventInfo?.Workshop,
          disabled: true,
        }),

        hideShowInfo: new FormControl({
          value: this.event.EventInfo?.hideShowInfo,
          disabled: true,
        }),
        hideShowInfoTitle: new FormControl({
          value: this.event.EventInfo?.hideShowInfoTitle,
          disabled: true,
        }),
        hideShowInfoButton: new FormControl({
          value: this.event.EventInfo?.hideShowInfoButton,
          disabled: true,
        }),
        hideShowInfoFollowUs: new FormControl({
          value: this.event.EventInfo?.hideShowInfoFollowUs,
          disabled: true,
        }),
      });
    } else {
      if (this.event.EventInfo) {
        this.eventInfoForm = new FormGroup({
          reqProjMgrName: new FormControl(
            this.event.EventInfo.reqProjMgrName || '',
            [Validators.maxLength(30)]
          ),
          salesExecName: new FormControl(
            this.event.EventInfo.salesExecName || '',
            [Validators.maxLength(30)]
          ),
          preferredMethod: new FormControl(
            this.event.EventInfo.preferredMethod || 'Email'
          ),
          custServicePhoneNumber: new FormControl(
            this.event.EventInfo.custServicePhoneNumber || '',
            [Validators.maxLength(20)]
          ),
          custServiceEmailAddress: new FormControl(
            this.event.EventInfo.custServiceEmailAddress || '',
            [Validators.email]
          ),

          eventName: new FormControl(
            this.event.EventInfo.eventName || 'SAMPLE EVENT NAME',
            [
              Validators.required,
              Validators.minLength(10),
              Validators.maxLength(75),
            ]
          ),
          eventDisplayName: new FormControl(
            this.event.EventInfo.eventDisplayName ||
              'SAMPLE EVENT DISPLAY NAME',
            [Validators.required]
          ),
          eventYear: new FormControl(this.event.EventInfo.eventYear || ''),
          description: new FormControl(this.event.EventInfo.description || '', [
            Validators.required,
            Validators.maxLength(4000),
          ]),
          eventLogo: new FormControl(this.event.EventInfo.eventLogo || ''),
          eventSecurityLevel: new FormControl(
            this.event.EventInfo.eventSecurityLevel || 'public',
            [Validators.required]
          ),
          eventAccessCode: new FormControl(
            this.event.EventInfo.eventAccessCode || ''
          ),
          eventFormat: new FormControl(this.event.EventInfo.eventFormat || '', [
            Validators.required,
          ]),
          categories: new FormControl(this.event.EventInfo.categories || '', [
            Validators.required,
          ]),
          showCode: new FormControl(this.event.EventInfo.showCode || '', [
            Validators.required,
          ]),
          tradeShowName: new FormControl(
            this.event.EventInfo.tradeShowName || '',
            [Validators.required]
          ),
          paymentWay: new FormControl(
            this.event.EventInfo.paymentWay || 'braintree',
            [Validators.required]
          ),

          ...((this.event.EventInfo.paymentWay === 'braintree' ||
            !this.event.EventInfo.paymentWay) && {
            merchantId: new FormControl(this.event.EventInfo.merchantId ?? '', [
              Validators.required,
            ]),
            publicKey: new FormControl(this.event.EventInfo.publicKey ?? '', [
              Validators.required,
            ]),
            privateKey: new FormControl(this.event.EventInfo.privateKey ?? '', [
              Validators.required,
            ]),
          }),

          ...(this.event.EventInfo.paymentWay === 'authorizenet' && {
            apiLoginId: new FormControl(this.event.EventInfo.apiLoginId ?? '', [
              Validators.required,
            ]),
            transactionKey: new FormControl(
              this.event.EventInfo.transactionKey ?? '',
              [Validators.required]
            ),
          }),

          homePageOnShowInfo: new FormControl(
            this.event.EventInfo.homePageOnShowInfo || 'https://www.sample.com',
            [Validators.required, httpsLinkValidator]
          ),

          startDate: new FormControl(this.event.EventInfo.startDate || '', [
            Validators.required,
          ]),
          startTime: new FormControl(this.event.EventInfo.startTime || '', [
            Validators.required,
          ]),
          endDate: new FormControl(this.event.EventInfo.endDate || '', [
            Validators.required,
          ]),
          endTime: new FormControl(this.event.EventInfo.endTime || '', [
            Validators.required,
          ]),
          address1: new FormControl(this.event.EventInfo.address1 || '', [
            Validators.required,
            Validators.maxLength(255),
          ]),
          address2: new FormControl(
            this.event.EventInfo.address2 || '',
            Validators.maxLength(40)
          ),
          address3: new FormControl(
            this.event.EventInfo.address3 || '',
            Validators.maxLength(40)
          ),
          city: new FormControl(this.event.EventInfo.city || '', [
            Validators.maxLength(40),
          ]),
          state: new FormControl(this.event.EventInfo.county || '', [
            Validators.maxLength(40),
          ]),
          county: new FormControl(
            this.event.EventInfo.county || '',
            Validators.maxLength(40)
          ),
          country: new FormControl(
            this.event.EventInfo.country || '',
            Validators.maxLength(40)
          ),
          countryCode: new FormControl(
            this.event.EventInfo.countryCode || '',
            Validators.maxLength(40)
          ),
          zip: new FormControl(this.event.EventInfo.zip || '', [
            Validators.required,
          ]),
          phone: new FormControl(this.event.EventInfo.phone || '', [
            Validators.required,
            Validators.maxLength(40),
          ]),
          Seminar: new FormControl(this.event.EventInfo.Seminar),
          Social: new FormControl(this.event.EventInfo.Social),
          Trade: new FormControl(this.event.EventInfo.Trade),
          Workshop: new FormControl(this.event.EventInfo.Workshop),

          hideShowInfo: new FormControl(this.event.EventInfo.hideShowInfo),
          hideShowInfoTitle: new FormControl(
            this.event.EventInfo.hideShowInfoTitle
          ),
          hideShowInfoButton: new FormControl(
            this.event.EventInfo.hideShowInfoButton
          ),
          hideShowInfoFollowUs: new FormControl(
            this.event.EventInfo.hideShowInfoFollowUs
          ),
        });

        if (this.event.EventInfo.eventSecurityLevel === 'private') {
          this.eventInfoForm
            .get('eventAccessCode')
            .setValidators([
              Validators.required,
              Validators.minLength(6),
              Validators.maxLength(6),
            ]);
          this.eventInfoForm.get('eventAccessCode').updateValueAndValidity();
        } else {
          this.eventInfoForm.get('eventAccessCode').clearValidators();
          this.eventInfoForm.get('eventAccessCode').updateValueAndValidity();
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.pageTypeSubscription.unsubscribe();
  }

  getEventInfo() {
    const EVENT_DATA_API1 = `${API_URL2}/csi/event/services/eventSetupV2/findAllEvtInfoByEvtUid?evtUid=${this.evtUid}`;
    this.isLoaded = false;
    this.httpClient.get(EVENT_DATA_API1, { headers }).subscribe(
      (data: any) => {
        let evtName = data?.response?.Event?.evtName;
        if (evtName && evtName.split(' ').length > 1) {
          evtName = evtName.split(' ').slice(0, -1).join(' ');
        }
        if (data?.statusMessage === 'Success') {
          this.event.EventInfo = {
            eventName: evtName, // data?.response?.Event?.evtName?.split(' ').slice(0, -1).join(' ') || '',
            eventDisplayName: data?.response?.Event?.eventDisplayName || '',
            eventYear: data?.response?.ShowStartYear || '', // data?.response?.Event?.evtName?.split(' ').slice(-1)[0] || '',
            description: data?.response?.Event?.evtInfoText || '',
            startDate: data?.response?.Event?.startDate
              ? this.formatDate(
                  new Date(data['response']['Event']['startDate'])
                )
              : '',
            startTime: data?.response?.Event?.startTime || '',
            endDate: data?.response?.Event?.endDate
              ? this.formatDate(new Date(data['response']['Event']['endDate']))
              : '',
            endTime: data?.response?.Event?.endTime || '',
            eventSecurityLevel: data?.response?.Event?.eventSecurityType || '',
            eventAccessCode: data?.response?.Event?.eventAccessCode
              ? atob(data?.response?.Event?.eventAccessCode)
              : '',
            categories: data?.response?.Category?.[0]?.category || '',

            paymentWay: data?.response?.Event?.paymentWay || '',

            ...((data?.response?.Event?.merchantId ||
              data?.response?.Event?.paymentWay === 'braintree') && {
              merchantId: data?.response?.Event?.merchantId ?? '',
            }),
            ...((data?.response?.Event?.publicKey ||
              data?.response?.Event?.paymentWay === 'braintree') && {
              publicKey: data?.response?.Event?.publicKey ?? '',
            }),
            ...((data?.response?.Event?.privateKey ||
              data?.response?.Event?.paymentWay === 'braintree') && {
              privateKey: data?.response?.Event?.privateKey ?? '',
            }),

            ...((data?.response?.Event?.apiLoginId ||
              data?.response?.Event?.paymentWay === 'authorizenet') && {
              apiLoginId: data?.response?.Event?.apiLoginId ?? '',
            }),
            ...((data?.response?.Event?.transactionKey ||
              data?.response?.Event?.paymentWay === 'authorizenet') && {
              transactionKey: data?.response?.Event?.transactionKey ?? '',
            }),

            homePageOnShowInfo:
              data?.response?.Event?.homePageOnShowInfo || 'https://',
            blockedCountries: data?.response?.BlockedCountries || [],

            eventLogo: data?.response?.Event?.eventLogo || '',
            address1: data?.response?.Event?.venueaddress1?.split(',')[0] || '',
            address2: data?.response?.Event?.venueaddress2 || '',
            address3: data?.response?.Event?.venueaddress3 || '',
            city: data?.response?.Event?.venueCity || '',
            county: data?.response?.Event?.venuecounty || '',
            state: data?.response?.Event?.venueState || '',
            countryCode: data?.response?.Event?.venuecountrycd || '',
            country: data?.response?.Event?.venuecountry || '',
            zip: data?.response?.Event?.venuePostalCode
              ? String(data?.response?.Event?.venuePostalCode).trim()
              : '',
            phone: data?.response?.Event?.associationPhoneNumb || '',
            Seminar:
              data?.response?.TypeOfEvent?.seminar === 'true' ? true : false,
            Social:
              data?.response?.TypeOfEvent?.social === 'true' ? true : false,
            Trade: data?.response?.TypeOfEvent?.trade === 'true' ? true : false,
            Workshop:
              data?.response?.TypeOfEvent?.workshop === 'true' ? true : false,
            eventFormat: data?.response?.Event?.evtFormat || '',
            reqProjMgrName: data?.response?.Event?.reqProjMgrName || '',
            salesExecName: data?.response?.Event?.salesExecName || '',
            showCode: data?.response?.Event?.showCode || '',
            tradeShowName: data?.response?.Event?.tradeShowName || '',
            custServicePhoneNumber:
              data?.response?.Event?.custServicePhoneNumber || '',
            custServiceEmailAddress:
              data?.response?.Event?.custServiceEmailAddress || '',

            hideShowInfo:
              data?.response?.Event?.hideShowInfo === 'true' ? true : false,
            hideShowInfoTitle:
              data?.response?.Event?.hideShowInfoTitle === 'true'
                ? true
                : false,
            hideShowInfoButton:
              data?.response?.Event?.hideShowInfoButton === 'true'
                ? true
                : false,
            hideShowInfoFollowUs:
              data?.response?.Event?.hideShowInfoFollowUs === 'true'
                ? true
                : false,
          };

          this.event.noSessions =
            data?.response?.Event?.noSessions === 'true' ? true : false;
          this.event.noDiscounts =
            data?.response?.Event?.noDiscounts === 'true' ? true : false;
          this.event.noQualifications =
            data?.response?.Event?.noQualifications === 'true' ? true : false;

          this.patchEventInfoForm();

          this.builderUrl = data?.response?.Event?.builderURL || '';
          this.builderIOID = data?.response?.Event?.builderId || '';
          this.builderSelection = data?.response?.Event?.builderSelection || '';
          this.exhibitorIOID = data?.response?.Event?.exhibitorId || '';
          this.exhibitorSelection =
            data?.response?.Event?.exhibitorSelection || '';
          this.organizerIOID = data?.response?.Event?.organizerId || '';
          this.organizerSelection =
            data?.response?.Event?.organizerSelection || '';
          this.commanderIOID = data?.response?.Event?.commanderId || '';
          this.commanderSelection =
            data?.response?.Event?.commanderSelection || '';
          this.eventPortalIOID = data?.response?.Event?.eventPortalId || '';
          this.eventPortalSelection =
            data?.response?.Event?.eventPortalSelection || '';
          this.thumbnailImg = data?.response?.Event?.thumbnailUrl || '';
          this.addUserid = data?.response?.Event?.addUserid || '';

          this.getSite();

          /** regtype */
          if (
            data?.['response']?.['regTypes'] &&
            data?.['response']?.['regTypes'] != 'null' &&
            data?.['response']?.['regTypes'].length > 0
          ) {
            this.event.regtypesList = data?.['response']?.['regTypes'];
            const uniq = new Set(
              this.event.regtypesList.map((e) => JSON.stringify(e))
            );
            this.event.regtypesList = Array.from(uniq).map((e) => {
              const regtype = JSON.parse(e);
              return {
                ...regtype,
                barcodecolor: regtype.barcodecolor || '#000000',
                backgroundcolor: regtype.backgroundcolor || '',
                backgroundtextcolor: regtype.backgroundtextcolor || '',
              };
            });
          } else {
            this.event.regtypesList = [];
          }

          /** regtype and packages data data */
          data?.['response']?.['EventCosts'].forEach((element) => {
            this.event.eventCosts.push({
              isChecked:
                element.isChecked === true || element.isChecked === 'true'
                  ? true
                  : false,
              refCodes: element.refCodes,
              rates: element.rates,
              customPackage: element.customPackage,
              nonMember: ['Member', 'Non member', 'NONE'].includes(
                element.nonMember
              )
                ? element.nonMember
                : 'None',
            });
          });

          /** discount data */
          if (
            data['response']?.['discounts'] &&
            data['response']['discounts'] != 'null' &&
            data['response']['discounts']?.length > 0
          ) {
            data['response']['discounts']?.forEach((discount) => {
              this.event.discountList.push({
                ...discount,
                discountGroup: String(discount.discountGroup)?.toLowerCase(),
                allotment: Number(discount.allotment) || null,
              });
            });
          }

          /** qualifications data */
          if (
            data['response']['qualifications'] &&
            data['response']['qualifications'] != 'null' &&
            data['response']['qualifications'].length > 0
          ) {
            data['response']['qualifications'].forEach((element) => {
              let qual = {
                regType: element.regType || '',
                qualification: element.qualification || '',
                sampleQualificationFileData:
                  element.samplequalificationfiledata,
                formRequirement: element.formRequirement,
                editFlag: null,
                qualName: element.qualname || '',
              } as any;
              this.bucket
                .getFile('Qualifications', element.samplequalificationfiledata)
                .subscribe(
                  (data) => {
                    qual.sampleQualificationFileDataData = data;
                    this.event.addedQualifications.push(qual);
                  },
                  (err) => {
                    qual.sampleQualificationFileDataData = '';
                    this.event.addedQualifications.push(qual);
                  }
                );
            });
          }

          /** sessions data */
          if (
            data?.response?.sessions &&
            data.response.sessions !== 'null' &&
            Array.isArray(data.response.sessions)
          ) {
            data.response.sessions.map((e) => {
              this.event.sessionList.push(e);
            });
          }

          /** Floorplan data */
          this.floorPlanImageUrl =
            data['response']?.['eventFloorPlan']?.['floorPlanImageUrl'];

          /** Demographic questions data */
          if (
            data['response']['questions'] &&
            data['response']['questions'].length > 0
          ) {
            const customQues = [];
            let questions = data['response']['questions'];
            questions = questions
              .map((question: any) => ({
                ...question,
                category: Array.isArray(question.category)
                  ? question.category
                  : [question.category],
              }))
              .filter(
                (thing, index, self) =>
                  index ===
                  self.findIndex(
                    (t) =>
                      t.question === thing.question &&
                      t.category == thing.category &&
                      t.PollingType === thing.PollingType
                  )
              )
              .filter((question: any) => question?.category?.length);
            const currentQuestions = [];
            questions.forEach((d) => {
              let checked = false;
              currentQuestions.forEach((question) => {
                if (
                  d.question == question.question &&
                  d.category == question.category &&
                  d.PollingType == question.PollingType
                ) {
                  question.checked = true;
                  checked = true;
                }
              });
              if (checked === false) {
                customQues.push(d);
              }
            });
            if (customQues.length > 0) {
              customQues.forEach((ele) => {
                ele.id = this.event.questionsList.length;
                ele.checked = ele.checked === 'true' ? true : false;
                this.event.questionsList.push(ele);
              });
            }
          }

          /** Exhibitor Allotment data */
          if (
            data?.['response']?.['ExhibitorInfos'] &&
            data['response']['ExhibitorInfos'] != 'null'
          ) {
            this.event.exhibitorAllotmentList =
              data['response']['ExhibitorInfos'];
          }

          /** Membership Information data */
          if (
            data?.['response']?.['MembershipInfos'] &&
            data['response']['MembershipInfos'] != 'null'
          ) {
            this.event.membershipInfoList = data['response']['MembershipInfos'];
          }
          /* add speaker details */
          this.dataService.clearSpeakerList();
          if (
            data?.['response']?.['speakers'] &&
            data['response']['speakers'] != 'null' &&
            data['response']['speakers'].length > 0
          ) {
            data['response']['speakers'].forEach((speaker) => {
              this.dataService.setSpeakerList(speaker);
            });
          }

          // if (
          //   data?.['response']?.['businessRules'] && data['response']['businessRules'] != 'null' && data['response']['businessRules'].length > 0
          // ) {
          //   this.event.businessRules = data['response']['businessRules'];
          // }

          if (data?.['response']['EmailBuilder'] !== 'null') {
            this.event.emailBuilder = data['response']['EmailBuilder'];
          } else {
            let tempEmail = [];
            Object.keys(defaultTemplate).map((key) => {
              let tempItem = {
                name: key,
                content: defaultTemplate[key],
              };
              tempEmail.push(tempItem);
            });
            this.event.emailBuilder = tempEmail;
          }

          if (data?.['response']['BadgeDesigner'] !== 'null') {
            this.event.badgeDesigner = data['response']['BadgeDesigner'];
          } else {
            this.event.badgeDesigner = defaultBadgeTemplate;
          }

          /** Page Customization Data */
          if (
            data?.['response']?.['PageList']?.length > 0 &&
            data?.['response']?.['PageList'][0].workflow
          ) {
            /** Get the workflow data list from the get event info API response */
            const workflowList: WorkflowData[] =
              data['response']['PageList']?.map(
                (workflowData: WorkflowData) => ({
                  ...workflowData,
                  pageList:
                    workflowData?.pageList?.map((pageData: PageData) => ({
                      ...pageData,
                      sectionsList:
                        pageData?.sectionsList?.map((section: SectionData) => ({
                          ...section,
                          fieldsList:
                            section?.fieldsList?.map(
                              (field: FieldData | any) => ({
                                ...field,
                                static: !(field?.dynamic ?? true),
                              })
                            ) ?? [],
                        })) ?? [],
                    })) ?? [],
                })
              ) ?? [];

            /** Update the page customization properties and add the missing properties */
            this.event.pageList = updatePageCustomization(workflowList);
          } else {
            this.event.pageList = WorkflowList;
          }

          /** Get the builderTemplate from the event info API response */
          this.builderTemplate = Array.isArray(data?.response?.BuilderTemplates)
            ? data?.response?.BuilderTemplates
            : [];

          /** Update the existing template fields */
          this.builderTemplate = updatePageTemplates(this.builderTemplate);

          this.isLoaded = true;
        } else {
          this.toastService.show('The Get Account Information API failed.', {
            delay: 8000,
            classname: 'bg-warning text-light',
            headertext: 'Warning',
            autohide: true,
          });
        }
        this.statusService.hidePageLoading();
      },
      (err: HttpErrorResponse) => {
        console.error(err);
        this.statusService.hidePageLoading();
      }
    );
  }

  private getAllEvents() {
    let GET_ALL_EVENTS =
      API_URL2 + '/csi/event/services/eventV2/getAllEventNames';
    this.httpClient.get(GET_ALL_EVENTS, { headers }).subscribe((data) => {
      if (data['response']['Error'] != undefined) {
        console.log(data['response']['Error']);
      } else {
        const response = data['response'];
        response.forEach((valArr) => {
          this.eventNameList.push(valArr[1].toUpperCase());
        });
      }
    });
  }

  private formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }

  private formatTime(ts) {
    const rts = ts * 86400;
    let hrs = Math.round(ts * 24);
    let mins = Math.round(ts * 24 * 60 - hrs * 60);

    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
    ].join(':');
  }

  getSite() {
    const userId: string = localStorage.getItem('userId');
    const loggedIn: string = localStorage.getItem('loggedIn');
    const emailAddr: string = localStorage.getItem('emailAddr') || userId;

    const attendeeURL: string = `${this.PUBLISHED_PAPERBITS}/${this.addUserid}/${this.builderIOID}/${this.builderSelection}?email=${emailAddr}&isLoggedIn=${loggedIn}`;
    this.tinyUrl.shorten(attendeeURL).subscribe(
      (url: string) => {
        this.attendeeSiteURL = url;
      },
      (err: HttpErrorResponse) => {
        console.error(err);
        fetch(
          `https://tinyurl.com/api-create.php?url=${encodeURIComponent(
            attendeeURL
          )}`
        ).then(async (res) => {
          const url: string = await res.text();
          this.attendeeSiteURL = url;
        });
      }
    );
    const exhibitorURL: string = `${this.PUBLISHED_PAPERBITS}/${this.addUserid}/${this.exhibitorIOID}/${this.exhibitorSelection}?email=${emailAddr}&isLoggedIn=${loggedIn}`;
    this.tinyUrl.shorten(exhibitorURL).subscribe(
      (url: string) => {
        this.attendeeSiteURL = url;
      },
      (err: HttpErrorResponse) => {
        console.error(err);
        fetch(
          `https://tinyurl.com/api-create.php?url=${encodeURIComponent(
            exhibitorURL
          )}`
        ).then(async (res) => {
          const url: string = await res.text();
          this.exhibitorSiteURL = url;
        });
      }
    );
    const organizerURL: string = `${this.PUBLISHED_PAPERBITS}/${this.addUserid}/${this.organizerIOID}/${this.organizerSelection}?email=${emailAddr}&isLoggedIn=${loggedIn}`;
    this.tinyUrl.shorten(organizerURL).subscribe(
      (url: string) => {
        this.attendeeSiteURL = url;
      },
      (err: HttpErrorResponse) => {
        console.error(err);
        fetch(
          `https://tinyurl.com/api-create.php?url=${encodeURIComponent(
            organizerURL
          )}`
        ).then(async (res) => {
          const url: string = await res.text();
          this.organizerSiteURL = url;
        });
      }
    );
    const commanderURL: string = `${this.PUBLISHED_PAPERBITS}/${this.addUserid}/${this.commanderIOID}/${this.commanderSelection}?email=${emailAddr}&isLoggedIn=${loggedIn}`;
    fetch(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(
        commanderURL
      )}`
    ).then(async (res) => {
      const url: string = await res.text();
      this.commanderSiteURL = url;
    });

    const eventPortalURL: string = `${this.PUBLISHED_PAPERBITS}/${this.addUserid}/${this.eventPortalIOID}/${this.eventPortalSelection}?email=${emailAddr}&isLoggedIn=${loggedIn}`;
    fetch(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(
        eventPortalURL
      )}`
    ).then(async (res) => {
      const url: string = await res.text();
      this.eventPortalSiteURL = url;
    });
  }

  openSite(type: string, openURL: boolean = true) {
    const userId: string = localStorage.getItem('userId');
    const loggedIn: string = localStorage.getItem('loggedIn');
    const emailAddr: string = localStorage.getItem('emailAddr') || userId;
    let selectionPath: string = '';
    let guid: string = '';
    switch (type) {
      case 'attendee':
        selectionPath = this.builderSelection;
        guid = this.builderIOID;
        break;
      case 'exhibitor':
        selectionPath = this.exhibitorSelection;
        guid = this.exhibitorIOID;
        break;
      case 'organizer':
        selectionPath = this.organizerSelection;
        guid = this.organizerIOID;
        break;
      case 'commander':
        selectionPath = this.commanderSelection;
        guid = this.commanderIOID;
        break;
      case 'event-portal':
        selectionPath = this.eventPortalSelection;
        guid = this.eventPortalIOID;
        break;
      default:
        break;
    }
    const siteURL: string = `${this.PUBLISHED_PAPERBITS}/${this.addUserid}/${guid}/${selectionPath}?email=${emailAddr}&isLoggedIn=${loggedIn}`;
    if (openURL) {
      window.open(siteURL, '_blank');
    } else {
      let URL: string = '';
      switch (type) {
        case 'attendee':
          URL = this.attendeeSiteURL;
          break;
        case 'exhibitor':
          URL = this.exhibitorSiteURL;
          break;
        case 'organizer':
          URL = this.organizerSiteURL;
          break;
        case 'commander':
          URL = this.commanderSiteURL;
          break;
        case 'event-portal':
          URL = this.eventPortalSiteURL;
          break;
        default:
          break;
      }
      return URL ? URL : siteURL;
    }
  }

  businessRule() {
    this.sessionService.set('selectedEvent', this.evtUid);
    this.router.navigate([`/businessrule/${this.evtUid}`]);
  }

  selectTab(tab: any) {
    this.detectDataFromTabs();

    if (this.pageType !== 'create' || tab === 'Event Info') {
      const willSelectTabIndex: number = this.tabList.findIndex(
        (tabName: string) => tabName === tab
      );
      const formValid: boolean = this.validateTab();
      if (formValid) {
        if (this.validTabsIndex.includes(willSelectTabIndex)) {
          this.selectedTab = tab;
          this.selectedTabIndex = willSelectTabIndex;
          this.validTabsIndex = this.validTabsIndex.filter(
            (item) => item <= willSelectTabIndex
          );
        }
      } else {
        this.toastService.show(
          'Current tab is not valid. Please check it again',
          {
            delay: 6000,
            classname: 'bg-warning text-dark',
            headertext: 'Warning',
            autohide: true,
          }
        );
      }
    }
  }

  deleteEvent() {
    let delete_api =
      API_URL2 +
      `/csi/event/services/eventSetupV2/disable?evtUid=${this.evtUid}`;
    const deleteRegtypeConfirmModalRef = this.modalService.open(
      DeleteConfirmComponent,
      {
        size: 'sm',
        windowClass: 'modal-custom-deleteConfirm',
      }
    );
    deleteRegtypeConfirmModalRef.componentInstance.confirmMsg =
      'Are you sure want to delete Event?';
    deleteRegtypeConfirmModalRef.result
      .then((agree: boolean) => {
        if (agree === true) {
          this.httpClient
            .post(delete_api, { disableFlag: true }, { headers: headers })
            .subscribe(
              (deleteResponse: any) => {
                console.error('deleteResponse: ', deleteResponse);

                if (deleteResponse?.statusMessage === 'Success') {
                  this.toastService.show('Removed the event successfully', {
                    delay: 6000,
                    classname: 'bg-success text-light',
                    headertext: 'Delete Event',
                    autohide: true,
                  });
                  this.timeout = setTimeout(() => {
                    this.router.navigate(['/']);
                  }, 2000);
                } else {
                  this.toastService.show('Failed to remove the event.', {
                    delay: 6000,
                    classname: 'bg-warning text-light',
                    headertext: 'Warning',
                    autohide: true,
                  });
                }
              },
              (err: HttpErrorResponse) => {
                console.error(err);
                this.toastService.show(
                  err?.message || err?.error?.message || 'Something wrong!',
                  {
                    delay: 6000,
                    classname: 'bg-danger text-light',
                    headertext: 'Error',
                    autohide: true,
                  }
                );
              }
            );
        }
      })
      .catch((err: Error) => {
        console.error('close error: ', err);
      });
  }

  editEvent() {
    this.sessionService.set('selectedEvent', this.evtUid);
    this.sessionService.set('mode', 'edit');
    this.router.navigate(['/editevent']);
  }

  leaveEvent() {
    const leaveEventModalRef = this.modalService.open(LeaveEventComponent, {
      size: 'sm',
      windowClass: 'modal-leave-event',
    });
    leaveEventModalRef.componentInstance.pageType = this.pageType;
    leaveEventModalRef.result.then(({ action }: { action: LeaveAction }) => {
      if (action === 'save') {
        this.detectDataFromTabs();
        const formValid: boolean = this.validateTab();
        if (formValid) {
          this.completeEvent();
        } else {
          this.toastService.show(
            'Current tab is not valid. Please check it again',
            {
              delay: 6000,
              classname: 'bg-warning text-dark',
              headertext: 'Warning',
              autohide: true,
            }
          );
        }
      } else if (action === 'ignore') {
        this.router.navigate(['/']);
      }
    });
  }

  export() {
    const psmExportModalRef = this.modalService.open(PSMExportComponent, {
      size: 'sm',
      windowClass: 'modal-custom-psmExport',
    });
    psmExportModalRef.result.then(
      ({
        exportType,
        fileType,
      }: {
        exportType: ExportType;
        fileType: FileType;
      }) => {
        this.exportFileType = fileType;
        if (exportType === 'selected') {
          this.exportSelectedTab();
        } else if (exportType === 'event') {
          this.exportEvent();
        }
      }
    );
  }

  downloadFile(data: ExportDataType[], fileName: string = 'data') {
    console.log(fileName);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const fileExt = this.exportFileType === 'csv' ? 'csv' : 'xlsx';

    data.forEach((item: ExportDataType) => {
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(item.content);
      XLSX.utils.book_append_sheet(wb, worksheet, item.name);
    });

    XLSX.writeFile(wb, `${fileName}.${fileExt}`);
  }

  getExportData(tab: string) {
    let data = [];
    switch (tab) {
      case 'Event Info':
        const eventInfo = this.event.EventInfo;
        const eventType = [];
        if (eventInfo.Trade) {
          eventType.push('TRD');
        }
        if (eventInfo.Seminar) {
          eventType.push('SEMINAR');
        }
        if (eventInfo.Social) {
          eventType.push('SOCIAL');
        }
        if (eventInfo.Workshop) {
          eventType.push('WORKSHOP');
        }
        data = [
          {
            eventName: eventInfo.eventName,
            eventDisplayName: eventInfo.eventDisplayName,
            EventShowYear: eventInfo.eventYear,
            EventInfoTxt: eventInfo.description,
            StartDate: eventInfo.startDate,
            StartTime: eventInfo.startTime,
            EndDate: eventInfo.endDate,
            EndTime: eventInfo.endTime,
            ShowSecurityType: eventInfo.eventSecurityLevel,
            eventAccessCode: eventInfo.eventAccessCode,
            eventCategory: eventInfo.categories,
            PaymentWay: eventInfo.paymentWay,

            ...(this.event.EventInfo.merchantId && {
              GatewayMerchantId: this.event.EventInfo.merchantId,
            }),
            ...(this.event.EventInfo.publicKey && {
              publicKey: this.event.EventInfo.publicKey,
            }),
            ...(this.event.EventInfo.privateKey && {
              privateKey: this.event.EventInfo.privateKey,
            }),
            ...(this.event.EventInfo.apiLoginId && {
              apiLoginId: this.event.EventInfo.apiLoginId,
            }),
            ...(this.event.EventInfo.transactionKey && {
              transactionKey: this.event.EventInfo.transactionKey,
            }),

            venueAddress: eventInfo.address1,
            venueAddress2: eventInfo.address2,
            venueAddress3: eventInfo.address3,
            venueCity: eventInfo.city,
            venueCounty: eventInfo.county,
            venueState: eventInfo.state,
            venueCountryCode: eventInfo.countryCode,
            venueCountry: eventInfo.country,
            venuePostalCode: eventInfo.zip,
            mainPhoneNumber: eventInfo.phone,
            eventType: JSON.stringify(eventType),
            ReqdNoqualFlag: eventInfo.noRequiredQualifications || false,
            ReqdQualIdFlag: eventInfo.TaxIDNumber || false,
            ReqdQualPayFlag: eventInfo.PayStub || false,
            ReqdQualLicFlag: eventInfo.BusLi || false,
            ReqdPhotoFlag: eventInfo.PhotoID || false,
            eventFormat: eventInfo.eventFormat,
            RPMName: eventInfo.reqProjMgrName,
            preferredMethod: eventInfo.preferredMethod,
            SalesExecName: eventInfo.salesExecName,
            showCode: eventInfo.showCode,
            tradeShowName: eventInfo.tradeShowName,
            CustServicePhoneNbr: eventInfo.custServicePhoneNumber,
            CustServiceEmail: eventInfo.custServiceEmailAddress,
            homePageOnShowInfo: eventInfo.homePageOnShowInfo,
            blockedCountries: JSON.stringify(eventInfo.blockedCountries),
            hideShowInfo: eventInfo.hideShowInfo,
            hideShowInfoButton: eventInfo.hideShowInfoButton,
            hideShowInfoFollowUs: eventInfo.hideShowInfoFollowUs,
            hideShowInfoTitle: eventInfo.hideShowInfoTitle,
          },
        ];
        break;
      case 'Reg Types':
        data = [];
        this.event.regtypesList.forEach((item) => {
          const eventCosts = this.event.eventCosts.filter((cost) =>
            cost.refCodes.includes(item.code + ' - ' + item.description)
          );
          eventCosts.forEach((eventCost) => {
            data.push({
              EventRegType: item.code,
              RegcodeEvtcode: item.code,
              Description: item.description,
              Barcodecolor: item.barcodecolor,
              BadgeExplosion: item.backgroundcolor,
              BadgeTextColor: item.backgroundtextcolor,
              EarlyBirdStartDate: eventCost.rates.duringEventBirdStartDate,
              EarlyBirdEndDate: eventCost.rates.duringEventBirdEndDate,
              EarlyBirdRate: eventCost.rates.duringEventBirdRate,
              AdvanceStartDate: eventCost.rates.duringEventBirdStartDate2,
              AdvanceEndDate: eventCost.rates.duringEventBirdEndDate2,
              AdvanceRate: eventCost.rates.duringEventBirdRate2,
              OnsiteStartDate: eventCost.rates.duringEventBirdStartDate3,
              OnsiteEndDate: eventCost.rates.duringEventBirdEndDate3,
              OnsiteRate: eventCost.rates.duringEventBirdRate3,
              custom_pckg_name: eventCost.customPackage.name,
              custom_pckg_description: eventCost.customPackage.description,
              custom_pckg_cost: eventCost.customPackage.cost,
              nonMember: eventCost.nonMember,
            });
          });
          if (eventCosts.length === 0) {
            data.push({
              EventRegType: item.code,
              RegcodeEvtcode: item.code,
              Description: item.description,
              EarlyBirdStartDate: '',
              EarlyBirdEndDate: '',
              EarlyBirdRate: '',
              AdvanceStartDate: '',
              AdvanceEndDate: '',
              AdvanceRate: '',
              OnsiteStartDate: '',
              OnsiteEndDate: '',
              OnsiteRate: '',
              custom_pckg_name: '',
              custom_pckg_description: '',
              custom_pckg_cost: '',
              nonMember: '',
            });
          }
        });
        break;
      case 'Packages':
        data = this.event.eventCosts.map((item) => {
          return {
            refCodes: JSON.stringify(item.refCodes),
            duringEventBirdStartDate: item.rates.duringEventBirdStartDate,
            duringEventBirdEndDate: item.rates.duringEventBirdEndDate,
            duringEventBirdRate: item.rates.duringEventBirdRate,
            duringEventBirdStartDate2: item.rates.duringEventBirdStartDate2,
            duringEventBirdEndDate2: item.rates.duringEventBirdEndDate2,
            duringEventBirdRate2: item.rates.duringEventBirdRate2,
            duringEventBirdStartDate3: item.rates.duringEventBirdStartDate3,
            duringEventBirdEndDate3: item.rates.duringEventBirdEndDate3,
            duringEventBirdRate3: item.rates.duringEventBirdRate3,
            name: item.customPackage.name,
            description: item.customPackage.description,
            cost: item.customPackage.cost,
            nonMember: item.nonMember,
            zeroCost: item.zeroCost || false,
          };
        });
        break;
      case 'Discounts':
        data = this.event.discountList.map((item) => {
          return {
            useBre: item.useBre,
            DiscountCode: item.discountType,
            discountname: item.discountName,
            Discount: item.amount,
            DiscountGroupNbr: item.discountGroup,
            Description: item.discountDescription,
            'Reg Type': item.appliedRegtypes
              .map((regType: string) => regType.split(' - ')[0])
              .join(','),
            appliedCountries: JSON.stringify(item.appliedCountries),
            discountStatus: item.discountStatus,
            discode: item.discountcd,
            promoCode: item.promoCode,
            'Start Date and Time': item.startDate,
            'End Date and Time': item.endDate,
            Priority: item.priority,
            allotment: item.allotment,
            GLCode: item.glCode,
          };
        });
        break;
      case 'Qualifications':
        data = this.event.addedQualifications.map((item) => {
          return {
            regType: item.regType,
            qualification: item.qualification,
            sampleQualificationFileData: item.sampleQualificationFileData,
            formRequirement: item.formRequirement,
            qualName: item.qualName,
          };
        });
        break;
      case 'Sessions':
        data = this.event.sessionList.map((item) => {
          return {
            SessionDescription: item.name,
            useBre: item.useBre,
            sessionType: item.sessionType,
            PublicPrivate:
              item.privateSession === 'N'
                ? 'Public'
                : item.privateSession === 'Y'
                ? 'Private'
                : '',
            AllotmentRoomCapacity: item.sessionAttendeeCapacity,
            Topic: item.topics,
            optionType: item.optionType,
            SpeakerName: item.speaker,
            SpeakerBio: item.synopsis,
            SessionRate: item.period[0].cost,
            'StartDate(MM/DD/YYYY)': item.period[0].startDate,
            'StartTime(24H)': item.period[0].startTime,
            'EndDate(MM/DD/YYYY)': item.period[0].endDate,
            'EndTime(24H)': item.period[0].endTime,
            GLCode: item.glCode,
          };
        });
        break;
      case 'Demographic Questions':
        data = [];
        this.event.questionsList.forEach((item) => {
          for (let i = 0; i < item.demDetails.length; i++) {
            data.push({
              checked: item.checked,
              PollingType: item.pollingType,
              FocusType: JSON.stringify(item.category),
              ResponseFieldType: item.responseLayout,
              Description: item.question,
              demQuestion: item.questionName,
              dedDescription: item.demDetails[i].dedDescription,
              dedValue: item.demDetails[i].dedValue,
              additionalInfoName: item.demDetails[i].additionalInfoName,
              additionalInfoValue: item.demDetails[i].additionalInfoValue,
            });
          }

          if (item.demDetails.length === 0) {
            data.push({
              checked: item.checked,
              PollingType: item.pollingType,
              FocusType: JSON.stringify(item.category),
              ResponseFieldType: item.responseLayout,
              Description: item.question,
              demQuestion: item.questionName,
            });
          }
        });
        break;
      case 'Business Rules':
        data = this.event.businessRules.map((item) => {
          return {
            ...item.businessRule,
            query: JSON.stringify(item.businessRule.query),
          };
        });
        break;
      case 'Page Customizations':
        data = this.event.pageList.map((page: WorkflowData) => ({
          Workflow: page.workflow,
          PageList: JSON.stringify(page.pageList),
        }));
        break;
      case 'Exhibitor Allotment':
        data = this.event.exhibitorAllotmentList;
        break;
      case 'Membership':
        data = this.event.membershipInfoList;
        break;
      default:
        break;
    }
    return data;
  }

  exportSelectedTab() {
    this.detectDataFromTabs();
    const formValid: boolean = this.validateTab();
    let data = [];
    if (formValid) {
      if (this.exportAvailable.includes(this.selectedTabIndex)) {
        data = this.getExportData(this.selectedTab);
        this.downloadFile(
          [
            {
              content: data,
              name: this.selectedTab,
            },
          ],
          this.selectedTab
        );
      } else {
        alert('Export option is not available on this page');
      }
    } else {
      this.toastService.show(
        'Current tab is not valid. Please check it again',
        {
          delay: 6000,
          classname: 'bg-warning text-dark',
          headertext: 'Warning',
          autohide: true,
        }
      );
    }
  }

  async exportEvent() {
    if (this.exportFileType === 'excel') {
      let data = [];
      for (let i = 0; i < this.exportAvailable.length; i++) {
        const name = this.tabList[this.exportAvailable[i]];
        data.push({
          content: this.getExportData(name),
          name,
        });
      }
      this.downloadFile(data, this.event.EventInfo.eventName);
    } else if (this.exportFileType === 'csv') {
      for (let i = 0; i < this.exportAvailable.length; i++) {
        const name = this.tabList[this.exportAvailable[i]];
        const data = [
          {
            content: this.getExportData(name),
            name,
          },
        ];
        this.downloadFile(data, name);
        /* pause after download 10 files */
        if ((i + 1) % 10 === 0) {
          await new Promise((resolve, reject) => {
            setTimeout(resolve, 200);
          });
        }
      }
    }
  }

  nextPage() {
    this.detectDataFromTabs();
    const formValid: boolean = this.validateTab();
    if (formValid) {
      this.selectedTabIndex = this.tabList.findIndex(
        (tab) => tab === this.selectedTab
      );
      this.validTabsIndex.push(this.selectedTabIndex);
      if (
        this.selectedTabIndex > -1 &&
        this.selectedTabIndex < this.tabList.length - 1
      ) {
        this.selectedTabIndex++;
        this.selectedTab = this.tabList[this.selectedTabIndex];
      } else if (this.selectedTabIndex === -1) {
        this.selectedTabIndex = 0;
        this.selectedTab = this.tabList[0];
      }
    } else {
      this.toastService.show(
        'Current tab is not valid. Please check it again',
        {
          delay: 6000,
          classname: 'bg-warning text-dark',
          headertext: 'Warning',
          autohide: true,
        }
      );
    }
  }

  detectDataFromTabs() {
    switch (this.selectedTab) {
      case 'Event Info':
        this.event['EventInfo'] = this.eventInfoComponent.eventInfoForm.value;
        this.event.EventInfo.blockedCountries = [
          ...(this.eventInfoComponent.blockedCountries ?? []),
        ]?.map((el) => {
          if (typeof el === 'object') return el.name;
          else return el;
        });
        break;
      case 'Reg Types':
        break;
      case 'Packages':
        this.event.eventCosts = this.packagesComponent.eventCosts;
        break;
      case 'Discounts':
        break;
      case 'Qualifications':
        this.event.addedQualifications =
          this.qualificationsComponent.qualificationList;
        break;
      case 'Sessions':
        this.event.sessionList = this.sessionsComponent.sessionList;
        break;
      case 'Demographic Questions':
        break;
      case 'Page Customizations':
        this.event.pageList = this.pageCustomizationsComponent.pageList;
        break;
      case 'Page Builder':
        this.builderTemplate = this.pageBuilderComponent.builderTemplate;
        this.builderUrl = this.pageBuilderComponent.builderUrl;
        this.builderIOID = this.pageBuilderComponent.builderIOID;
        this.exhibitorIOID = this.pageBuilderComponent.exhibitorIOID;
        this.organizerIOID = this.pageBuilderComponent.organizerIOID;
        this.commanderIOID = this.pageBuilderComponent.commanderIOID;
        this.eventPortalIOID = this.pageBuilderComponent.eventPortalIOID;
        this.builderSelection = this.pageBuilderComponent.builderSelection;
        this.exhibitorSelection = this.pageBuilderComponent.exhibitorSelection;
        this.organizerSelection = this.pageBuilderComponent.organizerSelection;
        this.commanderSelection = this.pageBuilderComponent.commanderSelection;
        this.eventPortalSelection =
          this.pageBuilderComponent.eventPortalSelection;
        this.event.pageBuilderLaunched =
          this.pageBuilderComponent.pageBuilderLaunched;
        this.getSite();
        break;
      case 'Exhibitor Allotment':
        break;
      case 'Membership':
        break;
      case 'Email Builder':
        this.event.emailBuilder = this.emailBuilder.emailBuilder;
        break;
      case 'Badge Designer':
        this.event.badgeDesigner = this.badgeDesigner.badgeDesigner;
        break;
      default:
        break;
    }
  }

  validateTab() {
    let formValid: boolean = true;
    switch (this.selectedTab) {
      case 'Event Info':
        formValid = this.eventInfoComponent.isValidTab();
        break;
      case 'Reg Types':
        if (this.event.regtypesList?.length === 0) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please add at least one registration type',
            confirmButtonColor: '#3085d6',
          });
          return false;
        }
        formValid = this.regTypesComponent.validateRegtypes();
        break;
      case 'Packages':
        if (this.event.eventCosts?.length === 0) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please add at least one package',
            confirmButtonColor: '#3085d6',
          });
          return false;
        }
        formValid = this.packagesComponent.getValidatePackagesBeforeNext();
        break;
      case 'Discounts':
        if (this.event.noDiscounts) {
          formValid = true;
        } else {
          if (this.event.discountList?.length > 0) {
            formValid = this.event.discountList?.every(
              (discount: any) =>
                discount.startDate &&
                discount.endDate &&
                moment(discount.startDate).isValid() &&
                moment(discount.endDate).isValid()
            );
            if (!formValid) {
              Swal.fire({
                icon: 'warning',
                title: 'Check Again',
                text: 'There are existing invalid start date or end date',
                confirmButtonColor: '#3085d6',
              });
            } else {
              formValid = this.event.discountList?.every(
                (discount: any) =>
                  (discount.allotment > 0 && discount.allotment <= 1000) ||
                  discount.allotment === null
              );
              if (!formValid) {
                Swal.fire({
                  icon: 'warning',
                  title: 'Check Again',
                  text: 'Some allotment is not within in the range(1 ~ 1000).',
                  confirmButtonColor: '#3085d6',
                });
              }
            }
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Please add at least one discount',
              confirmButtonColor: '#3085d6',
            });
            formValid = false;
          }
        }
        break;
      case 'Qualifications':
        if (this.event.noQualifications) {
          formValid = true;
        } else {
          if (this.event.addedQualifications?.length === 0) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Please add at least one qualification',
              confirmButtonColor: '#3085d6',
            });
          }
          formValid = this.event.addedQualifications?.length > 0;
        }
        break;
      case 'Sessions':
        formValid = this.sessionsComponent.getValidateAllSessions();
        break;
      case 'Demographic Questions':
        if (this.event.questionsList?.length === 0) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please add at least one question',
            confirmButtonColor: '#3085d6',
          });
        }
        formValid = this.event.questionsList?.length > 0;
        break;
      case 'Page Customizations':
        formValid = this.pageCustomizationsComponent.validateCustomTab();
        break;
      case 'Page Builder':
        const curAtt = this.builderTemplate.find(
          (template) =>
            template.templateType === 'Attendee' &&
            (template.checked === true || template.checked === 'true')
        );
        const regIdx = curAtt.pages.findIndex(
          (el) => el.page === 'initial_regtype' && el.displayName
        );

        if (!(this.builderIOID && this.exhibitorIOID && this.organizerIOID)) {
          const alert = 'Please Launch the Website Builder';
          Swal.fire({
            icon: 'warning',
            title: 'Check Again',
            text: alert,
            confirmButtonColor: '#3085d6',
          });
          formValid = false;
          return;
        } else if (regIdx < 0) {
          const alert = 'Please Select Initial RegType';
          Swal.fire({
            icon: 'warning',
            title: 'Check Again',
            text: alert,
            confirmButtonColor: '#3085d6',
          });
          formValid = false;
          return;
        } else {
          formValid = true;
        }
        break;
      case 'Exhibitor Allotment':
        // formValid = this.event.exhibitorAllotmentList?.length > 0
        let count = {};
        this.event.exhibitorAllotmentList.forEach((item) => {
          if (count[item['Primary_Contact_Email_Address']]) {
            count[item['Primary_Contact_Email_Address']] += 1;
          } else {
            count[item['Primary_Contact_Email_Address']] = 1;
          }
        });
        let duplicated = [];
        for (let key in count) {
          if (count[key] > 1) {
            duplicated.push(key);
          }
        }
        formValid =
          this.event.exhibitorAllotmentList?.length > 0 &&
          duplicated.length === 0;
        break;
      case 'Membership':
        if (this.event.membershipInfoList?.length === 0) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please add at least one membership',
            confirmButtonColor: '#3085d6',
          });
        }
        formValid = this.event.membershipInfoList?.length > 0;
        break;
      case 'Business Rules':
        if (this.checkIfUnpublished()) {
          return false;
        } else if (!this.hasChainingOrThreading()) {
          Swal.fire({
            icon: 'warning',
            title: 'Check Again',
            text: 'Business rules should have atleast one chaining or threading question',
            confirmButtonColor: '#3085d6',
          });
          return false;
        } else {
          return true;
        }
      default:
        break;
    }
    return formValid;
  }

  prevPage() {
    this.detectDataFromTabs();
    this.selectedTabIndex = this.tabList.findIndex(
      (tab) => tab === this.selectedTab
    );
    if (this.selectedTabIndex > 0) {
      this.selectedTabIndex--;
      this.selectedTab = this.tabList[this.selectedTabIndex];
    } else if (this.selectedTabIndex === -1) {
      this.selectedTabIndex = 0;
      this.selectedTab = this.tabList[0];
    }
  }

  toggleDropdown(clickedDropdown: NgbDropdown, isOpen: boolean = true) {
    if (isOpen) {
      clickedDropdown.open();
    } else {
      clickedDropdown.close();
    }
  }

  uploadPSM($event) {
    if ($event.target.files && $event.target.files.length > 0) {
      let files = $event.target.files;
      /* sort file list by tab name order */
      files = [].slice
        .call(files)
        .sort(
          (a, b) =>
            this.tabList.findIndex(
              (tabName) => tabName === a.name.split('.')[0]
            ) -
            this.tabList.findIndex(
              (tabName) => tabName === b.name.split('.')[0]
            )
        );
      console.log(files);

      const fileCnt = files.length;
      for (let i = 0; i < fileCnt; i++) {
        const fileName = files[i].name.split('.')[0];
        const reader: FileReader = new FileReader();
        reader.readAsBinaryString(files[i]);
        reader.onload = (e: any) => {
          /* read workbook */
          const bstr: string = e.target.result;
          const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

          for (let j = 0; j < wb.SheetNames.length; j++) {
            const wsname: string = wb.SheetNames[j];
            const ws: XLSX.WorkSheet = wb.Sheets[wsname];

            /* save data */
            this.importedData = <AOA>(
              XLSX.utils.sheet_to_json(ws, { raw: false })
            );
            if (this.importedData.length === 0) {
              Swal.fire({
                icon: 'error',
                title: 'Invalid File detected',
                text: 'Empty File',
                footer: 'Please check your file and try again',
                confirmButtonColor: '#3085d6',
              });
              return;
            }

            const tabIndex =
              wb.SheetNames.length === 1
                ? fileCnt === 1
                  ? this.selectedTabIndex
                  : this.tabList.findIndex((tabName) => tabName === fileName)
                : this.tabList.findIndex((tabName) => tabName === wsname);
            const validData: any[] = this.validateStep(
              this.tabIds[tabIndex],
              this.importedData
            );
            this.importedData = validData[1];
            if (validData[0]) {
              this.uploadTabData(this.tabList[tabIndex], this.importedData);
            }
          }
        };
      }
    }
  }

  uploadTabData(tab: string, data: any) {
    if (tab === 'Event Info') {
      const eventType = data[0].eventType;
      this.event.EventInfo = {
        eventName: data[0].eventName || '',
        eventDisplayName: data[0].eventDisplayName || '',
        eventYear: data[0].EventShowYear || '',
        description: data[0].EventInfoTxt || '',
        startDate: data[0].StartDate
          ? this.formatDate(new Date(data[0].StartDate))
          : '',
        startTime: data[0].StartTime || '',
        endDate: data[0].EndDate
          ? this.formatDate(new Date(data[0].EndDate))
          : '',
        endTime: data[0].EndTime || '',
        eventSecurityLevel: data[0].ShowSecurityType.trim().toLowerCase(),
        eventAccessCode: data[0].eventAccessCode || '',
        categories: data[0]?.eventCategory || '',
        paymentWay: data[0]?.PaymentWay,

        ...(data[0]?.PaymentWay === 'braintree' && {
          merchantId: data[0]?.GatewayMerchantId ?? '',
        }),
        ...(data[0]?.PaymentWay === 'braintree' && {
          publicKey: data[0]?.publicKey ?? '',
        }),
        ...(data[0]?.PaymentWay === 'braintree' && {
          privateKey: data[0]?.privateKey ?? '',
        }),
        ...(data[0]?.PaymentWay === 'authorizenet' && {
          apiLoginId: data[0]?.apiLoginId ?? '',
        }),
        ...(data[0]?.PaymentWay === 'authorizenet' && {
          transactionKey: data[0]?.transactionKey ?? '',
        }),

        homePageOnShowInfo: data[0]?.homePageOnShowInfo,
        blockedCountries: isJSON(data[0].blockedCountries!)
          ? JSON.parse(data[0].blockedCountries!)
          : [],
        address1: data[0]?.venueAddress?.split(',')[0] || '',
        address2: data[0]?.venueAddress2 || '',
        address3: data[0]?.venueAddress3 || '',
        city: data[0].venueCity || '',
        county: data[0].venueCounty || '',
        state: data[0].venueState || '',
        countryCode: data[0].venueCountryCode || '',
        country: data[0].venueCountry || '',
        zip: data[0].venuePostalCode
          ? String(data[0].venuePostalCode).trim()
          : '',
        phone: data[0].mainPhoneNumber || '',
        Seminar: isJSON(eventType)
          ? JSON.parse(eventType).includes('SEMINAR')
          : eventType === 'SEMINAR',
        Social: isJSON(eventType)
          ? JSON.parse(eventType).includes('SOCIAL')
          : eventType === 'SOCIAL',
        Trade: isJSON(eventType)
          ? JSON.parse(eventType).includes('TRD')
          : eventType === 'TRD',
        Workshop: isJSON(eventType)
          ? JSON.parse(eventType).includes('WORKSHOP')
          : eventType === 'WORKSHOP',
        noRequiredQualifications:
          data[0].ReqdNoqualFlag?.trim().toLowerCase() === 'true',
        TaxIDNumber: data[0].ReqdQualIdFlag?.trim().toLowerCase() === 'true',
        PayStub: data[0].ReqdQualPayFlag?.trim().toLowerCase() === 'true',
        BusLi: data[0].ReqdQualLicFlag?.trim().toLowerCase() === 'true',
        PhotoID: data[0].ReqdPhotoFlag?.trim().toLowerCase() === 'true',
        eventFormat: data[0].eventFormat || '',
        reqProjMgrName: data[0].RPMName || '',
        preferredMethod: data[0].preferredMethod! || '',
        salesExecName: data[0].SalesExecName || '',
        showCode: data[0].showCode || '',
        tradeShowName: data[0].tradeShowName || '',
        custServicePhoneNumber: data[0].CustServicePhoneNbr || '',
        custServiceEmailAddress: data[0].CustServiceEmail || '',

        hideShowInfo: data[0].hideShowInfo?.trim().toLowerCase() === 'true',
        hideShowInfoButton:
          data[0].hideShowInfoButton?.trim().toLowerCase() === 'true',
        hideShowInfoFollowUs:
          data[0].hideShowInfoFollowUs?.trim().toLowerCase() === 'true',
        hideShowInfoTitle:
          data[0].hideShowInfoTitle?.trim().toLowerCase() === 'true',
      };
      this.patchEventInfoForm();
    } else if (tab === 'Reg Types') {
      this.event.regtypesList = [];
      this.event.eventCosts = [];
      data.forEach((row) => {
        if (
          !this.event.regtypesList.some(
            (el) =>
              el.code === row.EventRegType && el.description === row.Description
          )
        ) {
          this.event.regtypesList.push({
            code: row.EventRegType,
            description: row.Description,
            barcodecolor: row.Barcodecolor || '#000000',
            backgroundcolor: row.BadgeExplosion || '',
            backgroundtextcolor: row.BadgeTextColor || '',
          });
          if (
            row.EarlyBirdStartDate &&
            row.EarlyBirdEndDate &&
            row.EarlyBirdRate &&
            row.AdvanceStartDate &&
            row.AdvanceEndDate &&
            row.AdvanceRate &&
            row.OnsiteStartDate &&
            row.OnsiteEndDate &&
            row.OnsiteRate
          ) {
            this.event.eventCosts.push({
              isChecked: false,
              refCodes: [row.EventRegType + ' - ' + row.Description],
              rates: {
                duringEventBirdStartDate: this.formatDate(
                  new Date(row.EarlyBirdStartDate)
                ),
                duringEventBirdEndDate: this.formatDate(
                  new Date(row.EarlyBirdEndDate)
                ),
                duringEventBirdRate: row.EarlyBirdRate.toString().replaceAll(
                  '$',
                  ''
                ),
                duringEventBirdStartDate2: this.formatDate(
                  new Date(row.AdvanceStartDate)
                ),
                duringEventBirdEndDate2: this.formatDate(
                  new Date(row.AdvanceEndDate)
                ),
                duringEventBirdRate2: row.AdvanceRate.toString().replaceAll(
                  '$',
                  ''
                ),
                duringEventBirdStartDate3: this.formatDate(
                  new Date(row.OnsiteStartDate)
                ),
                duringEventBirdEndDate3: this.formatDate(
                  new Date(row.OnsiteEndDate)
                ),
                duringEventBirdRate3: row.OnsiteRate.toString().replaceAll(
                  '$',
                  ''
                ),
              },
              customPackage: {
                name: row.custom_pckg_name || '',
                description: row.custom_pckg_description || '',
                cost: row.custom_pckg_cost || 0,
              },
              nonMember: ['Member', 'Non member', 'NONE'].includes(
                row.nonMember
              )
                ? row.nonMember
                : 'None',
            });
          }
        }
      });

      if (this.event.eventCosts.length > 1) {
        for (let i = 0; i < this.event.eventCosts.length - 1; i++) {
          if (!_.isEmpty(this.event.eventCosts[i].customPackage.name)) {
            let postfix = 1;
            for (let j = i + 1; j < this.event.eventCosts.length; j++) {
              if (
                this.event.eventCosts[i].customPackage.name ===
                this.event.eventCosts[j].customPackage.name
              ) {
                this.event.eventCosts[j].customPackage.name =
                  this.event.eventCosts[j].customPackage.name + '_' + postfix;
                postfix++;
              }
            }
          }
        }
      }
    } else if (tab === 'Packages') {
      this.event.eventCosts = [];

      data.forEach((row) => {
        this.event.eventCosts.push({
          isChecked: false,
          refCodes: JSON.parse(row.refCodes),
          rates: {
            duringEventBirdStartDate: this.formatDate(
              new Date(row.duringEventBirdStartDate)
            ),
            duringEventBirdEndDate: this.formatDate(
              new Date(row.duringEventBirdEndDate)
            ),
            duringEventBirdRate: row.duringEventBirdRate
              .toString()
              .replaceAll('$', ''),
            duringEventBirdStartDate2: this.formatDate(
              new Date(row.duringEventBirdStartDate2)
            ),
            duringEventBirdEndDate2: this.formatDate(
              new Date(row.duringEventBirdEndDate2)
            ),
            duringEventBirdRate2: row.duringEventBirdRate2
              .toString()
              .replaceAll('$', ''),
            duringEventBirdStartDate3: this.formatDate(
              new Date(row.duringEventBirdStartDate3)
            ),
            duringEventBirdEndDate3: this.formatDate(
              new Date(row.duringEventBirdEndDate3)
            ),
            duringEventBirdRate3: row.duringEventBirdRate3
              .toString()
              .replaceAll('$', ''),
          },
          customPackage: {
            name: row.name,
            description: row.description,
            cost: row.cost,
          },
          nonMember: ['Member', 'Non member', 'NONE'].includes(row.nonMember)
            ? row.nonMember
            : 'None',
          zeroCost: row.zeroCost!.trim().toLowerCase() === 'true',
        });
      });

      if (this.event.eventCosts.length > 1) {
        for (let i = 0; i < this.event.eventCosts.length - 1; i++) {
          let postfix = 1;
          for (let j = i + 1; j < this.event.eventCosts.length; j++) {
            if (
              this.event.eventCosts[i].customPackage.name ===
              this.event.eventCosts[j].customPackage.name
            ) {
              this.event.eventCosts[j].customPackage.name =
                this.event.eventCosts[j].customPackage.name + '_' + postfix;
              postfix++;
            }
          }
        }
      }
    } else if (tab === 'Discounts') {
      this.event.discountList = [];
      data.forEach((row) => {
        this.event.discountList.push({
          useBre: row.useBre
            ? row.useBre.trim().toLowerCase() === 'true'
            : false,
          discountType: row.DiscountCode,
          discountName: row.discountname,
          amount: row.Discount,
          discountGroup: row.DiscountGroupNbr,
          discountDescription: row.Description,
          appliedRegtypes: this.loadDicountRegtype(
            row['Reg Type'],
            row.Description
          ),
          appliedCountries: row?.appliedCountries
            ? JSON.parse(row?.appliedCountries)
            : [{ itemId: 'US', itemText: 'United States' }],

          discountStatus: 'active',
          discountcd: row.discode || '',
          promoCode: row.promoCode || '',
          createdDate: new Date(),
          startDate: this.formatDate(new Date(row['Start Date and Time'])),
          endDate: this.formatDate(new Date(row['End Date and Time'])),
          priority: row.Priority,
          allotment: Number(row.allotment) || null,
          glCode: row.GLCode || generateUniqueGLCode(),
        });
      });
    } else if (tab === 'Qualifications') {
      this.event.addedQualifications = [];
      data.forEach((row) => {
        let qualification = {
          regType: row.regType,
          qualification: row.qualification,
          sampleQualificationFileData: row?.sampleQualificationFileData || '',
          formRequirement: row?.formRequirement || '',
          editFlag: null,
          qualName: row?.qualName || row.qualification + ' qualification',
        };

        if (
          this.event.addedQualifications.findIndex(
            (e) =>
              e.regType == row.regType && row.qualification == e.qualification
          ) == -1
        ) {
          this.event.addedQualifications.push({ ...qualification });
        }
      });
    } else if (tab === 'Sessions') {
      this.event.sessionList = [];
      data.forEach((row, index) => {
        const publicOrPrivate =
          row.PublicPrivate === 'Public'
            ? 'N'
            : row.PublicPrivate === 'Private'
            ? 'Y'
            : '';
        const newSession = {
          id: index,
          name: row.SessionDescription,
          useBre: row.useBre
            ? row.useBre.trim().toLowerCase() === 'true'
            : false,
          sessionType: row.sessionType || '',
          privateSession: publicOrPrivate,
          sessionAttendeeCapacity: row.AllotmentRoomCapacity || '',
          topics: row.Topic || '',
          optionType: row.optionType || '',
          speaker: row.SpeakerName || '',
          synopsis: row.SpeakerBio || '',
          period: [
            {
              cost: isNaN(row.SessionRate) ? '' : row.SessionRate || '0',
              startDate: this.formatDate(
                new Date(row['StartDate(MM/DD/YYYY)'])
              ),
              startTime: row['StartTime(24H)'],
              endDate: this.formatDate(
                new Date(new Date(row['EndDate(MM/DD/YYYY)']))
              ),
              endTime: row['EndTime(24H)'],
            },
          ],
          glCode: row['GLCode'] || generateUniqueGLCode(),
          hall: row['hall'] || '',
          room: row['room'] || '',
          seats: Number(row['seats']) || 0,
          showQuantity: row['showQuantity'] === 'true' || false,
        };
        this.event.sessionList.push(newSession);
      });
    } else if (tab === 'Demographic Questions') {
      this.event.questionsList = [];
      data.forEach((row) => {
        let newQuestionsGoals = {
          checked: row.checked
            ? row.checked.trim().toLowerCase() === 'true'
            : false,
          pollingType: row.PollingType,
          category: isJSON(row.FocusType)
            ? JSON.parse(row.FocusType)
            : [row.FocusType],
          responseLayout: row.ResponseFieldType,
          question: row.Description,
          questionName: row.demQuestion,
          dedDescription: row.dedDescription,
          dedValue: row.dedValue,
          additionalInfoName: row.additionalInfoName,
          additionalInfoValue: row.additionalInfoValue,
        };
        this.event.questionsList.push({ ...newQuestionsGoals });
      });
      this.event.questionsList = Object.values(
        this.event.questionsList.reduce(
          (
            r,
            {
              checked,
              pollingType,
              category,
              question,
              questionName,
              responseLayout,
              ...rest
            }
          ) => {
            const key = `${pollingType}-${category}-${question}`;
            r[key] = r[key] || {
              checked,
              pollingType,
              category,
              question,
              questionName,
              responseLayout,
              demDetails: [],
            };
            if (
              rest.dedDescription &&
              responseLayout?.toLowerCase() != 'freetext'
            ) {
              r[key]['demDetails'].push(rest);
            }
            return r;
          },
          {}
        )
      );
      this.event.questionsList = this.event.questionsList
        .map((question: any) => {
          if (Array.isArray(question.category) && question.category?.length) {
            return {
              ...question,
              category: [...question.category].filter((regDesc: string) => {
                return this.event.regtypesList?.some(
                  (regtype: RegtypeData) =>
                    regtype?.description?.toLowerCase() ===
                    regDesc?.toLowerCase()
                );
              }),
            };
          } else {
            return question;
          }
        })
        .filter((question: any) => question.category?.length > 0);
    } else if (tab === 'Exhibitor Allotment') {
      this.event.exhibitorAllotmentList = data;
    } else if (tab === 'Membership') {
      this.event.membershipInfoList = data;
    } else if (tab === 'Business Rules') {
      this.event.businessRules = [];
      data.forEach((row) => {
        const businessRule = {
          brID: row.brID,
          businessRule: {
            ...row,
            query: JSON.parse(row.query),
          },
        };
        this.event.businessRules.push(businessRule);
      });
    } else if (tab === 'Page Customizations') {
      this.event.pageList = [];
      data.forEach((row) => {
        this.event.pageList.push({
          workflow: row.Workflow,
          pageList: JSON.parse(row.PageList),
        });
      });
    }
    this.psmImported = true;
  }

  validateStep(tabId, data) {
    let hasMissingFields = false;
    let missingFields = '';
    let invalidDiscount = false;
    let invalidQuestionGoal = false;
    let invalidRegType = false;
    let msg = '';

    let validData = [];

    let newQuestionGoals = [];
    for (let i = 0; i < data.length; i++) {
      this.trimData(data[i]);
      let missingFieldList = this.getMissingFields(tabId, data[i]);
      if (missingFieldList.length > 0) {
        hasMissingFields = true;
        missingFields = missingFieldList.join(', ');
        continue;
      }
      if (
        tabId === 'event_costs' &&
        !/[a-zA-Z]{2,3}$/.test(data[i].EventRegType)
      ) {
        invalidRegType = true;
        continue;
      }
      if (tabId === 'discounts' && this.checkIfNotExists(data[i])) {
        invalidDiscount = true;
        continue;
      }
      if (tabId === 'questions_goals') {
        let isValid = true;
        if (this.checkIfValidLengths(data[i])) {
          isValid = false;
          msg =
            'question description contains more than 500 characters at row ';
        } else if (!this.isValidResponseValues(data[i])) {
          isValid = false;
          msg = "question doesn't have response name at row ";
        } else if (
          this.isDuplicateQuestionResponses(data[i], newQuestionGoals)
        ) {
          isValid = false;
          msg = 'question has duplicate response values at row ';
        } else {
          newQuestionGoals.push({ ...data[i] });
        }
        if (!isValid) {
          invalidQuestionGoal = true;
          continue;
        }
      }

      validData.push(data[i]);
    }

    if (invalidRegType) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File detected',
        text: 'Reg code should be 2~3 alpha characters',
        footer: 'Please check your file and try again',
        confirmButtonColor: '#3085d6',
      });
    }
    if (validData.length > 0) {
      return [true, validData];
    } else if (hasMissingFields) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File detected',
        text: missingFields + ' missing at row ',
        footer: 'Please check your file and try again',
        confirmButtonColor: '#3085d6',
      });
    } else if (invalidDiscount) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File detected',
        text: 'Invalid discount type at row ',
        footer: 'Please check your file and try again',
        confirmButtonColor: '#3085d6',
      });
    } else if (invalidQuestionGoal) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File detected',
        text: msg,
        footer: 'Please check your file and try again',
        confirmButtonColor: '#3085d6',
      });
    }

    return [false, []];
  }

  isValidResponseValues(data) {
    if (data.ResponseFieldType?.toLowerCase() == 'freetext') {
      return true;
    } else {
      return !!data.dedDescription?.toString();
    }
  }

  checkIfValidLengths(data: any) {
    if (data?.Description?.length > 500) {
      return true;
    }
    return false;
  }

  checkIfNotExists(data: any) {
    let check = this.sessionService.discountCodes.filter(
      (e) => e.discountDescription == data.Description
    );
    if (check.length === 1) {
      return false;
    }
    return true;
  }

  getMissingFields(tabId, row) {
    let missingFields = [];
    if (this.mandatoryFields[tabId]) {
      let isValid = true;
      this.mandatoryFields[tabId].forEach((field) => {
        isValid = !this.isEmpty(row[field]) && isValid;
        if (this.isEmpty(row[field])) {
          missingFields.push(field);
        }
      });
    }
    return missingFields;
  }

  isEmpty(str) {
    str = str == null ? '' : str.toString().trim();
    return str === '' ? true : false;
  }

  trimData(data) {
    if (data) {
      Object.keys(data).forEach((prop) => {
        if (data[prop]) {
          data[prop] = data[prop].toString().trim();
        }
      });
    }
  }

  isDuplicateQuestionResponses(questData, newQuestionGoals) {
    return newQuestionGoals.some((question) =>
      this.questionResponseUniqProps.every(
        (prop) => question[prop] == questData[prop]
      )
    );
  }

  loadDicountRegtype(regtype: any, description: string) {
    let regtypeArray: string[] = regtype ? regtype.split(',') : [];
    return regtypeArray
      .map((regCode: string) => {
        return this.event.regtypesList.find(
          (regtype: RegtypeData) =>
            regtype.code.trim().toLowerCase() === regCode.trim().toLowerCase()
        );
      })
      .filter((regtype: RegtypeData) => regtype)
      .map((regtype: RegtypeData) => {
        return regtype.code + ' - ' + regtype.description;
      });
  }

  public completeEvent() {
    if (this.checkIfUnpublished()) {
      this.toastService.show('Please update Business rules to complete event', {
        delay: 6000,
        classname: 'bg-warning text-dark',
        headertext: 'Warning',
        autohide: true,
      });
      return;
    }
    if (!this.hasChainingOrThreading()) {
      this.toastService.show(
        'Business rules should have atleast one chaining or threading question',
        {
          delay: 6000,
          classname: 'bg-warning text-dark',
          headertext: 'Warning',
          autohide: true,
        }
      );
      return;
    }

    const exhibitorInfo: any[] = this.event.exhibitorAllotmentList?.map(
      (exhibitor: any) => ({
        ...exhibitor,
        Membership_Status: Number(exhibitor.Membership_Status) || 0,
        Org_Id: Number(exhibitor.Org_Id) || null,
        Contract_num: Number(exhibitor.Contract_num) || null,
        Booth_Number: Number(exhibitor.Booth_Number) || null,
        Booth_Square_Footage: Number(exhibitor.Booth_Square_Footage) || null,
        Allotment: Number(exhibitor.Allotment) || null,
        Postal_Code: Number(exhibitor.Postal_Code) || null,
        Phone_Number: Number(exhibitor.Phone_Number) || null,
        Blocklisting: Number(exhibitor.Blocklisting) || null,
      })
    );
    const address = `${this.event.EventInfo?.address1}
      ${
        this.event.EventInfo?.address2
          ? ', ' + this.event.EventInfo.address2
          : ''
      }
      ${
        this.event.EventInfo?.address3
          ? ', ' + this.event.EventInfo.address3
          : ''
      }`;
    const discounts: any[] = this.event.discountList?.map((discount: any) => {
      let newDiscount: any = {
        ...discount,
        amount: Number(discount?.amount) || 0,
        discountType: Number(discount?.discountType) || null,
        priority: Number(discount?.priority) || 1,
        allotment: Number(discount.allotment) || null,
      };
      return newDiscount;
    });
    const customPageList: any[] =
      this.event.pageList?.map((workflowData: WorkflowData) => ({
        ...workflowData,
        pageList:
          workflowData?.pageList?.map((pageData: PageData) => ({
            ...pageData,
            sectionsList:
              pageData?.sectionsList?.map((section: SectionData) => ({
                ...section,
                fieldsList:
                  section?.fieldsList?.map((field: FieldData | any) => ({
                    ...field,
                    dynamic: !(field?.static ?? false),
                  })) ?? [],
              })) ?? [],
          })) ?? [],
      })) ?? [];

    let myNewEvent: any;
    if (this.pageType === 'create') {
      myNewEvent = {
        noSessions: this.event.noSessions,
        noDiscounts: this.event.noDiscounts,
        noQualifications: this.event.noQualifications,
        pageBuilderLaunched: this.event.pageBuilderLaunched,
        psmImported: this.psmImported,
        attendeeUid: localStorage.getItem('attendeeUid'),
        builderId: this.builderIOID,
        eventLogo: this.event.EventInfo.eventLogo,
        organizerId: this.organizerIOID,
        exhibitorId: this.exhibitorIOID,
        commanderId: this.commanderIOID,
        eventPortalId: this.eventPortalIOID,
        builderSelection: this.builderSelection,
        exhibitorSelection: this.exhibitorSelection,
        organizerSelection: this.organizerSelection,
        commanderSelection: this.commanderSelection,
        eventPortalSelection: this.eventPortalSelection,
        builderURL:
          environment.PAPERBITS_URL +
          '/' +
          this.addUserid +
          '/' +
          this.builderIOID +
          this.builderSelection,
        exhibitorURL:
          environment.PAPERBITS_URL +
          '/' +
          this.addUserid +
          '/' +
          this.exhibitorIOID +
          this.exhibitorSelection,
        eventPortalURL:
          environment.PAPERBITS_URL +
          '/' +
          this.addUserid +
          '/' +
          this.eventPortalIOID +
          this.eventPortalSelection,
        regWorkflowUrls: [],
        speakers: this.dataService.getSpeakerList() || [],
        businessRules: [], //this.event.businessRules, //this.businessRulesComponent.getBusinessRule(),
        exhibitorInfo: exhibitorInfo,
        membershipInfo: this.event.membershipInfoList,
        addUserid: this.localStorageService.get('username'),
        eventInfo: {
          name: this.event.EventInfo.eventYear
            ? `${this.event.EventInfo.eventName} ${this.event.EventInfo.eventYear}`
            : this.event.EventInfo.eventName,
          eventDisplayName: this.event.EventInfo.eventDisplayName,
          description: this.event.EventInfo.description,
          reqProjMgrName: this.event.EventInfo.reqProjMgrName,
          salesExecName: this.event.EventInfo.salesExecName,
          showCode: this.event.EventInfo.showCode,
          tradeShowName: this.event.EventInfo.tradeShowName,
          custServicePhoneNumber: this.event.EventInfo.custServicePhoneNumber,
          custServiceEmailAddress: this.event.EventInfo.custServiceEmailAddress,
          eventSecurityLevel: this.event.EventInfo.eventSecurityLevel,
          eventAccessCode: this.event.EventInfo.eventAccessCode
            ? btoa(this.event.EventInfo.eventAccessCode)
            : '',
          eventFormat: this.event.EventInfo.eventFormat,
          categories: this.event.EventInfo.categories,
          paymentWay: this.event.EventInfo.paymentWay,

          ...(this.event.EventInfo.merchantId && {
            merchantId: this.event.EventInfo.merchantId,
          }),
          ...(this.event.EventInfo.publicKey && {
            publicKey: this.event.EventInfo.publicKey,
          }),
          ...(this.event.EventInfo.privateKey && {
            privateKey: this.event.EventInfo.privateKey,
          }),
          ...(this.event.EventInfo.apiLoginId && {
            apiLoginId: this.event.EventInfo.apiLoginId,
          }),
          ...(this.event.EventInfo.transactionKey && {
            transactionKey: this.event.EventInfo.transactionKey,
          }),

          homePageOnShowInfo: this.event.EventInfo.homePageOnShowInfo,
          blockedCountries: this.event.EventInfo.blockedCountries,
          discounts: discounts,
          startDate: this.event.EventInfo.startDate,
          startTime: this.event.EventInfo.startTime,
          endDate: this.event.EventInfo.endDate,
          endTime: this.event.EventInfo.endTime,
          venueAddress: address,
          venueAddress1: this.event.EventInfo.address1,
          venueAddress2: this.event.EventInfo.address2,
          venueAddress3: this.event.EventInfo.address3,
          venueCity: this.event.EventInfo.city,
          venueCounty: this.event.EventInfo.county,
          venueStateProvinceRegion: this.event.EventInfo.state,
          venueCountrySpecificCode: this.event.EventInfo.countryCode,
          venueCountry: this.event.EventInfo.country,
          venuePostalCode: this.event.EventInfo.zip,
          mainPhoneNumber: this.event.EventInfo.phone,
          associationPhoneNumb: this.event.EventInfo.phone,
          typeOfEvent: {
            seminar: this.event.EventInfo.Seminar,
            social: this.event.EventInfo.Social,
            trade: this.event.EventInfo.Trade,
            workshop: this.event.EventInfo.Workshop,
          },
          hideShowInfo: this.event.EventInfo.hideShowInfo,
          hideShowInfoTitle: this.event.EventInfo.hideShowInfoTitle,
          hideShowInfoFollowUs: this.event.EventInfo.hideShowInfoFollowUs,
          hideShowInfoButton: this.event.EventInfo.hideShowInfoButton,
        },
        regTypes: this.event.regtypesList,
        eventCosts: this.event.eventCosts,
        qualifications: this.event.addedQualifications.map((x) => {
          delete x.sampleQualificationFileDataData;
          return x;
        }),
        sessions: this.event.sessionList.map((e) => {
          delete e.isValid;
          return e;
        }),
        eventFloorPlan: {
          floorPlanImageUrl: this.floorPlanImageUrl
            ? this.floorPlanImageUrl
            : null,
        },
        questions: this.event.questionsList.map((q: any) => ({
          ...q,
          category: Array.isArray(q.category) ? q.category : [q.category],
        })),
        customizations: [],
        goals: [],
        builderPageInfoList: [],
        eBlastList: [],
        builderTemplates: this.builderTemplate,
        pageList: customPageList,
        emailBuilder: this.event.emailBuilder,
        badgeDesigner: this.event.badgeDesigner,
      };
    } else if (this.pageType === 'edit') {
      myNewEvent = {
        noSessions: this.event.noSessions,
        noDiscounts: this.event.noDiscounts,
        noQualifications: this.event.noQualifications,
        pageBuilderLaunched: this.event.pageBuilderLaunched,
        psmImported: this.psmImported,
        attendeeUid: localStorage.getItem('attendeeUid'),
        builderId: this.builderIOID,
        eventLogo: this.event.EventInfo.eventLogo,
        exhibitorId: this.exhibitorIOID,
        organizerId: this.organizerIOID,
        commanderId: this.commanderIOID,
        eventPortalId: this.eventPortalIOID,
        builderSelection: this.builderSelection,
        exhibitorSelection: this.exhibitorSelection,
        organizerSelection: this.organizerSelection,
        commanderSelection: this.commanderSelection,
        eventPortalSelection: this.eventPortalSelection,
        evtUid: this.evtUid,
        regWorkflowUrls: [],
        speakers: this.dataService.getSpeakerList() || [],
        businessRules: [], //this.event.businessRules,
        exhibitorInfo: exhibitorInfo,
        membershipInfo: this.event.membershipInfoList,
        addUserid: this.addUserid || this.localStorageService.get('username'),
        builderURL:
          environment.PAPERBITS_URL +
          '/' +
          this.addUserid +
          '/' +
          this.builderIOID +
          this.builderSelection,
        exhibitorURL:
          environment.PAPERBITS_URL +
          '/' +
          this.addUserid +
          '/' +
          this.exhibitorIOID +
          this.exhibitorSelection,
        eventPortalURL:
          environment.PAPERBITS_URL +
          '/' +
          this.addUserid +
          '/' +
          this.eventPortalIOID +
          this.eventPortalSelection,
        eventInfo: {
          name: this.event.EventInfo.eventYear
            ? `${this.event.EventInfo.eventName} ${this.event.EventInfo.eventYear}`
            : this.event.EventInfo.eventName,
          eventDisplayName: this.event.EventInfo.eventDisplayName,
          description: this.event.EventInfo.description,
          reqProjMgrName: this.event.EventInfo.reqProjMgrName,
          salesExecName: this.event.EventInfo.salesExecName,
          showCode: this.event.EventInfo.showCode,
          tradeShowName: this.event.EventInfo.tradeShowName,
          custServicePhoneNumber: this.event.EventInfo.custServicePhoneNumber,
          custServiceEmailAddress: this.event.EventInfo.custServiceEmailAddress,
          eventSecurityLevel: this.event.EventInfo.eventSecurityLevel,
          eventAccessCode: this.event.EventInfo.eventAccessCode
            ? btoa(this.event.EventInfo.eventAccessCode)
            : '',
          eventFormat: this.event.EventInfo.eventFormat,
          categories: this.event.EventInfo.categories,
          paymentWay: this.event.EventInfo.paymentWay,

          ...(this.event.EventInfo.merchantId && {
            merchantId: this.event.EventInfo.merchantId,
          }),
          ...(this.event.EventInfo.publicKey && {
            publicKey: this.event.EventInfo.publicKey,
          }),
          ...(this.event.EventInfo.privateKey && {
            privateKey: this.event.EventInfo.privateKey,
          }),
          ...(this.event.EventInfo.apiLoginId && {
            apiLoginId: this.event.EventInfo.apiLoginId,
          }),
          ...(this.event.EventInfo.transactionKey && {
            transactionKey: this.event.EventInfo.transactionKey,
          }),

          homePageOnShowInfo: this.event.EventInfo.homePageOnShowInfo,
          blockedCountries: this.event.EventInfo.blockedCountries,
          discounts: discounts,
          startDate: this.event.EventInfo.startDate,
          startTime: this.event.EventInfo.startTime,
          endDate: this.event.EventInfo.endDate,
          endTime: this.event.EventInfo.endTime,
          venueAddress: address,
          venueAddress1: this.event.EventInfo.address1,
          venueAddress2: this.event.EventInfo.address2,
          venueAddress3: this.event.EventInfo.address3,
          venueCity: this.event.EventInfo.city,
          venueCounty: this.event.EventInfo.county,
          venueStateProvinceRegion: this.event.EventInfo.state,
          venueCountrySpecificCode: this.event.EventInfo.countryCode,
          venueCountry: this.event.EventInfo.country,
          venuePostalCode: this.event.EventInfo.zip,
          mainPhoneNumber: this.event.EventInfo.phone,
          associationPhoneNumb: this.event.EventInfo.phone,
          typeOfEvent: {
            seminar: this.event.EventInfo.Seminar,
            social: this.event.EventInfo.Social,
            trade: this.event.EventInfo.Trade,
            workshop: this.event.EventInfo.Workshop,
          },

          hideShowInfo: this.event.EventInfo.hideShowInfo,
          hideShowInfoTitle: this.event.EventInfo.hideShowInfoTitle,
          hideShowInfoFollowUs: this.event.EventInfo.hideShowInfoFollowUs,
          hideShowInfoButton: this.event.EventInfo.hideShowInfoButton,
        },
        regTypes: this.event.regtypesList,
        eventCosts: this.event.eventCosts.map((eventCost: EventCostData) => {
          if (Array.isArray(eventCost.refCodes)) {
            return eventCost;
          } else {
            return {
              ...eventCost,
              refCodes: [eventCost.refCodes],
            };
          }
        }),
        qualifications: this.event.addedQualifications.map((x) => {
          delete x.sampleQualificationFileDataData;
          return x;
        }),
        sessions: this.event.sessionList.map((e) => {
          delete e.speakerDetail;
          delete e.isValid;
          return e;
        }),
        eventFloorPlan: {
          floorPlanImageUrl: this.floorPlanImageUrl
            ? this.floorPlanImageUrl
            : null,
        },
        questions: this.event.questionsList.map((q: any) => ({
          ...q,
          category: Array.isArray(q.category) ? q.category : [q.category],
        })),
        customizations: [],
        goals: [],
        builderPageInfoList: [],
        eBlastList: [],
        builderTemplates: this.builderTemplate,
        pageList: customPageList,
        emailBuilder: this.event.emailBuilder,
        badgeDesigner: this.event.badgeDesigner,
      };
    }

    const EVENT_API_URL: string =
      this.pageType === 'create' ? CREATE_EVENT_API : EDIT_EVENT_API;

    this.loading = true;
    this.httpClient.post<any>(EVENT_API_URL, myNewEvent, { headers }).subscribe(
      async (data) => {
        this.loading = false;
        if (data.statusMessage === 'Failure') {
          this.errorCode = data['response'].Reason;
          this.toastService.show(
            data['response'].Reason || 'Failed to complete the event',
            {
              delay: 6000,
              classname: 'bg-danger text-light',
              headertext:
                this.pageType === 'create' ? 'Create' : 'Edit' + ' Event Error',
              autohide: true,
            }
          );
        } else {
          // csi/event/services/exhibitorV2/multiRegisterExhibitors?guid=881d3cfb-d34b-4d86-901f-9c4c070ac3d3
          /** Call the auto-generate exhibitors API */
          const autoGenerateExhibitorRes: any = await this.httpClient
            .get(
              API_URL2 +
                '/csi/event/services/exhibitorV2/multiRegisterExhibitors?guid=' +
                this.exhibitorIOID,
              { headers }
            )
            .toPromise();
          console.error('autoGenerateExhibitorRes: ', autoGenerateExhibitorRes);

          if (this.event.businessRules && this.event.businessRules.length > 0) {
            const brs = this.event.businessRules.map((br) => {
              br.businessRule = JSON.stringify(
                this.modifyReverseNextinRule(br.businessRule)
              );
              return br;
            });
            this.errorCode = null;
            const body = {
              evtUid: data['response'].evtuid,
              businessRules: brs,
            };
            this.httpClient
              .post(
                API_URL2 + '/csi/event/services/eventSetupV2/addBusinessRules',
                body,
                { headers }
              )
              .subscribe((x: any) => {
                if (x && x.statusCode == 200) {
                  const payload = {
                    emailAddr: localStorage.getItem('emailAddr'),
                    password: uuid().replaceAll('-', '').toUpperCase(),
                    guid: this.organizerIOID,
                  };

                  this.router.navigate(['']);
                } else {
                  this.toastService.show(
                    data['response'].Reason || 'Failed to add business rules',
                    {
                      delay: 6000,
                      classname: 'bg-danger text-light',
                      headertext:
                        this.pageType === 'create'
                          ? 'Create'
                          : 'Edit' + ' Event Error',
                      autohide: true,
                    }
                  );
                }
              });
          } else {
            this.router.navigate(['']);
          }
          this.router.navigate(['']);
        }
      },
      (error) => {
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
  checkIfUnpublished() {
    return !!this.event.businessRules.find(
      (br) => !br.businessRule.isPublished
    );
  }

  hasChainingOrThreading() {
    return this.event.businessRules.some(
      (rule) =>
        rule.businessRule.selectedAction == ACTIONS.THREADING_DEMO_QUESTIONS ||
        rule.businessRule.selectedAction == ACTIONS.CHAIN_DEMO_QUESTIONS
    );
  }

  duplicateEvent() {
    if (this.checkIfUnpublished()) {
      this.toastService.show('Please update Business rules to complete event', {
        delay: 6000,
        classname: 'bg-warning text-dark',
        headertext: 'Warning',
        autohide: true,
      });
      return;
    }

    if (!this.hasChainingOrThreading()) {
      this.toastService.show(
        'Business rules should have atleast one chaining or threading question',
        {
          delay: 6000,
          classname: 'bg-warning text-dark',
          headertext: 'Warning',
          autohide: true,
        }
      );
      return;
    }
    //
    const exhibitorInfo: any[] = this.event.exhibitorAllotmentList?.map(
      (exhibitor: any) => ({
        ...exhibitor,
        Membership_Status: Number(exhibitor.Membership_Status) || 0,
        Org_Id: Number(exhibitor.Org_Id) || null,
        Contract_num: Number(exhibitor.Contract_num) || null,
        Booth_Number: Number(exhibitor.Booth_Number) || null,
        Booth_Square_Footage: Number(exhibitor.Booth_Square_Footage) || null,
        Allotment: Number(exhibitor.Allotment) || null,
        Postal_Code: Number(exhibitor.Postal_Code) || null,
        Phone_Number: Number(exhibitor.Phone_Number) || null,
        Blocklisting: Number(exhibitor.Blocklisting) || null,
      })
    );
    const address = `${this.event.EventInfo?.address1}
      ${
        this.event.EventInfo?.address2
          ? ', ' + this.event.EventInfo.address2
          : ''
      }
      ${
        this.event.EventInfo?.address3
          ? ', ' + this.event.EventInfo.address3
          : ''
      }`;
    const discounts: any[] = this.event.discountList?.map((discount: any) => ({
      ...discount,
      amount: Number(discount?.amount) || 0,
      discountType: Number(discount?.discountType) || null,
      priority: Number(discount?.priority) || 1,
    }));
    let myNewEvent: any = {
      noSessions: this.event.noSessions,
      noDiscounts: this.event.noDiscounts,
      noQualifications: this.event.noQualifications,
      pageBuilderLaunched:
        this.builderTemplate?.filter((t: any) => t.IsPageBuilderLaunched)
          ?.length === 5
          ? true
          : false,
      psmImported: this.psmImported,
      attendeeUid: localStorage.getItem('attendeeUid'),
      builderId: this.builderIOID,
      eventLogo: this.event.EventInfo.eventLogo,
      exhibitorId: this.exhibitorIOID,
      organizerId: this.organizerIOID,
      commanderId: this.commanderIOID,
      eventPortalId: this.eventPortalIOID,
      builderSelection: this.builderSelection,
      exhibitorSelection: this.exhibitorSelection,
      organizerSelection: this.organizerSelection,
      commanderSelection: this.commanderSelection,
      eventPortalSelection: this.eventPortalSelection,
      evtUid: this.evtUid,
      regWorkflowUrls: [],
      speakers: this.dataService.getSpeakerList() || [],
      businessRules: [], //this.event.businessRules,
      exhibitorInfo: exhibitorInfo,
      membershipInfo: this.event.membershipInfoList,
      addUserid: this.addUserid || this.localStorageService.get('username'),
      builderURL:
        environment.PAPERBITS_URL +
        '/' +
        this.addUserid +
        '/' +
        this.builderIOID +
        this.builderSelection,
      exhibitorURL:
        environment.PAPERBITS_URL +
        '/' +
        this.addUserid +
        '/' +
        this.exhibitorIOID +
        this.exhibitorSelection,
      eventInfo: {
        name: this.event.EventInfo.eventYear
          ? `${this.event.EventInfo.eventName} ${this.event.EventInfo.eventYear}`
          : this.event.EventInfo.eventName,
        eventDisplayName: this.event.EventInfo.eventDisplayName,
        description: this.event.EventInfo.description,
        reqProjMgrName: this.event.EventInfo.reqProjMgrName,
        salesExecName: this.event.EventInfo.salesExecName,
        showCode: this.event.EventInfo.showCode,
        tradeShowName: this.event.EventInfo.tradeShowName,
        custServicePhoneNumber: this.event.EventInfo.custServicePhoneNumber,
        custServiceEmailAddress: this.event.EventInfo.custServiceEmailAddress,
        eventSecurityLevel: this.event.EventInfo.eventSecurityLevel,
        eventAccessCode: this.event.EventInfo.eventAccessCode
          ? btoa(this.event.EventInfo.eventAccessCode)
          : '',
        eventFormat: this.event.EventInfo.eventFormat,
        categories: this.event.EventInfo.categories,
        paymentWay: this.event.EventInfo.paymentWay,

        ...(this.event.EventInfo.merchantId && {
          merchantId: this.event.EventInfo.merchantId,
        }),
        ...(this.event.EventInfo.publicKey && {
          publicKey: this.event.EventInfo.publicKey,
        }),
        ...(this.event.EventInfo.privateKey && {
          privateKey: this.event.EventInfo.privateKey,
        }),
        ...(this.event.EventInfo.apiLoginId && {
          apiLoginId: this.event.EventInfo.apiLoginId,
        }),
        ...(this.event.EventInfo.transactionKey && {
          transactionKey: this.event.EventInfo.transactionKey,
        }),

        homePageOnShowInfo: this.event.EventInfo.homePageOnShowInfo,
        blockedCountries: this.event.EventInfo.blockedCountries,
        discounts: discounts,
        startDate: this.event.EventInfo.startDate,
        startTime: this.event.EventInfo.startTime,
        endDate: this.event.EventInfo.endDate,
        endTime: this.event.EventInfo.endTime,
        venueAddress: address,
        venueAddress1: this.event.EventInfo.address1,
        venueAddress2: this.event.EventInfo.address2,
        venueAddress3: this.event.EventInfo.address3,
        venueCity: this.event.EventInfo.city,
        venueCounty: this.event.EventInfo.county,
        venueStateProvinceRegion: this.event.EventInfo.state,
        venueCountrySpecificCode: this.event.EventInfo.countryCode,
        venueCountry: this.event.EventInfo.country,
        venuePostalCode: this.event.EventInfo.zip,
        mainPhoneNumber: this.event.EventInfo.phone,
        associationPhoneNumb: this.event.EventInfo.phone,
        typeOfEvent: {
          seminar: this.event.EventInfo.Seminar,
          social: this.event.EventInfo.Social,
          trade: this.event.EventInfo.Trade,
          workshop: this.event.EventInfo.Workshop,
        },
      },
      regTypes: this.event.regtypesList,
      eventCosts: this.event.eventCosts.map((eventCost: EventCostData) => {
        if (Array.isArray(eventCost.refCodes)) {
          return eventCost;
        } else {
          return {
            ...eventCost,
            refCodes: [eventCost.refCodes],
          };
        }
      }),
      qualifications: this.event.addedQualifications.map((x) => {
        delete x.sampleQualificationFileDataData;
        return x;
      }),
      sessions: this.event.sessionList.map((e) => {
        delete e.speakerDetail;
        delete e.isValid;
        return e;
      }),
      eventFloorPlan: {
        floorPlanImageUrl: this.floorPlanImageUrl
          ? this.floorPlanImageUrl
          : null,
      },
      questions: this.event.questionsList.map((q: any) => ({
        ...q,
        category: Array.isArray(q.category) ? q.category : [q.category],
      })),
      customizations: [],
      goals: [],
      builderPageInfoList: [],
      eBlastList: [],
      builderTemplates: this.builderTemplate,
    };
    ///
    const createDuplicateEventModalRef = this.modalService.open(
      DuplicateEventComponent,
      {
        size: 'lg',
        windowClass: 'modal-custom-createDuplicateEvent',
      }
    );
    createDuplicateEventModalRef.componentInstance.evtUid = this.evtUid;
    createDuplicateEventModalRef.componentInstance.events = this.eventNameList;
    createDuplicateEventModalRef.result
      .then((copyOptions: any) => {
        console.error('Will Create duplicate Event: ', copyOptions);
        if (copyOptions) {
          let userName = this.localStorageService.get('username');
          const duplicateEventBody: any = {
            createEvent: myNewEvent,
            createDuplicateEvent: {
              evtUid: Number(this.evtUid),
              projectId,
              clientName: userName,
              ...copyOptions,
            },
          };
          this.loading = true;
          this.httpClient
            .post(EDIT_DUPLICATE_EVENT, duplicateEventBody, { headers })
            .subscribe(
              (res: any) => {
                this.loading = false;
                if (res?.statusMessage === 'Success') {
                  this.toastService.show('The event was cloned successfully', {
                    delay: 6000,
                    classname: 'bg-success text-light',
                    headertext: 'Create Duplicate Event',
                    autohide: true,
                  });
                  if (
                    this.event.businessRules &&
                    this.event.businessRules.length > 0
                  ) {
                    const brs = this.event.businessRules.map((br) => {
                      br.brID = uuid();
                      br.businessRule = JSON.stringify(
                        this.modifyReverseNextinRule(br.businessRule)
                      );
                      return br;
                    });
                    this.errorCode = null;
                    // const body1 = {
                    //   evtUid: this.evtUid,
                    //   businessRules: brs
                    // }
                    // this.httpClient.post(API_URL2 + '/csi/event/services/eventSetupV2/addBusinessRules', body1, { headers }).subscribe((x: any) => {
                    //   if (x && x.statusCode == 200) {
                    //   } else {
                    //   }
                    // });

                    const body = {
                      evtUid: res['response'].EvtUid,
                      businessRules: brs,
                    };
                    this.httpClient
                      .post(
                        API_URL2 +
                          '/csi/event/services/eventSetupV2/addBusinessRules',
                        body,
                        { headers }
                      )
                      .subscribe((x: any) => {
                        if (x && x.statusCode == 200) {
                          this.toastService.show('Your Rule Has Been Cloned', {
                            delay: 6000,
                            classname: 'bg-success text-light',
                            headertext: 'Success',
                            autohide: true,
                          });
                          this.router.navigate(['']);
                        } else {
                          this.toastService.show(
                            'Failed to add business rules',
                            {
                              delay: 6000,
                              classname: 'bg-danger text-light',
                              headertext:
                                this.pageType === 'create'
                                  ? 'Create'
                                  : 'Edit' + ' Event Error',
                              autohide: true,
                            }
                          );
                        }
                      });
                  } else {
                    this.router.navigate(['']);
                  }
                } else {
                  this.toastService.show(
                    res?.response?.Reason ||
                      'Something went wrong, please try again',
                    {
                      delay: 6000,
                      classname: 'bg-danger text-light',
                      headertext: 'Duplicate Event Error',
                      autohide: true,
                    }
                  );
                }
              },
              (err: HttpErrorResponse) => {
                this.loading = false;
                this.toastService.show(
                  err?.message || 'Something went wrong, please try again',
                  {
                    delay: 6000,
                    classname: 'bg-danger text-light',
                    headertext: 'Duplicate Event Error',
                    autohide: true,
                  }
                );
              }
            );
        }
      })
      .catch((err) => console.error(err));
  }
  modifyReverseNextinRule(rule) {
    let modifyRule = rule;
    if (modifyRule.selectedAction == ACTIONS.THREADING_DEMO_QUESTIONS) {
      modifyRule.query.rules = modifyRule.query.rules.map((r, i) => {
        r.questionIndex = i;
        let nxt = [];
        if (r.next && r.next.length > 0) {
          r.next.forEach((n) => {
            nxt.push(n.questionName);
          });
        }
        r.next = nxt;
        return r;
      });
    }
    return modifyRule;
  }

  noSessionChange(value: boolean) {
    this.event.noSessions = value;
  }

  noDiscountsChange(value: boolean) {
    this.event.noDiscounts = value;
  }

  noQualificationsChange(value: boolean) {
    this.event.noQualifications = value;
  }

  deleteRegType(i: number) {
    const deletedRegtype: RegtypeData = this.event.regtypesList[i];
    this.event.regtypesList?.splice(i, 1);
    if (deletedRegtype) {
      const framedRegtype =
        deletedRegtype.code + ' - ' + deletedRegtype.description;

      /** Remove the Demo Questions related to the deleted regtype */
      this.event.questionsList = this.event.questionsList.filter(
        (ques) => ques.category != deletedRegtype.description
      );

      /** Remove the eventCost related to the deleted regtype */
      this.event.eventCosts = this.event.eventCosts.filter(
        // (cost) => cost.refCodes != framedRegtype
        (cost) => !cost.refCodes.includes(framedRegtype)
      );

      /** Remove the apply regtypes related to the deleted regtype on discounts */
      let newDiscountList: any[] = [];
      this.event.discountList?.forEach((discount: any) => {
        const appliedRegtypes: string[] = discount?.appliedRegtypes;
        const appliedCode: string = Number.isNaN(Number(deletedRegtype.code))
          ? deletedRegtype.code + ' - ' + deletedRegtype.description
          : Number(deletedRegtype.code) + ' - ' + deletedRegtype.description;
        const newAppliedRegtypes: string[] = appliedRegtypes?.filter(
          (regtype: string) =>
            regtype.toLowerCase() !== appliedCode.toLowerCase()
        );
        if (newAppliedRegtypes.length > 0) {
          newDiscountList.push({
            ...discount,
            appliedRegtypes: newAppliedRegtypes,
          });
        }
      });
      this.event.discountList = newDiscountList;

      /** Remove the qualifications related to the deleted regtype */
      this.event.addedQualifications = this.event.addedQualifications.filter(
        (qual) => qual.regType != deletedRegtype.description
      );
    }
  }

  sendInvite(val) {
    let tinyUrl: string = '';
    switch (val) {
      case 'attendee':
        tinyUrl = this.attendeeSiteURL;
        break;
      case 'exhibitor':
        tinyUrl = this.exhibitorSiteURL;
        break;
      case 'organizer':
        tinyUrl = this.organizerSiteURL;
        break;
      default:
        break;
    }

    const sendEmailModalRef = this.modalService.open(SendInviteComponent, {
      size: 'lg',
      windowClass: 'modal-invite-customer',
    });
    sendEmailModalRef.componentInstance.evtUid = this.evtUid;
    sendEmailModalRef.componentInstance.inviteType = val;
    sendEmailModalRef.componentInstance.tinyUrl = tinyUrl;
    sendEmailModalRef.componentInstance.eventInfo = this.event.EventInfo;
    sendEmailModalRef.result
      .then((res: any) => {
        if (res && res == 1) {
          this.toastService.show('Invite sent successfully', {
            delay: 3000,
            classname: 'bg-success text-light',
            headertext: 'Delete Event',
            autohide: true,
          });
        }
      })
      .catch((err: Error) => {
        console.error('close error: ', err);
      });
  }

  generateBatchEmails(emails, credentials) {
    let template = `<div>
          <h2>CSI Event System Email</h2>
          <br>
          <strong>You have successfully registered as show organizer to your CSI-Event.</strong>
          <br>
          <p>Initial Event Created by User: {username} - username: {emailAddr}</p>
          <p><u>Event Name: {eventName}</u></p>
          <p>Follow this link to view you new event home page: <a href="{eventHomePage}">Event Home page</a></p>
          <p>Please sign in to your System User profile on the <a href="{csiEventPlatform}">CSI-Event Platform</a> - to view and manage Event details</p>

          <p>- Your username - {emailAddr}</p>
          <p>- Your Password - {password}</p>
      </div>`;
    template = template
      .replace('{username}', this.loggedUser)
      .replace('{emailAddr}', credentials.emailaddr)
      .replace('{emailAddr}', credentials.emailaddr)
      .replace('{password}', credentials.password)
      .replace('{eventHomePage}', this.event.EventInfo.homePageOnShowInfo)
      .replace('{eventName}', this.event.EventInfo.eventName)
      .replace('{csiEventPlatform}', 'https://www.csi-event.com/');

    const from = 'info@a4safe.com';
    let body = {
      From: from,
      Subject: 'Registration Successful',
      HtmlBody: template,
      MessageStream: 'outbound',
    };
    return emails?.map((email) => ({ ...body, To: email }));
  }

  sendCredentialsMail(credentials) {
    let headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Accept', 'application/json')
      .set('X-Postmark-Server-Token', environment.postmark.serverToken);
    const postData = this.generateBatchEmails(
      [localStorage.getItem('emailAddr')],
      credentials
    );
    return this.httpClient.post<any>(environment.postmark.email, postData, {
      headers,
    });
  }

  updateBussinessRuleToEvent(data) {
    this.event.businessRules = data;
  }

  backPageCustomizationConfig(config: PageCustomizationConfig) {
    this.pageCustomizationConfig = config;
  }

  initBussinessRuleToEvent() {
    let evtUid = this.route.snapshot.paramMap.get('id');
    if (evtUid) {
      this.httpClient
        .get(
          API_URL2 +
            '/csi/event/services/eventSetupV2/listBusinessRuleByEvtId?evtUid=' +
            this.evtUid,
          { headers }
        )
        .subscribe((res: any) => {
          let ruleList = [];

          if (
            res.statusCode == 200 &&
            res.response?.businessRules?.length > 0
          ) {
            res.response.businessRules.map((x) => {
              if (!ruleList.find((r) => r.brID == x.brID)) {
                ruleList.push({
                  brID: x.brID,
                  businessRule: this.modifyNextinRule(
                    JSON.parse(x.businessRule)
                  ),
                });
              }
            });
          }

          const businessRules = ruleList.map((rule) => ({
            brID: rule.brID,
            businessRule: rule.businessRule,
          }));
          this.updateBussinessRuleToEvent(businessRules);
        });
    }
  }

  modifyNextinRule(rule) {
    let modifyRule = rule;
    if (!modifyRule.selectedWorkflow) {
      modifyRule.selectedWorkflow = 'workflow';
    }
    if (!modifyRule.selectedPage) {
      modifyRule.selectedPage = 'demographic';
    }
    if (modifyRule.selectedAction == ACTIONS.THREADING_DEMO_QUESTIONS) {
      modifyRule.query.rules = modifyRule.query.rules.map((r) => {
        r.next = !!r.next && r.next.map((n) => ({ questionName: n }));
        return r;
      });
    }
    return modifyRule;
  }
}
