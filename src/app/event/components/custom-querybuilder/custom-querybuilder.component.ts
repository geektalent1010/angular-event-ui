import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Field, Option, QueryBuilderComponent, RuleSet } from "angular2-query-builder";
import cloneDeep from 'lodash/cloneDeep';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { defaultLocaleMonthsShort } from 'ngx-bootstrap/chronos/locale/locale.class';
import * as moment from 'moment';
import { ACTION } from 'src/app/components/angular-chat-ui-kit/components/utils/enums';
import { ACTIONS } from '../business-rules-qb/business-rules-qb.component';
import { countryCodes, languageCodes } from '../event-info/constants';

const attendeeFields = [
  "Regcode",
  "Regtypeevtcode",
  "Reg2evtcode",
  "Reg3evtcode",
  "Reg4evtcode",
  "text1",
  "text2",
  "text3",
  "text4",
  "text5",
  "text6",
  "text7",
  "text8",
  "Membershipflag",
  "Memberid",
  "Qualevtcode",
  "geocode",
  "country",
  "socsecno",
  "labelEvtCode",
  "pieceEvtCode",
  "visaRequired",
  "attendStatusCode",
  // "language",
]

@Component({
  selector: 'app-custom-querybuilder',
  templateUrl: './custom-querybuilder.component.html',
  styleUrls: ['./custom-querybuilder.component.scss']
})

export class CustomQuerybuilderComponent extends QueryBuilderComponent implements OnInit, OnChanges {
  readonly ACTIONS = ACTIONS
  _defaultRegType: string;
  _selectedAction: string;
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'questionName',
    textField: 'questionName',
    itemsShowLimit: 6,
    allowSearchFilter: true
  };
  
  @Input() set defaultRegType(value: string) {
    this._defaultRegType = value;
    this.questions = [];
    this.setPollingTypes();
  };
  get defaultRegType() {
    return this._defaultRegType;
  }

  @Input() set selectedAction(value: string) {
    this._selectedAction = value;
    this.setPollingTypes();

  };
  get selectedAction() {
    return this._selectedAction;
  }

  @Input() questionData;
  // @Input() isChainingDemoQuestion;
  @Input() data;
  @Input() regTypeInp;
  @Input() sessions;

  pollingTypes;
  questions;
  questionsAndAnswers: any = {};
  groupsArr = [...Array(10).keys()].map(x => x+1);

  // attendeeFields = attendeeFields;

  constructor(private ref: ChangeDetectorRef) {
    super(ref);
  }

  ngOnInit() {
    this.setPollingTypes();
  }
  ngOnchanges(){
    
  }

  setPollingTypes() {
    this.pollingTypes = this.questionData.filter(x =>Array(...x.category).find(v => v.toLowerCase() == this._defaultRegType?.toLowerCase()) && (x.checked == 'true' || x.checked == true))
      .map(x => x.pollingType);
    this.pollingTypes = [...new Set(this.pollingTypes)];

    if (this.data && this.data.rules && this.data.rules.length > 0) {
      this.questions = this.questionData.filter(x => Array(...x.category).find(v => v.toLowerCase() == this._defaultRegType?.toLowerCase()) && x.pollingType == this.data.rules[0].pollingType && ( x.checked == 'true' || x.checked == true))
      .map((x:any) => ({ question: x.question, questionName: x.questionName }));
    }
  }

  // categoryChanged(): void {
  //   this.questions = this.questionData.filter(x => Array(...x.category).find(v => v.toLowerCase() == this._defaultRegType?.toLowerCase()) && (this.isChainingDemoQuestion || x.checked == 'true' || x.checked == true))
  //     .map(x => x.question);
  //   this.setPollingTypes();
  // }

  get attendeeFields() {
    if (this.selectedAction === 'Recommend Discount') {
      return [...attendeeFields, 'promocode', 'adddate', 'userid'];
    } else {
      return attendeeFields;
    }
  }
  changeField(field, rule) {
    if (rule.field === 'attendee' || rule.field === 'member') {
      rule.attendeeField = '';
    }
  }

  attendeFieldChanged(attendeeField, rule) {
    rule.value = '';
  }

  getOptionsforAttendee(rule) {
    if (rule.attendeeField === 'Regcode') {
      return {type: 'select', value: [{name: "ATT", value: "ATT"}, {name: "EXH", value: "EXH"}, {name: "SHO", value: "SHO"}]};
    } else if (rule.attendeeField === 'Regtypeevtcode') {
      return {type: 'select', value: this.regTypeInp.map(element => ({name: element.code + ' - ' + element.description, value: element.code + ' - ' + element.description}))};
    } else if (rule.attendeeField === 'Membershipflag') {
      return {type: 'select', value: [{name: "true", value: "true"}, {name: "false", value: "false"}]};
    } else if (rule.attendeeField === 'Qualevtcode') {
      return {type: 'select', value: [{name: "Approved", value: "Approved"}, {name: "Pending", value: "Pending"}]};
    } else if (rule.attendeeField === 'geocode') {
      return {type: 'select', value: [{name: 0, value: 0}, {name: 1, value: 1}, {name: 2, value: 2}]};
    } else if (rule.attendeeField === 'country') {
      return {type: 'select', value: countryCodes.map(cc => ({name: cc.name, value: cc.code}))};
    } else if (rule.attendeeField === 'adddate') {
      return {type: 'daterange', value: []};
    } else if (rule.attendeeField === 'visaRequired') {
      return {type: 'select', value: [{name: "true", value: "true"}, {name: "false", value: "false"}]};
    } else if (rule.attendeeField === 'attendStatusCode') {
      return {type: 'select', value: [{name: "A", value: "A"}, {name: "V", value: "V"}, {name: "O", value: "O"}, {name: "P", value: "P"}, {name: "D", value: "D"}]};
    } else if (rule.attendeeField === 'text3') {
      return {type: 'select', value: languageCodes.map(cc => ({name: cc.language, value: cc.code}))};
    } else {
      return {type: 'text', value: []};
    }
  }

  dateRangeCreated(event, rule) {
    if (event && event.length > 1) {
      rule.value = moment(event[0]).format("YYYY-MM-DD") + " - " + moment(event[1]).format("YYYY-MM-DD");
    }
  }
  
  identify(index, item) {
    return item.name;
  }

  pollingTypeChanged(pollingType, rule) {
    this.questions = this.questionData.filter(x => Array(...x.category).find(v => v.toLowerCase() == this._defaultRegType?.toLowerCase()) && x.pollingType == pollingType && ( x.checked == 'true' || x.checked == true))
      .map((x:any) => ({ question: x.question, questionName: x.questionName }));
    rule.question = '';
    rule.value = '';
  }

  getDetails(question) {
    let details = {
      type: 'Freetext',
      demDetails: []
    }
    const ques = this.questionData.find(questionData => questionData.question?.trim() == question?.trim());
    // this.config.fields['questionList']['options'] = [];
    if(this.questionsAndAnswers[question]){
      return this.questionsAndAnswers[question];
    }
    let tempDemDetails = []
    if (!ques) {
      return details;
    }
    if (ques.demDetails && ques.demDetails.length > 0) {
      ques.demDetails.forEach(q => {
        tempDemDetails.push({ name: q.dedDescription, value: q.dedValue });
      });
      ques.demDetails = [
        ...new Map(
          ques.demDetails.map((v) => [v.dedDescription, v])
        ).values(),
        ]
    }
    details.type = ques.responseLayout;
    details.demDetails = tempDemDetails;
    this.questionsAndAnswers[question] =  details;
    // console.log("this.questionsAndAnswers",this.questionsAndAnswers)
    return details;
  }

  questionChanged(question: string, rule): void {
    rule.value = '';
    if(question == ''){
      this.pollingTypeChanged(rule.pollingType,rule);
      return;
    }
    const details = this.getDetails(question)
    if (details.length > 0) {
      // this.config.fields['questionList']['type'] = "category";
      this.config.fields['questionList']['options'] = details;
    } else {
      // this.config.fields['questionList']['type'] = "string";
    }
    this.config = JSON.parse(JSON.stringify(this.config));
  }

  customRemoveRuleSet(ruleSet, i) {
    ruleSet.splice(i, 1);
  }

  canShowBuilder(config){
    if(Object.keys(config.fields).length > 0){
      return true;
    }
    return false;
  }


  getCustomOptions(rule) {   
      return this.config.fields[rule.field]['options'];
  }

  onCheckAny(rule){
    rule.checkAny = !rule.checkAny;
    if(rule.checkAny){
      rule.value = '';
    }
  }

  onGroupChange(rule){
    let noGroupFlag = false;
    let maxGrpValue;
    for(let i=this.data.rules.length-2; i>=0; i--){
      if(this.data.rules[i].group){
        maxGrpValue = parseInt(this.data.rules[i].group);
        break;
      }
      noGroupFlag = true;
    }
    if(rule.group && maxGrpValue && ((noGroupFlag && rule.group != maxGrpValue+1) || (!noGroupFlag && rule.group != maxGrpValue && rule.group != maxGrpValue+1))){
      rule.group = '';
      this.data = cloneDeep(this.data);
      alert("please check group sequence");
    }

    // let minGroupVal;
    // for(let i=0; i<this.data.rules.length; i++){
    //   if(minGroupVal &&  
    //       this.data.rules[i].group && 
    //       this.data.rules[i].group != minGroupVal &&
    //       this.data.rules[i].group != minGroupVal+1 ){

    //     rule.group = '';
    //     this.data = cloneDeep(this.data);
    //     alert("please check group sequence");
    //     break;
    //   }
    //   if(this.data.rules[i].group){
    //     minGroupVal = parseInt(this.data.rules[i].group);
    //   }
    // }
  }

  isLastIndex(rule){
    return this.data.rules.findIndex(x => x == rule) == this.data.rules.length-1;
  }

  onAddRule(addRule){
    this.questions = []
    addRule();
    if(this.selectedAction == ACTIONS.CHAIN_DEMO_QUESTIONS){
      this.data.rules[this.data.rules.length - 1].group = '';
    }
    // if(this.selectedAction == ACTIONS.THREADING_DEMO_QUESTIONS){
    //   this.data.rules[this.data.rules.length - 1].next = [''];
    // }
  }

  showInputType(rule){
    const type = this.getDetails(rule.question).type;
    if(type == 'Freetext'){
      return 'text'
    } else if(type == 'DateInput'){
      return 'date'
    } else {
      return 'select'
    }
  }

  getQuestionName(rule){
    const id =  this.questionData?.find(quest => quest.question == rule.question)?.questionName;
    if(id != rule.questionName){
      rule.questionName = id;
    }
    return id?id:"";
  }

  getQuestions(rule){
   return this.questionData.filter(x => Array(...x.category).find(v => v.toLowerCase() == this._defaultRegType?.toLowerCase()) && x.pollingType == rule.pollingType && ( x.checked == 'true' || x.checked == true))
      .map((x:any) => ({ question: x.question, questionName: x.questionName }))
  }

}