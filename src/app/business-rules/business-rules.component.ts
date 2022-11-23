import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  DoCheck,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MdbTableDirective } from 'angular-bootstrap-md';
import {
  QueryBuilderComponent,
  QueryBuilderConfig,
  Rule,
  RuleSet
} from 'angular2-query-builder';
import { timeStamp } from 'console';
import { isValid } from 'date-fns';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Observable } from 'rxjs';
import { SessionServiceService } from '../services/session-service.service';
import { API_URL2 } from '../services/url/url';

const pageNames = [
  {
    id: 'login',
    name: 'Login',
    data: [
      { id: 'email', name: 'Email' },
      { id: 'password', name: 'Password' }
    ]
  },
  {
    id: 'registration',
    name: 'Registraion',
    data: [
      { id: 'email', name: 'Email' },
      { id: 'firstName', name: 'First Name' },
      { id: 'lastName', name: 'Last Name' }
    ]
  },
  {
    id: 'personalInfo',
    name: 'Personal Information',
    data: [
      { id: 'attendeeRegType', name: 'Attendee Reg Type' },
      { id: 'country', name: 'Country' },
      { id: 'membershipStatus', name: 'Membership Status' },
      { id: 'firstName', name: 'First Name' },
      { id: 'lastName', name: 'Last Name' },
      { id: 'badgeFirstName', name: 'Badge First Name' },
      { id: 'jobTitle', name: 'Job Title' },
      { id: 'companyName', name: 'Company Name' },
      { id: 'address1', name: 'Address 1' },
      { id: 'address2', name: 'Address 2' },
      { id: 'zipPostalCode', name: 'Zip/Postal Code' },
      { id: 'city', name: 'City' },
      { id: 'country', name: 'Country' },
      { id: 'workPhoneNumber', name: 'Work Phone Number' },
      { id: 'mobilePhoneNumber', name: 'Mobile Phone number' },
      { id: 'emailAddress', name: 'Email Address' },
      { id: 'additionalEmail', name: 'Additional Email Address' },
      { id: 'specialAccomodation', name: 'Special Accomodation' },
      { id: 'communicationPreferences', name: 'Communication Preferences' }
    ]
  },
  {
    id: 'demographic',
    name: 'Demographic',
    data: [{ id: 'question', name: 'Question' }]
  },
  {
    id: 'sessionsAndEvents',
    name: 'sessions & Events',
    data: [
      { id: 'type', name: 'Type' },
      { id: 'title', name: 'Title' },
      { id: 'startDateTime', name: 'Start Date/Time' },
      { id: 'endDateTime', name: 'End Date/Time' },
      { id: 'rate', name: 'Rate' },
      { id: 'favorite', name: 'Favorite' },
      { id: 'sellingFast', name: 'Selling Fast' }
    ]
  },
  {
    id: 'reviewAndPaymentInfo',
    name: 'Review & Payment Information',
    data: [
      { id: 'vipCode', name: 'Vip Code' },
      { id: 'gpay', name: 'Gpay' },
      { id: 'description', name: 'Description' },
      { id: 'quantity', name: 'Quantity' },
      { id: 'rate', name: 'Rate' }
    ]
  },
  { id: 'registrationWfl', name: 'Registraion Workflow', data: [] },
  {
    id: 'eventCosts',
    name: 'Event Costs',
    data: [{ id: 'memberShipRate', name: 'Membership Rate' }]
  }
];
const defaultActions = [
  // { id: 'setFieldValue', name: 'Set Field Value' },
  // { id: 'displayNotification', name: 'Display Notification' },
  // { id: 'callApi', name: 'Call Api' },
  { id: 'newPckg', name: 'Add new Option' },
  { id: 'setRegType', name: 'Set RegType' },
  { id: 'filterSession', name: 'Filter Session' },
  { id: 'newQulification', name: 'Add new Qualification' },
  { id: 'setDiscount', name: 'Set Discount' },
];

const defaultConfig: QueryBuilderConfig = {
  fields: {
    responseValue: {
      name: 'Response Value',
      type: 'string'
    }
  }
};

const defaultQuery = {
  condition: 'or',
  rules: []
};

const defaultQuestions = [
  {
    id: 'dayCode',
    name: 'Day Code',
    question: 'which day will you attend the show?',
    rules: [
      { field: 'responseValue', operator: '=', value: 'Sunday' },
      { field: 'responseValue', operator: '=', value: 'Monday' },
      { field: 'responseValue', operator: '=', value: 'Tuesday' }
    ],
    config: { ...defaultConfig },
    selected: false
  },
  {
    id: 'visa_q1',
    name: 'Visa letter Requirement',
    question: 'Are you a resident of US?',
    rules: [{ field: 'responseValue', operator: '=', value: 'US' },
            { field: 'responseValue', operator: '=', value: 'Non-US' }],
    config: { ...defaultConfig },
    selected: false
  },
  {
    id: 'mem_q1',
    name: 'Membership',
    question: 'Are you a Member?',
    rules: [{ field: 'responseValue', operator: '=', value: 'Yes' },
            { field: 'responseValue', operator: '=', value: 'No' }],
    config: { ...defaultConfig },
    selected: false
  },
  {
    id: 'mem_q2',
    name: 'Membership ID',
    question: 'what is your Member ID ?',
    rules: [{ field: 'responseValue', operator: '=', value: '80980' },
         { field: 'responseValue', operator: '=', value: '70890' }],
    config: { ...defaultConfig },
    selected: false
  }
];

@Component({
  selector: 'app-business-rules',
  templateUrl: './business-rules.component.html',
  styleUrls: ['./business-rules.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class BusinessRulesComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild(MdbTableDirective, { static: true }) mdbTable: MdbTableDirective;
  @Input() eventCosts: any;
  @Input() jobsCategory: any;
  @Input() sessions: any;
  @Input() questionElements: any;
  @Input() discountList: any;
  public apiData = [];
  @ViewChild(QueryBuilderComponent, { static: true })
  queryBuilder: QueryBuilderComponent;
  newTrigger;
  isEnableSelFields = false;
  isEnableQueryBuilder = false;
  isAddNewType = false;
  newType = '';
  config = { ...defaultConfig };
  pageNames = [...pageNames];
  questionText='';
  FIELDSELECTION = 'Field Selection';
  REGTYPESELECTOR = 'RegType Selector'
  DEMOGRAPHIC_QUESTION_RESPONSE =  'Demographic Question Response';
  FILE_LOADS='File loads';
  qualifications = [
    {
      name: 'Paystub',
      id: 'paystub'
    },
    {
      name: 'Photo ID',
      id: 'photoId'
    },
    {
      name: 'Business License',
      id: 'businessLicense'
    },
    {
      name: 'Business Tax ID Number (EIN)',
      id: 'busTaxIdNum'
    }
  ];
  triggers = [
    {
      name: this.DEMOGRAPHIC_QUESTION_RESPONSE,
      description: this.DEMOGRAPHIC_QUESTION_RESPONSE,
      isSelected: false,
      questions: [],
      appliesTo: "",
      fieldSelection: {
        pageName: '',
        FieldName: '',
        condition: 'equal',
        fieldValue: ''
      }
    },
    {
      name: this.REGTYPESELECTOR,
      description: this.REGTYPESELECTOR,
      isSelected: false,
      questions: [],
      appliesTo: "",
      fieldSelection: {
        pageName: '',
        FieldName: '',
        condition: 'equal',
        fieldValue: ''
      },
      fieldLoad: {
        fileName: '',
        typeOfTransfer: ''
      }
    },
    {
      name: this.FIELDSELECTION,
      description: this.FIELDSELECTION,
      isSelected: false,
      questions: [],
      appliesTo: "",
      fieldSelection: {
        pageName: '',
        FieldName: '',
        condition: 'equal',
        fieldValue: ''
      },
      fieldLoad: {
        fileName: '',
        typeOfTransfer: ''
      }
    },
    {
      name: this.FILE_LOADS,
      description: this.FILE_LOADS,
      isSelected: false,
      questions: [],
      appliesTo: "",
      fieldSelection: {
        pageName: '',
        FieldName: '',
        condition: 'equal',
        fieldValue: ''
      },
      fieldLoad: {
        fileName: '',
        typeOfTransfer: ''
      }
    },
    // {
    //   name: 'if field conditional',
    //   description: 'if field conditional',
    //   isSelected: false
    // }
  ];
  // IFTRIGGERNAME = this.triggers[1].name;
  rules = [
    {
      name: 'RegType Determination',
      description: 'RegType Determination',
      actions: [...defaultActions],
      action:"",
      triggers: this.deepCopy(this.triggers),
      isRuleSelected: false
    },
    {
      name: 'Custom Visa Letter Requirement',
      description: 'visa letter Requirement',
      actions: [...defaultActions],
      action:"",
      triggers: this.deepCopy(this.triggers),
      isRuleSelected: false
    },
    {
      name: 'Custom Membership',
      description: 'Membership',
      actions: [...defaultActions],
      action:"",
      triggers: this.deepCopy(this.triggers),
      isRuleSelected: false
    }
  ];
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'value',
    textField: 'label',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 6,
    allowSearchFilter: true
  };

  activeRule: any = {triggers: []};
  // newQuestion = '';
  pageFieldsSource = [];
  conditionsPageFieldsSource = [];
  activeSection = 'section1';
  activeConditionTab = 'appliesTo';
  activeConfigTab = 'tab1';
  businessRuleForm: FormGroup;
  createNewRulesForm: FormGroup;
  configDetailsForm: FormGroup;
  actionsForm: FormGroup = null;
  setRegType ="";
  setDiscount = "";
  filterSession = [];
  packageDetailsForm: FormGroup = null;
  queryCtrl: FormControl;
  query: RuleSet = { ...defaultQuery };
  oDataFilter: string = 'hello';
  selectedQuestionIndex: number;
  payLoad = [];
  isEdit = false;
  url = API_URL2+'/csi/event/services/eventSetupV2';
  errors = {} as any;
  actionDialogsSaved = {}
  selectedTriggerIndex: number;
  selectFieldForm: FormGroup;
  displayQuestionElements = [];
  orgQuestionElements = [];
  searchQuestionsBy=""
  constructor(private fb: FormBuilder, private modalService: NgbModal, private http: HttpClient, private sessionServiceService: SessionServiceService) {}
  ngOnChanges(changes: SimpleChanges): void {
    if(changes.questionElements){
      this.orgQuestionElements = [...this.deepCopy(this.questionElements),...this.orgQuestionElements];
      this.orgQuestionElements = Object.values(this.orgQuestionElements.reduce((r, { PollingType, category, question,...rest }) => {
        const key = `${PollingType}-${category}-${question}`;
        r[key] = r[key] || { PollingType, category, question,...rest };
        return r;
      }, {}))

     this.orgQuestionElements.forEach(element => {
       element.checked = false;
       element.selectedDedDescription = "";
     });
     this.mdbTable.setDataSource(this.deepCopy(this.orgQuestionElements));
     this.searchItems(true);
    }
  }

  ngAfterViewInit(): void {
    this.orgQuestionElements = this.deepCopy(this.questionElements);
    this.orgQuestionElements.forEach(element => {
      element.checked = false,
      element.selectedDedDescription = "";
    });
    this.mdbTable.setDataSource(this.deepCopy(this.orgQuestionElements));
  }

 

  loadData() {
    this.isEdit = true;
    this.payLoad = this.apiData;
    this.rules = [];
    this.payLoad.forEach(rule => {
      (this.rules as any).push({
        name: rule.ruleName,
        description: rule.ruleName,
        actions: [...defaultActions]
      });
      if(rule.isRuleSelected){
        this.onRuleSelect(this.rules[this.rules.length -1 ]);
      }
    });
    if(this.rules.length > 0){

    }
  }

  resetErrors(){
    this.errors = {
      ruleName: false,
      trigger: false,
      conditions: false,
      questionText: false,
      packageDetails: false
    }
  }

  ngOnInit(): void {
    this.initForm();
    this.saveDefaultRules();
    this.resetErrors();
  }

  saveDefaultRules(){
    this.rules.forEach(rule => {
      this.onRuleSelect(rule);
      this.saveBusinessRules(false);
    });
    this.resetBusinessRules();
  }

  deepCopy(obj) {
    if(typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if(obj instanceof Date) {
        return new Date(obj.getTime());
    }

    if(obj instanceof Array) {
        return obj.reduce((arr, item, i) => {
            arr[i] = this.deepCopy(item);
            return arr;
        }, []);
    }

    if(obj instanceof Object) {
        return Object.keys(obj).reduce((newObj, key) => {
            newObj[key] = this.deepCopy(obj[key]);
            return newObj;
        }, {})
    }
}

  patchData(ruleName) {
    const dataArray = this.deepCopy(this.payLoad);
    let data;
    if (dataArray) {
      data = dataArray.find(x => x.ruleName == ruleName);
    }
    if (data) {
      this.createActionsGroupsById(data.action);
      this.businessRuleForm.patchValue({
        ruleName: data.ruleName,
        action: data.action
      });
      this.rules.forEach(rule => {
        if (rule.name === data.ruleName) {
          rule.triggers = this.deepCopy(data.triggers);
        }
      });
      if (data.configDetails) {
        this.configDetailsForm.patchValue(data.configDetails);
      }
      if (data.packageDetails) {
        this.packageDetailsForm.patchValue(data.packageDetails);
      }
      if (data.actionValues) {
        this.actionsForm.patchValue(data.actionValues);
      }
      if (data.setRegType) {
        this.setRegType = data.setRegType;
      }
      if (data.setDiscount) {
        this.setDiscount = data.setDiscount;
      }
      if (data.filterSession) {
        this.filterSession = data.filterSession;
      }
      
    }
  }

  createActionGroup() {
    return this.fb.group({
      pageName: new FormControl('', Validators.required),
      pageField: new FormControl('', Validators.required),
      fieldValue: new FormControl('', Validators.required)
    });
  }

  createSelectFieldFormGroup() {
    return this.fb.group({
      pageName: new FormControl('', Validators.required),
      pageField: new FormControl('', Validators.required),
      fieldValue: new FormControl('', Validators.required)
    });
  }

  createPackageGroup() {
    return this.fb.group({
      pckgName: new FormControl('', Validators.required),
      pckgDesc: new FormControl('', Validators.required),
      pckgCost: new FormControl('', Validators.required)
    });
  }

  createConfigDetailsGroup() {
    return this.fb.group({
      qualifications: new FormArray(
        this.qualifications.map(c => new FormControl(false))
      )
    });
  }

  initForm() {
    this.businessRuleForm = this.fb.group({
      ruleName: new FormControl('', Validators.required),
      action: new FormControl('', Validators.required),
    });
    this.createNewRulesForm = this.fb.group({
      name: new FormControl(''),
      description: new FormControl('')
    });
    this.selectFieldForm = this.createSelectFieldFormGroup();
    this.selectFieldForm.controls.pageName.valueChanges.subscribe(value => {
      this.selectPageNameById(value);
    });
    this.queryCtrl = this.fb.control(this.query);
  }

  toggleAccordion(section, isContinue?) {
    if (!this.canGoTo(section, isContinue)) {
      return false;
    }
    this.activeSection = section;
  }

  checkIsValidFormIfExist(formName) {
    if (this[formName]) {
      return this[formName].valid;
    }
    return true;
  }

  validateOnExecute(){
    this.markFormGroupTouched(this.businessRuleForm);
    if (!this.businessRuleForm.controls.action.valid) {
      return;
    }
    if (!this.checkIsValidFormIfExist('actionsForm')) {
      this.markFormGroupTouched(this.actionsForm);
      return;
    }
    if (!this.checkIsValidFormIfExist('packageDetailsForm')) {
      this.errors.packageDetails = true;
      return;
    }
    if (!this.checkIsValidFormIfExist('configDetailsForm')) {
      this.errors.configDetails = true;
      return;
    }
    return true
  }

  saveBusinessRules(validationReq = true) {
    if(validationReq){
      this.resetErrors();
      if(!this.validateOnExecute()){
        return;
      }
    }
    const businessRulesForm = { ...this.businessRuleForm.value };
    let ruleIndex = -1;
    this.payLoad.forEach(
      (rule, i) => { 
        if(rule.ruleName == businessRulesForm.ruleName){
          ruleIndex = i;
        }
        rule.isRuleSelected = false;
      }
    );
    const newRule = {
      isRuleSelected: validationReq? true: false,
      ...businessRulesForm,
      triggers: this.activeRule.triggers, //convertedTriggers,
      configDetails: this.configDetails,
      setRegType: this.setRegType,
      setDiscount: this.setDiscount,
      filterSession: this.filterSession,
      actionValues: this.actionsForm ? this.actionsForm.value : null,
      packageDetails: this.packageDetailsForm
        ? this.packageDetailsForm.value
        : null
    };
    if (ruleIndex > -1) {
      this.payLoad[ruleIndex] = newRule;
    } else {
      this.payLoad.push(newRule);
    }

    console.log(this.payLoad);
    this.activeConfigTab = 'tab1';
    this.setCondtionsTabBasedOnTrigger();
    // this.activeConditionTab = 'appliesTo';
    this.toggleAccordion('section1');
    if(validationReq){
      alert('Rule Successfully Executed');
    }
  }

  resetFormIfExist(FormName) {
    if (this[FormName]) {
      this[FormName].reset();
    }
  }

  resetBusinessRules() {
    this.businessRuleForm.reset();
    this.resetFormIfExist('actionsForm');
    this.resetFormIfExist('packageDetailsForm');
    this.resetFormIfExist('configDetailsForm');
    this.resetFormIfExist('selectFieldForm');
    this.displayQuestionElements = [];
    this.query = { ...defaultQuery };
    this.queryCtrl.setValue(this.query);
    this.activeRule = {triggers: []};
    this.setRegType = '';
    this.setDiscount = '';
    this.filterSession = [];
    this.questionText = '';
    this.activeConfigTab = 'tab1';
    this.setCondtionsTabBasedOnTrigger();
    // this.activeConditionTab = 'appliesTo';
    this.selectedTriggerIndex = null;
    this.searchQuestionsBy = "";
    this.resetErrors();
  }

  createActionsGroupsById(actionId) {
    this.actionsForm = null;
    this.packageDetailsForm = null;
    this.configDetailsForm = null;
    if (actionId == 'setFieldValue') {
      this.actionsForm = this.createActionGroup();
      this.actionsForm.controls.pageName.valueChanges.subscribe(value => {
        this.selectPageNameById(value);
      });
    } else if (actionId == 'newPckg') {
      this.packageDetailsForm = this.createPackageGroup();
    } else if (actionId == 'newQulification') {
      this.configDetailsForm = this.createConfigDetailsGroup();
    }
  }

  onChangeActionValue(actionId) {
    this.createActionsGroupsById(actionId);
  }

  selectPageNameById(value) {
    this.pageFieldsSource = this.pageNames.find(x => x.id == value)?.data;
  }

  selectConditionsPageNameById(value) {
    this.conditionsPageFieldsSource = this.pageNames.find(x => x.id == value)?.data;
  }

  addOrSaveNewType() {
    this.isAddNewType = !this.isAddNewType;
    if (!this.newType) {
      return;
    }
    const configDup = { ...this.activeRule.config };
    configDup.fields[this.fieldName] = {
      name: this.newType,
      type: 'string',
      value: this.fieldName
    };
    this.activeRule.config = configDup;
    this.newType = '';
  }

  get fieldName() {
    return this.newType.replace(' ', '');
  }

  openDialog(model) {
    this.modalService.open(model, {
      size: 'lg',
      windowClass: 'modal-custom-newRule'
    });
  }

  saveNewRule() {
    this.rules.push({
      ...this.createNewRulesForm.value,
      triggers: [
        {
          ...this.deepCopy(this.triggers[0])
        }
      ],
      actions: [...defaultActions]
    });
    this.createNewRulesForm.reset();
  }

  selectConditionsTab(tabName) {
    // if(!(this.activeRule.triggers[this.selectedTriggerIndex].appliesTo) && tabName === 'tab2') {return}
    this.activeConditionTab = tabName;
  }

  selectConfigTab(tabName) {
    this.activeConfigTab = tabName;
  }

  getBusinessRule() {
    this.payLoad = this.payLoad.map(x => {
      x.action = x.action || "";
      x.isRuleSelected = x.isRuleSelected || false;
      x.rulesDescr = x.rulesDescr || "";
      return x;
    })
    return this.payLoad;
  }

  onRuleSelect(rule) {
    //first reset all values then set
    this.resetBusinessRules();
    if (this.isEdit || this.payLoad.length > 0) {
      this.patchData(rule.name);
      if(rule.triggers.length > 0){
        this.activeRule = { ...rule };
        let selectedTriggerIndex = rule.triggers.findIndex(trigger => trigger.isSelected);
        if(selectedTriggerIndex > 0){
          this.onTriggerSelect(selectedTriggerIndex, true);
        } else {
          this.onTriggerSelect(0, true);
        }
        this.businessRuleForm.controls.ruleName.setValue(rule.name);
        this.searchItems(true);
        return;
      }
    } else if (this.isEdit) {
      alert('api not loaded');
    }
    //setting values
    this.activeRule = { ...rule };
    this.businessRuleForm.controls.ruleName.setValue(rule.name);
  }

  get actionValues() {
    return this.businessRuleForm.controls.actionValues as FormGroup;
  }

  get configDetails() {
    if (this.configDetailsForm) {
      const config = { ...this.configDetailsForm.value };
      delete config['qualifications'];
      return {
        ...config,
        qualifications: this.configDetailsForm.value.qualifications
          .map((v, i) => (v ? this.qualifications[i].id : null))
          .filter(v => v !== null)
      };
    } else {
      return null;
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onSaveConfig() {
    if (!this.checkIsValidFormIfExist('configDetailsForm')) {
      this.markFormGroupTouched(this.configDetailsForm);
      return;
    }
    this.errors.configDetails = false;
    this.modalService.dismissAll();
  }

  onConditionEdit(index: number) {
    this.isEnableQueryBuilder = true;
    this.selectedQuestionIndex = index;
    this.questionText = this.activeRule.triggers[this.selectedTriggerIndex].questions[index].question;
    this.query.rules = this.activeRule.triggers[this.selectedTriggerIndex].questions[index].rules;
    this.queryCtrl.setValue(this.query);
  }

  saveQuery() {
    this.activeRule.triggers[this.selectedTriggerIndex].questions[this.selectedQuestionIndex] = {
      ...this.activeRule.triggers[this.selectedTriggerIndex].questions[this.selectedQuestionIndex],
      rules: this.query.rules,
      selected: true
    };
    this.selectedQuestionIndex = null;
    this.isEnableQueryBuilder = false;
    this.query = { ...defaultQuery };
  }

  canGoTo(section, alertReq?) {
    let isValid = true;
    if (section == 'section2') {
      isValid = this.businessRuleForm.controls.ruleName.valid;
      if (alertReq && !isValid) {
        this.errors.ruleName = true;
      } else if(alertReq){
        this.errors.ruleName = false;
      }
    } else if (section == 'section3') {
      isValid = this.activeRule.triggers.filter( trigger => trigger.isSelected).length >  0 && this.selectedTriggerIndex != null;
      if (alertReq && !isValid) {
        this.errors.trigger = true;
      } else if(alertReq){
        this.errors.trigger = false;
      }
    } else if (section == 'section4') {
      isValid = this.isValidCondtionTab(alertReq);
    }
    return isValid;
  }

  isValidCondtionTab(alertReq) {
    let isValid = true;
    if(this.activeRule.triggers[this.selectedTriggerIndex] && [this.REGTYPESELECTOR, this.FILE_LOADS, this.FIELDSELECTION].includes(this.activeRule.triggers[this.selectedTriggerIndex].name)){
      return isValid;
    }

    isValid = !!this.activeRule.triggers[this.selectedTriggerIndex]?.appliesTo && (this.activeRule.triggers[this.selectedTriggerIndex]?.questions?.find(q => q.checked && !!(q.selectedDedDescription)));//this.businessRuleForm.controls.appliesTo.valid;
    if (alertReq && !isValid) {
      this.errors.conditions = true;
      this.setCondtionsTabBasedOnTrigger();
      return false;
    }
    if (!isValid) {
      return false;
    }
    return isValid;
  }

  onChangeQuestionText(value) {
    this.activeRule.triggers[this.selectedTriggerIndex].questions[this.selectedQuestionIndex].question = value;
  }

  onSaveRatePackage() {
    if (!this.checkIsValidFormIfExist('packageDetailsForm')) {
      this.markFormGroupTouched(this.packageDetailsForm);
      return;
    }
    this.errors.packageDetails = false;
    this.actionDialogsSaved['packageDetailsForm'] = true;
    this.modalService.dismissAll();
  }

  removeRule(name){
    this.rules = this.rules.filter(rule => rule.name != name);
    this.payLoad = this.payLoad.filter(rule => rule.ruleName != name);
    this.resetBusinessRules();
    alert('rule deleted');
  }

  canShowDelete(ruleName){
    return !['RegType Determination','Custom Visa Letter Requirement','Custom Membership'].includes(ruleName);
  }

  modelOnClose(formName){
    if(!this.actionDialogsSaved[formName]){
      this.resetFormIfExist(formName);
    }
    // const dataArray = this.deepCopy(this.payLoad);
    // let data;
    // if (dataArray) {
    //   data = dataArray.find(x => x.ruleName == this.activeRule.name);
    // }
    this.modalService.dismissAll();
  }

  onTriggerSelect(index, isPatch){
    this.selectedTriggerIndex = index;
    if(!isPatch){
      this.searchItems(true);
    }
    this.setCondtionsTabBasedOnTrigger(index);
  }

  setCondtionsTabBasedOnTrigger(index?){
   if(index != undefined){
    this.selectConditionBasedOnTab(this.activeRule.triggers[index]?.name);
    return;
   }
   index = this.activeRule.triggers.findIndex(trigger => trigger.isSelected);
   if(index < 0){
    this.selectConditionBasedOnTab(this.activeRule.triggers[0]?.name);
   } else {
    this.selectConditionBasedOnTab(this.activeRule.triggers[index]?.name);
   }
  }

  selectConditionBasedOnTab(name){
    if(name == this.FIELDSELECTION ){
      this.selectConditionsTab('fieldSelection');
    } else if(name == this.FILE_LOADS ){
      this.selectConditionsTab('fileloads');
    } else{
      this.selectConditionsTab('appliesTo');
    }
  }

  addTrigger(){
    const trigger = this.triggers.find(trigger => trigger.name === this.newTrigger );
    if(!this.activeRule.triggers.find(trigger => trigger.name === this.newTrigger ) && trigger){ //unique check
      this.activeRule.triggers.push(trigger)
    }
    this.newTrigger = "";
    this.modalService.dismissAll();
  }

  showCondtionTab(tabName){
    if(this.activeRule.triggers[this.selectedTriggerIndex] && this.activeRule.triggers[this.selectedTriggerIndex].name == this.REGTYPESELECTOR ){
      return ['appliesTo'].includes(tabName);
    }
    else if(this.activeRule.triggers[this.selectedTriggerIndex] && this.activeRule.triggers[this.selectedTriggerIndex].name == this.FIELDSELECTION ){
      return ['fieldSelection'].includes(tabName);
    }
    else if(this.activeRule.triggers[this.selectedTriggerIndex] && this.activeRule.triggers[this.selectedTriggerIndex].name == this.FILE_LOADS ){
      return ['fileloads'].includes(tabName);
    } else if(this.activeRule.triggers[this.selectedTriggerIndex]?.name == this.DEMOGRAPHIC_QUESTION_RESPONSE ){
      if(tabName == 'question' && !this.activeRule.triggers[this.selectedTriggerIndex]?.appliesTo){
        return false;
      }
      return ["question",'appliesTo'].includes(tabName);
    }
  }

  onPackageSelect(index){
    const details = this.eventCosts[index].customPackage;
    this.packageDetailsForm.patchValue({
      pckgName:details.name,
      pckgDesc:details.description,
      pckgCost:details.cost 
    })
  }

  searchItems(patchReq?) {
    if (this.selectedTriggerIndex == null || this.selectedTriggerIndex == undefined) {
      return;
    }
    this.displayQuestionElements = [];
    if (this.activeRule.triggers[this.selectedTriggerIndex].appliesTo) {
      this.mdbTable.setDataSource(this.deepCopy(this.orgQuestionElements));
      this.displayQuestionElements = [...this.mdbTable.searchLocalDataByMultipleFields(
        this.activeRule.triggers[this.selectedTriggerIndex].appliesTo, ['category']
      )];
      this.displayQuestionElements = this.displayQuestionElements.filter(question => question.question && question.question.toUpperCase().includes(this.searchQuestionsBy.toUpperCase()))
      if(patchReq){
        this.activeRule.triggers[this.selectedTriggerIndex].questions?.forEach(question => {
          this.displayQuestionElements.forEach(disEle => {
            if (
              question.question == disEle.question &&
              question.category == disEle.category &&
              question.checked
            ) {
              disEle.checked = true;
              disEle.selectedDedDescription = question.selectedDedDescription;
            }
          });
        });
      }
    }
  }

  onSelectDedDesc(question, value){   
    const index = this.activeRule.triggers[this.selectedTriggerIndex].questions.findIndex(disEle => question.question == disEle.question &&
      question.category == disEle.category)
    if(index > -1){
      this.activeRule.triggers[this.selectedTriggerIndex].questions[index].selectedDedDescription = value;
    }
  }

  onQuestionSelectionChange(question, isChecked){
    const index = this.activeRule.triggers[this.selectedTriggerIndex].questions.findIndex(disEle => question.question == disEle.question &&
      question.category == disEle.category)
    if(isChecked){
      this.activeRule.triggers[this.selectedTriggerIndex].questions.push({...question})
    } else {
      this.activeRule.triggers[this.selectedTriggerIndex].questions.splice(index, 1);
    }
  }

}