import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  RuleSet,
  QueryBuilderConfig,
  Field,
  QueryBuilderClassNames,
} from 'angular2-query-builder';
import { v4 as uuid } from 'uuid';
import cloneDeep from 'lodash/cloneDeep';
import Stepper from 'bs-stepper';
import { SessionServiceService } from 'src/app/services/session-service.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CustomQuestionComponent } from 'src/app/shared/modals/custom-question/custom-question.component';
import { DiscountActionComponent } from 'src/app/shared/modals/discount-action/discount-action.component';
import { PackageActionComponent } from 'src/app/shared/modals/package-action/package-action.component';
import { CommunicationDeterminationComponent } from 'src/app/shared/modals/communication-determination/communication-determination.component';
import { RegTypeDeterminationComponent } from 'src/app/shared/modals/regtype-determination-action/regtype-determination-action.component';
import { ReorderPagesComponent } from 'src/app/shared/modals/reorder-pages/reorder-pages.component';
import { SessionActionComponent } from 'src/app/shared/modals/session-action/session-action.component';
import { CreateQualificationComponent } from '../../modals/create-qualification/create-qualification.component';
import { CreateSessionComponent } from '../../modals/create-session/create-session.component';
import { CustomQuerybuilderComponent } from '../custom-querybuilder/custom-querybuilder.component';
import { API_URL2 } from 'src/app/services/url/url';

export const ACTIONS = {
  CHAIN_DEMO_QUESTIONS: 'Chain Demo Questions',
  THREADING_DEMO_QUESTIONS: 'Threading Demo Questions',
  REGTYPE_DETERMINATION: 'Regtype Determination',
  RECOMMEND_DISCOUNT: 'Recommend Discount',
  RECOMMEND_PACKAGE: 'Recommend Package',
  RECOMMEND_SESSION: 'Recommend Session',
  COMMUNICATION_DETERMINATION: 'Communication Determination',
  ADDITIONAL_REGISTRANTS: 'Additional Registrants',
};

const defaultActions = [
  { id: 'newQulification', name: 'Add new Qualification' },
  // { id: 'reorderPages', name: 'Change Workflow Page Order' },
  // { id: 'addDemographic', name: ACTIONS.CHAIN_DEMO_QUESTIONS },
  { id: 'recommSession', name: 'Recommend Session' },
  { id: 'setDiscount', name: 'Recommend Discount' },
  { id: 'setPackage', name: 'Recommend Package' },
  { id: 'regtypeDetermination', name: ACTIONS.REGTYPE_DETERMINATION },
  { id: 'threadingDemoQuestions', name: ACTIONS.THREADING_DEMO_QUESTIONS },
  { id: 'communicationDetermination', name: ACTIONS.COMMUNICATION_DETERMINATION },
  { id: 'additionalRegistrants', name: ACTIONS.ADDITIONAL_REGISTRANTS },
];
const regWorkflowPages = [
  // [
  //   "demographic-layout/demographic-Information",
  //   "registration/registration",
  //   "session-layout/Session-Events"
  // ],
  [
    'demographic-layout/demographic-Information',
    'registration/registration',
    'qualifications-layout/Qualifications',
    'session-layout/Session-Events',
  ],
  [
    'workflow2/attendee',
    'registration/registration',
    'personal-layout/personal',
    'demographic-layout/demographic-Information',
    'session-layout/Session-Events',
    'review-layout/Review-Information',
    'registration-confirmation/confirmation',
    'dashboard-layout/dashboard',
  ],
  [
    'workflow3/attendee',
    'personal-layout/personal',
    'registration/registration',
    'qualifications-layout/Qualifications',
    'session-layout/Session-Events',
    'review-layout/Review-Information',
    'registration-confirmation/confirmation',
    'dashboard-layout/dashboard',
  ],
];

const displayPages = [
  {
    label: 'Workflow Page Selection',
    name: 'workflow',
    value: [
      { label: 'Demographic', name: 'demographic' },
      { label: 'Personal Information', name: 'personal_info' },
      { label: 'Registration Category', name: 'registration_category' },
      { label: 'Session and Events', name: 'session_event' },
      { label: 'Add On', name: 'add_on' },
      { label: 'Qualifications', name: 'qualifications' },
      { label: 'Review and Payment Information', name: 'review_payment' },
      { label: 'Registration Review', name: 'registration_review' },
      { label: 'Communication Determination', name: 'communication_determination' },
    ],
  },
  {
    label: 'Page Customization Selection',
    name: 'pageCustomization',
    value: [
      { label: 'Personal Information', name: 'personal_info' },
      { label: 'Address Information', name: 'address_info' },
      { label: 'Registration Dashboard Information', name: 'reg_dash_info' },
      { label: 'Other Information', name: 'other_info' },
      { label: 'Registration Account Information', name: 'reg_account_info' },
    ],
  },
];

const defaultQuery: any = {
  condition: 'and',
  rules: [],
};

function getDefaultQueryWithType(type?) {
  let query = cloneDeep(defaultQuery);
  if (type == 'attendeeName') {
    query.rules.push({
      field: 'attendeeName',
      operator: '=',
    });
  } else if (type == 'questionList') {
    {
      query.rules.push({
        field: 'questionList',
        operator: '=',
        value: '',
        pollingType: '',
        checkAny: false,
        question: '',
        questionName: '',
        group: '',
        next: [],
      });
    }
  } else if (type == 'attendee') {
    query.rules.push({
      field: 'attendee',
      operator: '=',
    });
  }

  return query;
}

const defaultRule = {
  isPublished: true,
  regType: '',
  selectedAction: '',
  actionData: null,
  selectedWorkflow: 'workflow',
  selectedPage: 'demographic',
  query: cloneDeep(defaultQuery),
} as any;

const defaultConfig: QueryBuilderConfig = {
  fields: {
    attendeeName: { name: 'Attendee Name', type: 'string' },
    companyName: { name: 'Company Name', type: 'string' },
    packageList: {
      name: 'Package Selection',
      type: 'category',
      options: [],
    },
    sessionList: {
      name: 'Session Selection',
      type: 'category',
      options: [],
    },
    questionList: {
      name: 'Question Selection',
      type: 'category',
      validator: (rule) => {
        return {
          isRequired: {
            rule: rule,
            message: 'Select a Field',
          },
        };
      },
      options: [],
    },
  },
};

const discountConfig: QueryBuilderConfig = {
  fields: {
    attendee: {
      name: 'Attendee',
      type: 'category',
      options: [],
    },
    member: {
      name: 'Member',
      type: 'category',
      options: [],
    },
    packageList: {
      name: 'Package Selection',
      type: 'category',
      options: [],
    },
    sessionList: {
      name: 'Session Selection',
      type: 'category',
      options: [],
    },
    questionList: {
      name: 'Question Selection',
      type: 'category',
      validator: (rule) => {
        return {
          isRequired: {
            rule: rule,
            message: 'Select a Field',
          },
        };
      },
      options: [],
    },
  },
};

const visaLetterConfig: QueryBuilderConfig = {
  fields: {
    attendee: {
      name: 'Attendee',
      type: 'category',
      options: [],
    },
    questionList: {
      name: 'Question Selection',
      type: 'category',
      validator: (rule) => {
        return {
          isRequired: {
            rule: rule,
            message: 'Select a Field',
          },
        };
      },
      options: [],
    },
  },
};

const sessionThreadingConfig: QueryBuilderConfig = {
  fields: {
    attendee: {
      name: 'Attendee',
      type: 'category',
      options: [],
    },
    option: {
      name: 'Option',
      type: 'category',
      options: [],
    },
    questionList: {
      name: 'Question Selection',
      type: 'category',
      validator: (rule) => {
        return {
          isRequired: {
            rule: rule,
            message: 'Select a Field',
          },
        };
      },
      options: [],
    },
  },
};

const regTypeDetermineConfig: QueryBuilderConfig = {
  fields: {
    attendee: {
      name: 'Attendee',
      type: 'category',
      options: [],
    },
    member: {
      name: 'Member',
      type: 'category',
      options: [],
    },
    questionList: {
      name: 'Question Selection',
      type: 'category',
      validator: (rule) => {
        return {
          isRequired: {
            rule: rule,
            message: 'Select a Field',
          },
        };
      },
      options: [],
    },
  },
};

const defaultCommunicationForAction = [
  { name: 'Show Org Email' },
  { name: 'Attendee Reg Email - English' },
  { name: 'Attendee Reg Email - Spanish' },
  { name: 'Invite a Colleague Email' },
  { name: 'Invite a Customer Email' },
  { name: 'Confirmation Email - English' },
  { name: 'Confirmation Email - Spanish' },
  { name: 'Access Denied Email' },
  { name: 'Incomplete Email' },
  { name: 'Visa Letter' },
  { name: 'Exhibitor Reg Email' },
  { name: 'Invoice Letter' },
  { name: 'Billing Letter' },
];

@Component({
  selector: 'app-business-rules-qb',
  templateUrl: './business-rules-qb.component.html',
  styleUrls: ['./business-rules-qb.component.scss'],
  // encapsulation: ViewEncapsulation.ShadowDom
})
export class BusinessRulesQbComponent implements OnInit, OnChanges {
  private _eventCostsInp: any;
  @Input() set eventCostsInp(value: any) {
    this._eventCostsInp = value;
  }
  private _sessionsInp: any;
  @Input() set sessionsInp(value: any) {
    this._sessionsInp = value;
  }
  private _questionsInp: any;
  @Input() set questionsInp(value: any) {
    this._questionsInp = value;
  }
  private _discountsInp: any;
  @Input() set discountsInp(value: any) {
    this._discountsInp = value;
  }
  private _speakersInp: any;
  @Input() set speakersInp(value: any) {
    this._speakersInp = value;
  }
  private _regTypeInp: any;
  @Input() set regTypeInp(value: any) {
    this._regTypeInp = value;
  }
  private _businessRulesInp: any;
  @Input() set businessRulesInp(value: any) {
    this._businessRulesInp = value;
  }
  @Output() updateBussinessRules = new EventEmitter();

  @ViewChild(CustomQuerybuilderComponent) customQb: CustomQuerybuilderComponent;
  name = 'Angular';
  actions = defaultActions;
  readonly ACTIONS = ACTIONS;
  questions = [];
  question_data = [];
  questionsFromAPI = [];
  // public queryCtrl: FormControl;
  ruleList = [];
  currentRule = cloneDeep(defaultRule);
  config = cloneDeep(defaultConfig);
  editIndex = -1;
  // myEventID: any;
  packages: any = [{ name: '', value: '' }];
  sessions: any = [{ name: '', value: '' }];
  discounts: any = [{ name: '', value: '' }];
  orgDiscountsList = [];
  eventCosts = [];
  loadedData: any;
  loadBuilder = false;
  jobsCategory = [];
  jobsCategoryOrg = [];
  // jobsCategoryOptions = [];
  public allowRuleset: boolean = true;
  public allowCollapse: boolean;
  public persistValueOnFieldChange: boolean = false;
  allQuestions: any;
  safeGuard: number = 1;
  // selectedRegType = 'attendee'
  speakerList: any = [];
  packagesForAction: any;
  communicationForAction: any;
  private stepper: Stepper;
  orgConfig;
  pageNames = {
    rule: 'rule',
    action_details: 'action_details',
    condition_builder: 'condition_builder',
  };
  evtUid: any;

  displayPages = displayPages;
  pageList = [];

  constructor(
    private formBuilder: FormBuilder,
    private sessionService: SessionServiceService,
    public toastService: ToastService,
    private router: Router,
    private httpClient: HttpClient,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    // let url = this.router.url.split('/');
    // this.myEventID = url[url.length - 1];
    // this.queryCtrl = this.formBuilder.control(this.currentRule.query);
    this.evtUid = this.route.snapshot.paramMap.get('id');
  }

  // ngOnInit(): void {
  //   var headers = new HttpHeaders()
  //     .set('content-type', 'application/json')
  //     .set('Access-Control-Allow-Headers', 'Content-Type')
  //     .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  //     .set('Access-Control-Allow-Origin', '*');

  //   if (localStorage.getItem("Authorization")) {
  //     headers = new HttpHeaders()
  //       .set('content-type', 'application/json')
  //       .set('Access-Control-Allow-Headers', 'Content-Type')
  //       .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  //       .set('Access-Control-Allow-Origin', '*')
  //       .set('Authorization', localStorage.getItem("Authorization"));
  //   }

  //   if (this.myEventID != undefined) {
  //     // this.myEventID = window.url.split('/');
  //     this.sessionService.remove('selectedEvent');
  //     var EVENT_DATA_API1 =
  //       API_URL2 +
  //       '/csi/event/services/eventSetupV2/findAllEvtInfoByEvtUid?evtUid=' +
  //       this.myEventID;
  //     var REGTYPE_DATA_URL =
  //       API_URL2 + '/csi/event/services/eventSetupV2/getRegTypefromEvtuid?evtUid=' +
  //       this.myEventID;
  //     this.httpClient.get(REGTYPE_DATA_URL, { headers }).subscribe(reg => {
  //       reg['response']['regType'].forEach((element) => {
  //         if (!this.jobsCategoryOrg.includes(element)) {
  //           this.jobsCategoryOrg.push(element);
  //         }
  //         let index = element.indexOf('-');
  //         if (
  //           !this.jobsCategory.includes(
  //             element.slice(index + 2)
  //           )
  //         ) {
  //           this.jobsCategory.push(element.slice(index + 2));
  //         }
  //       });
  //       this.httpClient.get(EVENT_DATA_API1, { headers }).subscribe(data => {
  //         console.log(data);
  //         this.loadedData = data;
  //         this.buildConfig(data);
  //         this.setOperators();
  //         this.loadBuilder = true;
  //         this.stepperInit();
  //       });
  //       this.httpClient.get(API_URL2 + '/csi/event/services/eventSetupV2/listBusinessRuleByEvtId?evtUid=' + this.myEventID, { headers }).subscribe((res: any) => {
  //         if (res.statusCode == 200 && res.response?.businessRules?.length > 0) {
  //           this.ruleList = res.response.businessRules.map(x => ({ brID: x.brID, businessRule: JSON.parse(x.businessRule) }));
  //         }
  //       });
  //     })
  //   } else {
  //     this.returnHome();
  //   }
  // }  

  ngOnInit(): void {
    this.stepperInit();
    if (this.evtUid) {
      this.httpClient
        .get(
          API_URL2 +
            '/csi/event/services/eventSetupV2/listBusinessRuleByEvtId?evtUid=' +
            this.evtUid,
          { headers: this.headers }
        )
        .subscribe((res: any) => {
          this.ruleList = [];
          this._businessRulesInp?.map((x) => {
            if (
              this.ruleList.length == 0 ||
              !this.ruleList.find((r) => r.brID == x.brID)
            ) {
              this.ruleList.push({
                brID: x.brID,
                businessRule: x.businessRule,
              });
            }
          });
          if (
            res.statusCode == 200 &&
            res.response?.businessRules?.length > 0
          ) {
            res.response.businessRules.map((x) => {
              if (!this.ruleList.find((r) => r.brID == x.brID)) {
                this.ruleList.push({
                  brID: x.brID,
                  businessRule: this.modifyNextinRule(
                    JSON.parse(x.businessRule)
                  ),
                });
              }
            });
          }
          this.checkDeprecated();
        });
    } else {
      this.ruleList = [];
      this._businessRulesInp?.map((x) => {
        if (
          this.ruleList.length == 0 ||
          !this.ruleList.find((r) => r.brID == x.brID)
        ) {
          this.ruleList.push({ brID: x.brID, businessRule: x.businessRule });
        }
      });
      this.checkDeprecated();
    }

    // this.httpClient.get(API_URL2 + '/csi/event/services/eventSetupV2/listBusinessRuleByEvtId?evtUid=' + 2590, { headers: this.headers }).subscribe((res: any) => {
    //   if (res.statusCode == 200 && res.response?.businessRules?.length > 0) {
    //     this.ruleList = res.response.businessRules.map(x => ({ brID: x.brID, businessRule: JSON.parse(x.businessRule) }));
    //   }
    // });
    if (this.evtUid) {
      this.httpClient.get(API_URL2 + '/csi/event/services/eventSetupV2/getAvailableEmailList?evtUid=' + this.evtUid, { headers: this.headers }).subscribe((res: any) => {
        if (res.statusCode === 200 && res.response.length > 0) {
          this.communicationForAction = res.response;
        } else {
          this.communicationForAction = defaultCommunicationForAction;
        }
      });
    } else {
      this.communicationForAction = defaultCommunicationForAction;
    }
    console.log("this.communicationForAction: ", this.communicationForAction);
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
  checkDeprecated() {
    this.ruleList = this.ruleList.map((rule) => {
      let r = rule;
      let isChainingDemoQuestion =
        r.businessRule.selectedAction == ACTIONS.CHAIN_DEMO_QUESTIONS;
      if (
        this.ifRuleExists(
          r.businessRule.query.rules,
          r.businessRule.regType,
          isChainingDemoQuestion
        )
      ) {
        r.businessRule.isPublished = true;
      } else {
        r.businessRule.isPublished = false;
      }
      return r;
    });
    const businessRules = this.ruleList.map((rule) => ({
      brID: rule.brID,
      businessRule: rule.businessRule,
    }));
    this.updateBussinessRules.emit(businessRules);
    console.log('check deprecated', this.ruleList);
  }

  ifRuleExists(rules, regtype, isChainingDemoQuestion) {
    let result = true;
    for (let i = 0; i < rules.length; i++) {
      let r = rules[i];
      if (r.rules) {
        result = this.ifRuleExists(r.rules, regtype, isChainingDemoQuestion);
      } else {
        if (
          !this._regTypeInp.find(
            (reg) => reg.description.toLowerCase() === regtype
          )
        ) {
          return false;
        }
        if (
          r.field == 'questionList' &&
          !this.question_data.find(
            (q) =>
              q.question?.toString().trim() == r.question?.toString().trim() &&
              q.pollingType == r.pollingType &&
              (q.checked == true || q.checked == 'true') &&
              Array(...q.category).find(
                (v) => v.toLowerCase() == regtype?.toLowerCase()
              )
          )
        ) {
          r.question = '';
          return false;
        } else if (
          r.field == 'sessionList' &&
          !this.sessions.find((s) => s.value == r.value)
        ) {
          return false;
        } else if (
          r.field == 'packageList' &&
          !this.packages.find((p) => p.value == r.value)
        ) {
          return false;
        }
      }
    }
    return result;
  }

  loadData() {
    const data = this.generateData();
    this.loadedData = data;
    this.buildConfig(data);
    this.setOperators();
    this.loadBuilder = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.businessRulesInp) {
      console.log('change', this._businessRulesInp);
      this.ruleList = [];
      this._businessRulesInp?.map((x) => {
        if (
          this.ruleList.length == 0 ||
          !this.ruleList.find((r) => r.brID == x.brID)
        ) {
          this.ruleList.push({ brID: x.brID, businessRule: x.businessRule });
        }
      });
    }
    this.loadData();
  }

  generateData() {
    let data = { response: {} };
    data.response = {
      Event: {},
      EventCosts: this._eventCostsInp,
      sessions: this._sessionsInp,
      questions: this._questionsInp,
      discounts: this._discountsInp,
      speakers: this._speakersInp,
    };

    this._regTypeInp.forEach((element) => {
      if (
        !this.jobsCategoryOrg.includes(
          element.code + ' - ' + element.description.toLowerCase()
        )
      ) {
        this.jobsCategoryOrg.push(
          element.code + ' - ' + element.description.toLowerCase()
        );
      }
      if (!this.jobsCategory.includes(element.description.toLowerCase())) {
        this.jobsCategory.push(element.description.toLowerCase());
      }
    });
    return data;
  }

  stepperInit() {
    this.stepper = new Stepper(document.querySelector('#bre_stepper'), {
      linear: false,
      animation: true,
    });
  }

  setOperators() {
    Object.keys(this.config.fields).forEach((field) => {
      this.config.fields[field]['operators'] = ['=', '!=', 'in', 'not in'];
    });
  }

  setDefaultRegType() {
    this.currentRule.regType = this.defaultRegType;
    this.currentRule.selectedWorkflow = 'workflow';

    this.pageList = this.displayPages.find(
      (dp) => dp.name === 'workflow'
    )?.value;
    this.currentRule.selectedPage = this.pageList[0]?.name;
  }

  get defaultRegType() {
    return (
      (this.jobsCategory &&
        this.jobsCategory.find(
          (category) => category.toLowerCase() == 'attendee'
        )) ||
      this.jobsCategory[0]
    );
  }

  buildConfig(data) {
    this.discounts = [];
    this.eventCosts = [];
    this.resetRule();
    this.setDefaultRegType();
    this.packages = [{ name: '', value: '' }];
    this.packagesForAction = [{ name: '', value: '' }];
    this.sessions = [{ name: '', value: '' }];
    if (data && data['response'] && data['response']['Event']) {
      if (
        data['response']['EventCosts'] &&
        data['response']['EventCosts'] != 'null' &&
        data['response']['EventCosts'].length > 0
      ) {
        this.eventCosts = data['response']['EventCosts'];
        this.getFilteredPackages();
      }
      if (
        data['response']['sessions'] &&
        data['response']['sessions'] != 'null' &&
        data['response']['sessions'].length > 0
      ) {
        data['response']['sessions']?.forEach((session) => {
          this.sessions.push({
            name: session.name,
            value: session.name,
            useBre: session.useBre,
          });
        });
        if (this.config.fields?.sessionList)
          this.config.fields.sessionList.options = cloneDeep(this.sessions);
      }
      if (
        data['response']['questions'] &&
        data['response']['questions'] != 'null' &&
        data['response']['questions'].length > 0
      ) {
        this.questionsFromAPI = data['response']['questions'];
        let questions = data['response']['questions'];
        questions = questions.filter(
          (thing, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                // (t.checked == 'true' || t.checked == true ) &&
                t.question === thing.question &&
                JSON.stringify(t.category) == JSON.stringify(thing.category) &&
                t.PollingType === thing.PollingType
            )
        );

        // const formattedData = (data?.response?.questions ?? []).reduce((ret, cur) => ({
        //   ...(ret ?? {}),
        //   [cur?.category]: {
        //     ...(ret?.[cur?.category] ?? {}),
        //     [cur?.question]: (cur?.demDetails ?? []).map(item => item?.dedDescription)
        //   }
        // }), {})

        this.question_data = questions;

        // console.log(this.question_data)

        // data['response']['questions']?.forEach(question => {
        //   this.questions.push({ name: question.question, value: question.question });
        // });
      }

      if (
        data['response']['discounts'] &&
        data['response']['discounts'] != 'null' &&
        data['response']['discounts'].length > 0
      ) {
        this.orgDiscountsList = data['response']['discounts'];
        this.getFilteredDiscounts();
        // data['response']['discounts']?.forEach(discount => {
        //   this.discounts.push({ name: discount.discountName, value: discount.discountName });
        // });
        // this.config.fields['discountList']['options'] = this.discounts;
      }

      if (
        data['response']['speakers'] &&
        data['response']['speakers'] != 'null'
      ) {
        this.speakerList = data['response']['speakers'];
      }
      this.loadBuilder = true;
    } else {
      this.returnHome();
    }
    // this.config = cloneDeep(this.config);
    this.orgConfig = cloneDeep(this.config);
    return this.config;
  }

  returnHome() {
    this.router.navigate(['']);
    this.toastService.show('Unable to load the event.', {
      delay: 6000,
      classname: 'bg-warning text-dark',
      headertext: 'Warning',
      autohide: true,
    });
  }

  getFilteredPackages() {
    // this.loadBuilder = false;
    this.packages = [];
    this.packagesForAction = [];
    this.eventCosts?.forEach((element) => {
      this.packages.push({
        name: element.customPackage?.name,
        value: element.customPackage?.name,
      });
      this.packagesForAction.push({
        name: element.customPackage?.name,
        value: element.customPackage?.name,
      });
      // if(element?.refCodes instanceof Array){
      //   element?.refCodes.forEach(ele => {
      //     let index = ele.indexOf('-');
      //     if (ele?.slice(index + 2).toLowerCase() == (this.currentRule.regType)?.toLowerCase()) {
      //       this.packages.push({ name: element.customPackage?.name, value: element.customPackage?.name });
      //       this.packagesForAction.push({ name: element.customPackage?.name, value: element.customPackage?.name });
      //     }
      //   });
      // } else {
      //   let index = element?.refCodes.indexOf('-');
      //     if (element?.refCodes?.slice(index + 2).toLowerCase() == (this.currentRule.regType)?.toLowerCase()) {
      //       this.packages.push({ name: element.customPackage?.name, value: element.customPackage?.name });
      //       this.packagesForAction.push({ name: element.customPackage?.name, value: element.customPackage?.name });
      //     }
      // }
    });
    if (this.config.fields['packageList']) {
      this.config.fields['packageList']['options'] = this.packages;
    }
    this.config = cloneDeep(this.config);
    this.updateOrgConfig();
    console.log('packagelist', this.packages);
    // this.loadBuilder = true;
  }

  updateOrgConfig() {
    this.orgConfig = cloneDeep(this.config);
  }

  getFilteredDiscounts() {
    this.discounts = [];
    this.orgDiscountsList?.forEach((discount) => {
      let index = discount.appliedRegtypes[0]?.indexOf('-');
      if (
        discount.useBre &&
        this.currentRule.regType &&
        this.currentRule.regType.toLowerCase() ==
          discount.appliedRegtypes[0]?.slice(index + 2).toLowerCase()
      ) {
        this.discounts.push({
          name: discount.discountName,
          value: discount.discountName,
        });
      }
    });
  }

  showWarningMsg(msg) {
    this.toastService.show(msg, {
      delay: 6000,
      classname: 'bg-warning text-dark',
      headertext: 'Warning',
      autohide: true,
    });
  }

  checkforSingleSelect(field: string) {
    return this.currentRule.query.rules.filter(
      (element) => element.field === field
    );
  }

  isValidRuleOfRegTypeDeterm(rules) {
    return rules.every(
      (rule) =>
        rule.field !== 'questionList' ||
        (rule.field == 'questionList' &&
          !!rule.pollingType &&
          !!rule.question) ||
        (rule.rules && this.isValidRuleOfRegTypeDeterm(rule.rules))
    );
  }
  checkIfValueEmpty(query) {
    let result = null;
    query.rules.forEach((x) => {
      if (x.rules) {
        result = this.checkIfValueEmpty(x);
      } else if (
        (!x.value && !x.checkAny) ||
        (x.field == 'questionList' && !x.pollingType)
      ) {
        if (x.field == 'questionList' && !x.pollingType) {
          result = 'pollingTypes';
        } else {
          result = 'answers';
        }
      }
    });
    return result;
  }

  isValidRuleForChainingThreading(rules) {
    return !(
      rules.filter(
        (rule) =>
          (rule.businessRule.selectedAction == ACTIONS.CHAIN_DEMO_QUESTIONS &&
            this.currentRule.selectedAction ==
              ACTIONS.THREADING_DEMO_QUESTIONS) ||
          (rule.businessRule.selectedAction ==
            ACTIONS.THREADING_DEMO_QUESTIONS &&
            this.currentRule.selectedAction == ACTIONS.CHAIN_DEMO_QUESTIONS)
      ).length == 1
    );
  }

  isValidThreadingRules() {
    // if(!this.currentRule.query.rules.every(r1 => !r1.next || this.currentRule.query.rules.find(r2 => !r2.next || r1.next == r2.questionName))){
    //   this.showWarningMsg("Cannot save rule: Question Id select in next not exists in conditions");
    //   return false;
    // }

    const dup = this.currentRule.query.rules
      .map((el, i) => {
        return this.currentRule.query.rules.find((element, index) => {
          if (
            i !== index &&
            element.field === el.field &&
            element.field == 'questionList' &&
            element.question === el.question &&
            element.value === el.value
          ) {
            return el;
          }
        });
      })
      .filter((x) => x);
    if (dup.length > 0) {
      this.showWarningMsg(
        'Cannot save rule with duplicate field ' +
          dup[0].field +
          ', value ' +
          dup[0].value +
          ' exists!!'
      );
      return false;
    }

    if (
      !!this.currentRule.query.rules.find(
        (rule) =>
          rule.next &&
          rule.next.filter((x) => x.questionName == rule.questionName).length >
            0
      )
    ) {
      this.showWarningMsg(
        'Cannot save rule: Next cannot be same as Question selected in query'
      );
      return false;
    }

    if (
      !!this.currentRule.query.rules.find((rule, i) =>
        this.currentRule.query.rules.find(
          (r, j) =>
            r.next &&
            r.next.filter((x) => x.questionName == rule.questionName).length >
              0 &&
            i < j
        )
      )
    ) {
      this.showWarningMsg(
        'Cannot save rule: Cannot select question in next field which is previously selected'
      );
      return false;
    }

    let idx = this.ruleList.findIndex(
      (r) =>
        r.businessRule.selectedAction == ACTIONS.THREADING_DEMO_QUESTIONS &&
        r.businessRule.regType == this.currentRule.regType
    );
    if (
      this.editIndex != idx &&
      this.ruleList[idx]?.businessRule?.selectedPage == 'demographic' &&
      this.currentRule.selectedPage == 'demographic'
    ) {
      this.showWarningMsg(
        'Only single Threading Demo Question Rule is Allowed per Regtype'
      );
      return false;
    }
    return true;
  }

  validateRule() {
    if (
      this.currentRule.query?.rules?.length <= 0 &&
      !(this.currentRule.selectedAction == 'Change Workflow Page Order')
    ) {
      this.showWarningMsg('Cannot save rule: No Conditions added');
      return;
    }

    if (!this.isValidRuleForChainingThreading(this.ruleList)) {
      this.showWarningMsg(
        'Cannot save rule: Chaining and Threading actions cannot be added for same event'
      );
      return;
    }

    if (
      (this.currentRule.selectedAction == ACTIONS.REGTYPE_DETERMINATION ||
        this.currentRule.selectedAction == ACTIONS.CHAIN_DEMO_QUESTIONS ||
        this.currentRule.selectedAction == ACTIONS.THREADING_DEMO_QUESTIONS) &&
      !this.isValidRuleOfRegTypeDeterm(this.currentRule.query.rules)
    ) {
      this.showWarningMsg(
        'Cannot save rule: Polling type and question is required!!'
      );
      return;
    }

    let idx = this.ruleList.findIndex(
      (r) =>
        r.businessRule.selectedAction == ACTIONS.CHAIN_DEMO_QUESTIONS &&
        r.businessRule.regType == this.currentRule.regType
    );
    if (
      this.currentRule.selectedAction == ACTIONS.CHAIN_DEMO_QUESTIONS &&
      this.editIndex != idx &&
      this.ruleList[idx]?.businessRule?.selectedPage == 'demographic' &&
      this.currentRule.selectedPage == 'demographic'
    ) {
      this.showWarningMsg(
        'Only single Chain Demo Question Rule is Allowed per Regtype'
      );
      return;
    }

    const type = this.checkIfValueEmpty(this.currentRule.query);
    if (type) {
      this.showWarningMsg('please fill ' + type);
      return;
    }
    if (this.currentRule.selectedAction == ACTIONS.THREADING_DEMO_QUESTIONS) {
      this.currentRule.query.rules = this.currentRule.query.rules.map((r) => {
        const rule = r;
        const questionName =
          this.question_data.find(
            (q) =>
              q.question?.toString().trim() == r.question?.toString().trim()
          )?.questionName || '';
        rule['questionName'] = questionName;
        return rule;
      });
      if (!this.isValidThreadingRules()) {
        return;
      }
    } else {
      const duplicates = this.currentRule.query.rules
        .map((el, i) => {
          return this.currentRule.query.rules.find((element, index) => {
            if (
              i !== index &&
              element.field === el.field &&
              element.field == 'questionList' &&
              element.question === el.question &&
              element.field != 'questionList' &&
              element.value === el.value
            ) {
              return el;
            }
          });
        })
        .filter((x) => x);
      if (duplicates.length > 0) {
        this.showWarningMsg(
          'Cannot save rule: duplicate field: ' +
            duplicates[0].field +
            ', value: ' +
            duplicates[0].value +
            ' exists!!'
        );
        return;
      }
    }

    if (this.checkforSingleSelect('attendeeName').length > 1) {
      this.showWarningMsg('Only single Attendee Name is allowed');
      return;
    }
    if (this.checkforSingleSelect('companyName').length > 1) {
      this.showWarningMsg('Only single Company Name is allowed');
      return;
    }
    if (this.checkforSingleSelect('packageList').length > 1) {
      this.showWarningMsg('Only single Package Selection is allowed');
      return;
    }

    return true;
  }

  saveRule() {
    console.log('---------->', this.currentRule);

    if (!this.validateRule()) {
      return;
    }

    this.currentRule.isPublished = true;
    if (this.editIndex > -1) {
      this.ruleList[this.editIndex].businessRule = this.currentRule;
    } else {
      this.currentRule.brID = uuid();
      this.ruleList.push({
        brID: this.currentRule.brID,
        businessRule: this.currentRule,
      });
    }

    // this.config.fields.questionList?.validator();
    this.excecuteRules();
  }

  createRuleName(rules) {
    let ruleName = '';
    rules.map((rule) => {
      if (!!rule.condition) {
        ruleName += this.createRuleName(rule.rules);
      } else {
        ruleName += rule.field + ':' + rule.value + ',';
      }
    });
    return ruleName;
  }

  resetRule(index?) {
    this.config = cloneDeep(this.config || this.orgConfig);
    this.currentRule = cloneDeep(defaultRule);
    // this.config = cloneDeep(defaultConfig);
    // this.queryCtrl.setValue(cloneDeep(defaultQuery));
    this.editIndex = index != null ? index : -1;
    // this.setDefaultRegType();
  }

  onChangeActionValue(action, currentPageName) {
    if (action == 'Recommend Discount' && this.discounts.length == 0) {
      this.showWarningMsg('select a different regtype which has Discounts');
      return;
    } else if (
      (action == 'Recommend Package' || action == ACTIONS.ADDITIONAL_REGISTRANTS) &&
      this.packagesForAction.length == 0
    ) {
      this.showWarningMsg('select a different regtype which has Package');
      return;
    } else if (
      action == ACTIONS.REGTYPE_DETERMINATION &&
      this.jobsCategoryOrg.filter(
        (x) =>
          x.split(' - ')[1] != this.currentRule.regType ||
          (x.split(' - ').length == 1 && x != this.currentRule.regType)
      ).length == 0
    ) {
      this.showWarningMsg('No other regTypes available');
      return;
    }
    if (this.currentRule.selectedAction != action) {
      this.currentRule.selectedAction = action;
      this.currentRule.actionData = null;
      this.currentRule.query = getDefaultQueryWithType();
      this.modifyConfig(currentPageName);
      this.modifyRule(currentPageName);
    }
    if (this.currentRule.selectedAction == 'Change Workflow Page Order') {
      this.reOrderPages();
    } else if (this.currentRule.selectedAction == 'Add new Qualification') {
      this.createQualification();
    } else if (
      this.currentRule.selectedAction == ACTIONS.CHAIN_DEMO_QUESTIONS
    ) {
      // this.addNewQuestion();
    } else if (this.currentRule.selectedAction == 'Recommend Session') {
      this.setSession();
    } else if (this.currentRule.selectedAction == 'Recommend Discount') {
      this.setDiscount();
    } else if (this.currentRule.selectedAction == 'Recommend Package') {
      this.setPackage();
    } else if (this.currentRule.selectedAction == 'Add Session') {
      this.createSession();
    } else if (this.currentRule.selectedAction == 'Communication Determination') {
      this.setCommunication();
    } else if (this.currentRule.selectedAction == ACTIONS.ADDITIONAL_REGISTRANTS) {
      this.setPackage();
    } else if (
      this.currentRule.selectedAction == ACTIONS.REGTYPE_DETERMINATION
    ) {
      this.regTypeDetermination();
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
    createQualificationModalRef.componentInstance.isEdit = this.currentRule
      .actionData?.qualName
      ? true
      : false;
    createQualificationModalRef.componentInstance.data =
      this.currentRule.actionData;
    createQualificationModalRef.result.then((qualification: any) => {
      console.error('New Created qualification: ', qualification);
      if (!qualification) {
        return;
      }
      const qual = cloneDeep(qualification);
      delete qual.sampleQualificationFileDataData;
      this.currentRule.actionData = qual;
    });
  }

  createSession() {
    const createSessionRef = this.modalService.open(CreateSessionComponent, {
      size: 'lg',
      windowClass: 'modal-custom-createQualification',
    });
    createSessionRef.componentInstance.speakerList = this.speakerList;
    createSessionRef.componentInstance.discountList = this.orgDiscountsList;
    createSessionRef.componentInstance.isEdit = this.currentRule.actionData
      ?.name
      ? true
      : false;
    createSessionRef.componentInstance.data = this.currentRule.actionData;
    createSessionRef.result.then((session: any) => {
      if (!session) {
        return;
      }
      this.currentRule.actionData = cloneDeep(session);
    });
  }

  // addNewQuestion() {
  //   const customQuestion = this.modalService.open(CustomQuestionComponent, {
  //     size: 'lg',
  //     windowClass: 'modal-custom-CustomQuestionComponent'
  //   });
  //   const configQuestions = this.questionsFromAPI.filter(x=>(x.checked == 'false' || !x.checked) && x.category.toLowerCase() == this.currentRule.regType.toLowerCase())
  //   customQuestion.componentInstance.question = cloneDeep(this.currentRule.actionData);
  //   customQuestion.componentInstance.questionList = cloneDeep(configQuestions);
  //   customQuestion.componentInstance.regtype = cloneDeep(this.currentRule.regType);
  //   customQuestion.result.then((question: any) => {
  //     console.log("question: ", question);
  //     if (!question) {
  //       return;
  //     };
  //     this.currentRule.actionData = cloneDeep(question);
  //   });
  // }

  findAttendeeName(rules) {
    let data;
    rules.forEach((rule) => {
      if (!!rule.condition) {
        data = this.findAttendeeName(rule.rules);
      } else {
        if (rule.field === 'attendeeName') {
          data = rule.value;
        }
      }
    });
    return data;
  }

  reOrderPages() {
    const reOrderPagesModalRef = this.modalService.open(ReorderPagesComponent, {
      size: 'lg',
      windowClass: 'modal-custom-createQualification',
    });

    const defaultPageOrder = {
      regType: 'attendee',
      attendeeName: this.findAttendeeName(this.currentRule.query.rules) || '',
      companyName: '',
      pages: [...regWorkflowPages[0]],
    };
    reOrderPagesModalRef.componentInstance.pagesOrderData = this.currentRule
      .actionData
      ? this.currentRule.actionData
      : defaultPageOrder;
    reOrderPagesModalRef.componentInstance.isEdit = false;
    reOrderPagesModalRef.result.then((pagesOrder: any) => {
      console.log('Pages: ', pagesOrder);
      if (!pagesOrder) {
        return;
      }
      this.currentRule.actionData = cloneDeep(pagesOrder);
    });
  }

  setSession() {
    const ref = this.modalService.open(SessionActionComponent, {
      size: 'lg',
      windowClass: 'modal-custom-createQualification',
    });
    console.log('=========>>>>>>>>>', this.sessions);
    ref.componentInstance.sessionList = cloneDeep(
      this.sessions.filter((el) => el.useBre)
    );
    ref.componentInstance.sessionData = this.currentRule.actionData;
    ref.result.then((sessionData: any) => {
      if (!sessionData) {
        return;
      }
      this.currentRule.actionData = cloneDeep(sessionData);
    });
  }

  setDiscount() {
    const ref = this.modalService.open(DiscountActionComponent, {
      size: 'lg',
      windowClass: 'modal-custom-createQualification',
    });
    ref.componentInstance.discountList = this.discounts;
    ref.componentInstance.discountData = this.currentRule.actionData;
    ref.result.then((discountData: any) => {
      if (!discountData) {
        return;
      }
      this.currentRule.actionData = cloneDeep(discountData);
    });
  }

  setPackage() {
    const ref = this.modalService.open(PackageActionComponent, {
      size: 'lg',
      windowClass: 'modal-custom-createQualification',
    });
    ref.componentInstance.packageList = this.packagesForAction;
    ref.componentInstance.packageData = this.currentRule.actionData;
    ref.result.then((packageData: any) => {
      if (!packageData) {
        return;
      }
      this.currentRule.actionData = cloneDeep(packageData);
    });
  }

  setCommunication() {
    const ref = this.modalService.open(CommunicationDeterminationComponent, {
      size: 'lg',
      windowClass: 'modal-custom-createQualification',
    });
    console.log("currentRule.actionData: ", this.currentRule.actionData);
    
    ref.componentInstance.communicationList = this.communicationForAction;
    ref.componentInstance.communicationData = this.currentRule.actionData;
    ref.result.then((communicationData: any) => {
      if (!communicationData) {
        return;
      }
      this.currentRule.actionData = cloneDeep(communicationData);
    });
  }

  regTypeDetermination() {
    const ref = this.modalService.open(RegTypeDeterminationComponent, {
      size: 'lg',
      windowClass: 'modal-custom-createQualification',
    });
    ref.componentInstance.regTypeList = this.jobsCategoryOrg.filter(
      (x) => x.split(' - ')[1] != this.currentRule.regType
    );
    ref.componentInstance.regTypeData = this.currentRule.actionData;
    ref.result.then((regTypeData: any) => {
      if (!regTypeData) {
        return;
      }
      this.currentRule.actionData = cloneDeep(regTypeData);
    });
  }

  selectRule(ruleName) {
    console.log(ruleName);
    this.stepper?.to(1);
    const ruleIndex = this.ruleList.findIndex(
      (x) => x.businessRule.ruleName === ruleName
    );
    const currentRule = cloneDeep(this.ruleList[ruleIndex].businessRule);

    //////
    if (
      currentRule.selectedAction == ACTIONS.CHAIN_DEMO_QUESTIONS ||
      currentRule.selectedAction == ACTIONS.THREADING_DEMO_QUESTIONS
    ) {
      if (
        currentRule.selectedPage === 'personal_info' ||
        currentRule.selectedWorkflow === 'pageCustomization'
      ) {
        this.config = cloneDeep(visaLetterConfig);
      } else if(currentRule.selectedPage === 'session_event' || currentRule.selectedPage === 'add_on') {
        this.config = cloneDeep(sessionThreadingConfig);
      } else {
        this.config = cloneDeep(this.orgConfig);
        this.config.fields = {
          questionList: cloneDeep(this.orgConfig).fields.questionList,
        };
        this.config = cloneDeep(this.config);
      }
    } else if (currentRule.selectedAction == 'Change Workflow Page Order') {
      this.config.fields = {};
      this.config = cloneDeep(this.config);
    } else if (
      currentRule.selectedAction == ACTIONS.REGTYPE_DETERMINATION ||
      currentRule.selectedAction == ACTIONS.RECOMMEND_PACKAGE ||
      currentRule.selectedAction == ACTIONS.RECOMMEND_SESSION ||
      currentRule.selectedAction == ACTIONS.COMMUNICATION_DETERMINATION ||
      currentRule.selectedAction == ACTIONS.ADDITIONAL_REGISTRANTS
    ) {
      this.config = cloneDeep(regTypeDetermineConfig);
    } else if (currentRule.selectedAction == ACTIONS.RECOMMEND_DISCOUNT) {
      this.config = cloneDeep(discountConfig);
    } else {
      this.config = cloneDeep(this.orgConfig);
    }
    this.refreshConfig();
    //////
    this.currentRule = currentRule;

    this.pageList = this.displayPages.find(
      (dp) => dp.name === this.currentRule.selectedWorkflow
    )?.value;

    this.currentRule.regType = this.currentRule.regType.toLowerCase();
    // this.queryCtrl.setValue(this.currentRule.query);
    this.editIndex = ruleIndex;
  }

  get headers() {
    let headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Access-Control-Allow-Headers', 'Content-Type')
      .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .set('Access-Control-Allow-Origin', '*');

    if (localStorage.getItem('Authorization')) {
      headers = new HttpHeaders()
        .set('content-type', 'application/json')
        .set('Access-Control-Allow-Headers', 'Content-Type')
        .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        .set('Access-Control-Allow-Origin', '*')
        .set('Authorization', localStorage.getItem('Authorization'));
    }
    return headers;
  }

  excecuteRules() {
    const businessRules = this.ruleList.map((rule) => ({
      brID: rule.brID,
      businessRule: rule.businessRule,
    }));
    // const body = {
    //   // evtUid: this.myEventID,
    //   businessRules: businessRules
    // }
    // this.http.post(API_URL2 + '/csi/event/services/eventSetupV2/addBusinessRules', body, { headers: this.headers }).subscribe((x: any) => {
    //   if (x.statusCode == 200) {
    //     this.toastService.show('Business rules executed successfully', {
    //       delay: 6000,
    //       classname: 'bg-success text-light',
    //       headertext: 'Success',
    //       autohide: true,
    //     });
    //     this.resetRule();
    //     this.stepper?.to(1);
    //     this.setDefaultRegType();
    //     this.getFilteredDiscounts();
    //     this.getFilteredPackages();
    //   }
    // })
    this.updateBussinessRules.emit(businessRules);

    this.toastService.show('Business rules executed successfully', {
      delay: 6000,
      classname: 'bg-success text-light',
      headertext: 'Success',
      autohide: true,
    });
    this.resetRule();
    this.stepper?.to(1);
    this.setDefaultRegType();
    this.getFilteredDiscounts();
    this.getFilteredPackages();
  }

  getDisplayMessage(rule) {
    let finalStr = '';
    if (rule.ruleName) {
      finalStr += 'Rule name: ' + rule.ruleName + ', ';
    }
    if (rule.selectedAction) {
      finalStr += 'Action: ' + rule.selectedAction + ', ';
    }
    if (rule.createdQualification && rule.createdQualification.qualName) {
      finalStr += 'Qualification: ' + rule.createdQualification.qualName + ', ';
    }
    if (rule.createdQuestion && rule.createdQuestion.description) {
      finalStr += 'Question: ' + rule.createdQuestion.description;
    }
    if (rule.selectedWorkflow && rule.selectedPage) {
      finalStr +=
        'Page: ' +
        this.displayPages
          .find((el) => el.name === rule.selectedWorkflow)
          ?.value.find((pg) => pg.name === rule.selectedPage)?.label;
    }
    return finalStr;
  }

  duplicateRule(ruleName) {
    this.editIndex = -1;
    const ruleIndex = this.ruleList.findIndex(
      (x) => x.businessRule.ruleName === ruleName
    );
    this.currentRule = cloneDeep(this.ruleList[ruleIndex].businessRule);
    this.currentRule.ruleName = '';
    this.currentRule.isPublished = true;
    // this.queryCtrl.setValue(this.currentRule.query);
  }

  // changePublish(index, text) {
  //   this.ruleList[index].businessRule.isPublished = !this.ruleList[index].businessRule.isPublished;
  //   if (this.editIndex > -1) {
  //     this.currentRule.isPublished = this.ruleList[index].businessRule.isPublished;
  //   }
  //   this.toastService.show('Business rule successfully ' + text, {
  //     delay: 6000,
  //     classname: 'bg-success text-light',
  //     headertext: 'Success',
  //     autohide: true,
  //   });
  // }
  isEmpty(obj) {
    return obj == null || Object.keys(obj).length === 0;
  }

  onQuestionSelect(questionName) {
    this.config.fields.question = cloneDeep(
      this.questions.find((x) => x.name == questionName)
    );
    this.config.fields.question.name = 'question';
  }

  onRegTypeChange(value) {
    const currentRule = { ...this.currentRule };

    this.resetRule(this.editIndex);
    this.currentRule.ruleName = currentRule.ruleName;
    this.currentRule.selectedWorkflow = currentRule.selectedWorkflow;
    this.currentRule.selectedPage = currentRule.selectedPage;

    this.currentRule.regType = value.toLowerCase();
    this.getFilteredDiscounts();
    this.getFilteredPackages();
  }

  onWorkflowChange(value) {
    this.currentRule.selectedWorkflow = value;
    this.pageList = this.displayPages.find((dp) => dp.name === value)?.value;
    this.currentRule.selectedPage = this.pageList[0]?.name;
  }

  onPageChange(value) {
    this.currentRule.selectedPage = value;
  }

  isInactiveAction(actionName) {
    return [
      'Change Workflow Page Order',
      ACTIONS.REGTYPE_DETERMINATION,
    ].includes(actionName); //Regtype Determination
  }

  next(currentPageName) {
    if (!this.isValidFwd(currentPageName)) {
      return;
    }
    // if(this.editIndex == -1){

    // }
    this.modifyConfig(currentPageName);
    this.stepper.next();
  }

  modifyRule(currentPageName: string) {
    if (
      currentPageName == this.pageNames.action_details &&
      (this.currentRule.selectedAction == ACTIONS.CHAIN_DEMO_QUESTIONS ||
        this.currentRule.selectedAction == ACTIONS.THREADING_DEMO_QUESTIONS)
    ) {
      if (
        this.currentRule.selectedPage === 'personal_info' ||
        this.currentRule.selectedWorkflow === 'pageCustomization'
      ) {
        this.currentRule.query = getDefaultQueryWithType('attendee');
      } else {
        this.currentRule.query = getDefaultQueryWithType('questionList');
      }
    } else if (
      currentPageName == this.pageNames.action_details &&
      this.currentRule.selectedAction == 'Change Workflow Page Order'
    ) {
      this.currentRule.query = getDefaultQueryWithType();
    } else if (
      this.currentRule.selectedAction == ACTIONS.REGTYPE_DETERMINATION ||
      this.currentRule.selectedAction == ACTIONS.RECOMMEND_PACKAGE ||
      this.currentRule.selectedAction == ACTIONS.RECOMMEND_SESSION ||
      this.currentRule.selectedAction == ACTIONS.RECOMMEND_DISCOUNT || 
      this.currentRule.selectedAction == ACTIONS.COMMUNICATION_DETERMINATION ||
      this.currentRule.selectedAction == ACTIONS.ADDITIONAL_REGISTRANTS
    ) {
      this.currentRule.query = getDefaultQueryWithType('attendee');
    } else {
      this.currentRule.query = getDefaultQueryWithType('attendeeName');
    }
  }

  modifyConfig(currentPageName: string) {
    if (currentPageName != this.pageNames.action_details) {
      return;
    }
    if (
      this.currentRule.selectedAction == ACTIONS.CHAIN_DEMO_QUESTIONS ||
      this.currentRule.selectedAction == ACTIONS.THREADING_DEMO_QUESTIONS
    ) {
      if (
        this.currentRule.selectedPage === 'personal_info' ||
        this.currentRule.selectedWorkflow === 'pageCustomization'
      ) {
        this.config = cloneDeep(visaLetterConfig);
      } else if(this.currentRule.selectedPage === 'session_event' || this.currentRule.selectedPage === 'add_on') {
        this.config = cloneDeep(sessionThreadingConfig);
      } else {
        this.config = cloneDeep(this.orgConfig);
        this.config.fields = {
          questionList: cloneDeep(this.orgConfig).fields.questionList,
        };
        this.config = cloneDeep(this.config);
      }
    } else if (
      this.currentRule.selectedAction == 'Change Workflow Page Order'
    ) {
      this.config.fields = {};
      this.config = cloneDeep(this.config);
    } else if (
      this.currentRule.selectedAction == ACTIONS.REGTYPE_DETERMINATION ||
      this.currentRule.selectedAction == ACTIONS.RECOMMEND_PACKAGE ||
      this.currentRule.selectedAction == ACTIONS.RECOMMEND_SESSION || 
      this.currentRule.selectedAction == ACTIONS.COMMUNICATION_DETERMINATION ||
      this.currentRule.selectedAction == ACTIONS.ADDITIONAL_REGISTRANTS
    ) {
      this.config = cloneDeep(regTypeDetermineConfig);
    } else if (this.currentRule.selectedAction == ACTIONS.RECOMMEND_DISCOUNT) {
      this.config = cloneDeep(discountConfig);
    } else {
      this.config = cloneDeep(this.orgConfig);
    }
    console.error("test log: ", this.config);
    
    this.refreshConfig();
  }

  refreshConfig() {
    this.currentRule.query = cloneDeep(this.currentRule.query);
  }

  previous() {
    this.stepper.previous();
  }

  isValidFwd(currentPageName) {
    if (currentPageName == this.pageNames.rule) {
      if (!this.currentRule.ruleName) {
        this.showWarningMsg('Please enter rule name');
        return false;
      }

      if (
        this.editIndex < 0 &&
        this.ruleList.find(
          (rule) =>
            rule.businessRule.ruleName?.toLowerCase() ==
            this.currentRule.ruleName.toLowerCase()
        )
      ) {
        this.showWarningMsg('Rule name already exists');
        return false;
      }
    } else if (currentPageName == this.pageNames.action_details) {
      if (
        this.isEmpty(this.currentRule.actionData) &&
        this.currentRule.selectedAction != ACTIONS.CHAIN_DEMO_QUESTIONS &&
        this.currentRule.selectedAction != ACTIONS.THREADING_DEMO_QUESTIONS
      ) {
        this.showWarningMsg('No action Details not saved');
        return false;
      }
    }
    return true;
  }

  deleteRule(rule) {
    this.http
      .get(
        API_URL2 +
          `/csi/event/services/eventSetupV2/deleteBusinessRuleById?brId=${rule.brID}`,
        { headers: this.headers }
      )
      .subscribe((x: any) => {
        if (x.statusCode == 200 || x.statusCode == 400) {
          this.toastService.show('Business rule deleted successfully', {
            delay: 6000,
            classname: 'bg-success text-light',
            headertext: 'Success',
            autohide: true,
          });
          this.ruleList = this.ruleList.filter(
            (_rule) => _rule.brID != rule.brID
          );
          const businessRules = this.ruleList.map((rule) => ({
            brID: rule.brID,
            businessRule: rule.businessRule,
          }));
          this.updateBussinessRules.emit(businessRules);
          this.resetRule();
          this.setDefaultRegType();
        }
      });
  }

  createNewRule() {
    this.resetRule();
    this.stepper?.to(1);
    this.setDefaultRegType();
    this.getFilteredDiscounts();
    this.getFilteredPackages();
  }
}
