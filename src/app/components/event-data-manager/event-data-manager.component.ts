import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ButtonGroupContext, InputContext, QueryBuilderClassNames, QueryBuilderConfig } from 'angular2-query-builder';
import tableDragger from 'table-dragger'
import { ImageConstants } from 'src/app/event-pages/imageConstants';
import { fadeAnimation, listAnimation } from 'src/app/shared/animation/app.animations';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventDataManagerCardComponent } from './event-data-manager-card/event-data-manager-card.component';

@Component({
  selector: 'app-event-data-manager',
  templateUrl: './event-data-manager.component.html',
  styleUrls: ['./event-data-manager.component.scss'],
  animations: [fadeAnimation, listAnimation]
})
export class EventDataManagerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('table') tableElement: ElementRef;
  photoID = ImageConstants.photoID;
  currentTab = 1;
  isViewGrid = true;
  isFilterViewGrid = true;
  showAllColumns = true;
  showDiagnostic = false;
  resultArr = [];
  toggleDiagnostic(): void {
    this.showDiagnostic = !this.showDiagnostic;
  }
  toggleView(): void {
    this.isViewGrid = !this.isViewGrid;
  }
  toggleFilterView(): void {
    this.isFilterViewGrid = !this.isFilterViewGrid;
  }
  setTab(tab: number): void {
    this.currentTab = tab;
  }
  applyPreviewHeight() {
    const styles = { 'height': `25vh` };
    return styles;
  }

  query = {
    "condition": "or",
    "rules": [
      {
        "field": "firstName",
        "operator": "="
      },
      {
        "field": "lastName",
        "operator": "="
      },
      {
        "field": "regUId",
        "operator": "="
      },
      {
        "field": "company",
        "operator": "="
      }
    ]
  };

  config: QueryBuilderConfig = {
    fields: {
      recordType: {
        name: 'Record Type',
        type: 'category',
        options: [
          { name: 'Attendee Data', value: 'attendeeData' },
          { name: 'Registration Data', value: 'Registration Data' }
        ]
      },
      regUId: {
        name: 'RegUId',
        type: 'number'
      },
      attendeeUId: {
        name: 'AttendeeUId',
        type: 'number'
      },
      memberUId: {
        name: 'MemberUId',
        type: 'number'
      },
      firstName: {
        name: 'First Name',
        type: 'string'
      },
      lastName: {
        name: 'Last Name',
        type: 'string'
      },
      regType: {
        name: 'Reg Type',
        type: 'category',
        options: [
          { name: 'Attendee Starndard', value: 'Attendee Starndard' },
          { name: 'Exhibitor Starndard', value: 'Exhibitor Starndard' },
          { name: 'Student Starndard', value: 'Student Starndard' },
          { name: 'Media Starndard', value: 'Media Starndard' },
          { name: 'Cancelled Exhibitor DUPLICATE', value: 'Cancelled Exhibitor DUPLICATE' },
          { name: 'Cancelled Virtual Only Attendee', value: 'Cancelled Virtual Only Attendee' },
          { name: 'Education & Exhibits - Basic Mbr', value: 'Education & Exhibits - Basic Mbr' },
          { name: 'Education & Exhibits - Premium Mbr', value: 'Education & Exhibits - Premium Mbr' },
          { name: 'Education & Exhibits - Elite Mbr', value: 'Education & Exhibits - Elite Mbr' },
          { name: 'Education & Exhibits - Non Mbr', value: 'Education & Exhibits - Non Mbr' },
          { name: 'Exhibits Hall Only - Basic Mbr', value: 'Exhibits Hall Only - Basic Mbr' },
          { name: 'Exhibits Hall Only - Premium Mbr', value: 'Exhibits Hall Only - Premium Mbr' },
          { name: 'Exhibits Hall Only - Elite Mbr', value: 'Exhibits Hall Only - Elite Mbr' },
          { name: 'Exhibits Hall Only - Non Mbr', value: 'Exhibits Hall Only - Non Mbr' },
          { name: 'VIP - Basic Mbr', value: 'VIP - Basic Mbr' },
          { name: 'VIP - Premium Mbr', value: 'VIP - Premium Mbr' },
          { name: 'VIP - Elite Mbr', value: 'VIP - Elite Mbr' },
          { name: 'VIP - Non Mbr', value: 'VIP - Non Mbr' },
          { name: 'Speaker - NonMember', value: 'Speaker - NonMember' },
          { name: 'Speaker - BASIC', value: 'Speaker - BASIC' },
          { name: 'Press - Approved PREMIUM', value: 'Press - Approved PREMIUM' },
          { name: 'Press - Approved ELITE', value: 'Press - Approved ELITE' },
          { name: 'Press - Pending NONMEMBER', value: 'Press - Pending NONMEMBER' },
          { name: 'Press - Pending BASIC', value: 'Press - Pending BASIC' },
          { name: 'Press - Pending PREMIUM', value: 'Press - Pending PREMIUM' },
          { name: 'Press - Pending ELITE', value: 'Press - Pending ELITE' },
          { name: 'Press - Denied', value: 'Press - Denied' },
          { name: 'Exhibitor Key Contact - No Badge', value: 'Exhibitor Key Contact - No Badge' },
          { name: 'Exhibitor Dealer - Non-Member', value: 'Exhibitor Dealer - Non-Member' },
          { name: 'Exhibitor Dealer - Basic ', value: 'Exhibitor Dealer - Basic ' },
          { name: 'Exhibitor Dealer - Premium', value: 'Exhibitor Dealer - Premium' },
          { name: 'Exhibitor Dealer - Elite', value: 'Exhibitor Dealer - Elite' },
          { name: 'Exhibitor Distributor - Non-Member', value: 'Exhibitor Distributor - Non-Member' },
          { name: 'Exhibitor Distributor - Basic', value: 'Exhibitor Distributor - Basic' },
          { name: 'Exhibitor Distributor - Premium', value: 'Exhibitor Distributor - Premium' },
          { name: 'Exhibitor Distributor - Elite', value: 'Exhibitor Distributor - Elite' },
          { name: 'Exhibitor Independent Rep - Non-Member', value: 'Exhibitor Independent Rep - Non-Member' },
          { name: 'Exhibitor Independent Rep - Basic', value: 'Exhibitor Independent Rep - Basic' },
          { name: 'Exhibitor Independent Rep - Premium', value: 'Exhibitor Independent Rep - Premium' },
          { name: 'Exhibitor Independent Rep - Elite', value: 'Exhibitor Independent Rep - Elite' },
          { name: 'Exhibitor Manufacturer - Non-Member', value: 'Exhibitor Manufacturer - Non-Member' },
          { name: 'Exhibitor Manufacturer - Basic', value: 'Exhibitor Manufacturer - Basic' },
          { name: 'Exhibitor Manufacturer - Premium', value: 'Exhibitor Manufacturer - Premium' },
          { name: 'Exhibitor Manufacturer - Elite', value: 'Exhibitor Manufacturer - Elite' },
          { name: 'Exhibitor Producer - Non-Member', value: 'Exhibitor Producer - Non-Member' },
          { name: 'Exhibitor Producer - Basic', value: 'Exhibitor Producer - Basic' },
          { name: 'Exhibitor Producer - Premium', value: 'Exhibitor Producer - Premium' },
          { name: 'Exhibitor Producer - Elite', value: 'Exhibitor Producer - Elite' },
          { name: 'Exhibitor Other - Non-Member', value: 'Exhibitor Other - Non-Member' },
          { name: 'Exhibitor Other - Basic', value: 'Exhibitor Other - Basic' },
          { name: 'Exhibitor Other - Premium', value: 'Exhibitor Other - Premium' },
          { name: 'Exhibitor Other - Elite', value: 'Exhibitor Other - Elite' },
          { name: 'Contractor', value: 'Contractor' },
          { name: 'Staff - Nonmember', value: 'Staff - Nonmember' },
          { name: 'Staff - Basic', value: 'Staff - Basic' },
          { name: 'Staff - Premium', value: 'Staff - Premium' },
          { name: 'Staff - Elite', value: 'Staff - Elite' },
          { name: 'Virtual Only - Nonmember', value: 'Virtual Only - Nonmember' },
          { name: 'Virtual Only - Basic', value: 'Virtual Only - Basic' },
          { name: 'Virtual Only - Premium', value: 'Virtual Only - Premium' },
          { name: 'Virtual Only - Elite', value: 'Virtual Only - Elite' },
          { name: 'Attendee Tuesday Admit', value: 'Attendee Tuesday Admit' },
          { name: 'Attendee Sunday Admit', value: 'Attendee Sunday Admit' },
          { name: 'Attendee Monday Admit', value: 'Attendee Monday Admit' },

        ]
      },
      company: {
        name: 'Company',
        type: 'string'
      },
      email: {
        name: 'Email',
        type: 'string'
      },
      badgeId: {
        name: 'Badge ID',
        type: 'string'
      },
      orgId: {
        name: 'Organization ID',
        type: 'number'
      },
      regCode: {
        name: 'regCode',
        type: 'category',
        options: [
          { name: 'Attendee Starndard', value: 'Attendee Starndard' },
          { name: 'Exhibitor Starndard', value: 'Exhibitor Starndard' },
          { name: 'Student Starndard', value: 'Student Starndard' },
          { name: 'Media Starndard', value: 'Media Starndard' },
          { name: 'Cancelled Exhibitor DUPLICATE', value: 'Cancelled Exhibitor DUPLICATE' },
          { name: 'Cancelled Virtual Only Attendee', value: 'Cancelled Virtual Only Attendee' },
          { name: 'Education & Exhibits - Basic Mbr', value: 'Education & Exhibits - Basic Mbr' },
          { name: 'Education & Exhibits - Premium Mbr', value: 'Education & Exhibits - Premium Mbr' },
          { name: 'Education & Exhibits - Elite Mbr', value: 'Education & Exhibits - Elite Mbr' },
          { name: 'Education & Exhibits - Non Mbr', value: 'Education & Exhibits - Non Mbr' },
          { name: 'Exhibits Hall Only - Basic Mbr', value: 'Exhibits Hall Only - Basic Mbr' },
          { name: 'Exhibits Hall Only - Premium Mbr', value: 'Exhibits Hall Only - Premium Mbr' },
          { name: 'Exhibits Hall Only - Elite Mbr', value: 'Exhibits Hall Only - Elite Mbr' },
          { name: 'Exhibits Hall Only - Non Mbr', value: 'Exhibits Hall Only - Non Mbr' },
          { name: 'VIP - Basic Mbr', value: 'VIP - Basic Mbr' },
          { name: 'VIP - Premium Mbr', value: 'VIP - Premium Mbr' },
          { name: 'VIP - Elite Mbr', value: 'VIP - Elite Mbr' },
          { name: 'VIP - Non Mbr', value: 'VIP - Non Mbr' },
          { name: 'Speaker - NonMember', value: 'Speaker - NonMember' },
          { name: 'Speaker - BASIC', value: 'Speaker - BASIC' },
          { name: 'Press - Approved PREMIUM', value: 'Press - Approved PREMIUM' },
          { name: 'Press - Approved ELITE', value: 'Press - Approved ELITE' },
          { name: 'Press - Pending NONMEMBER', value: 'Press - Pending NONMEMBER' },
          { name: 'Press - Pending BASIC', value: 'Press - Pending BASIC' },
          { name: 'Press - Pending PREMIUM', value: 'Press - Pending PREMIUM' },
          { name: 'Press - Pending ELITE', value: 'Press - Pending ELITE' },
          { name: 'Press - Denied', value: 'Press - Denied' },
          { name: 'Exhibitor Key Contact - No Badge', value: 'Exhibitor Key Contact - No Badge' },
          { name: 'Exhibitor Dealer - Non-Member', value: 'Exhibitor Dealer - Non-Member' },
          { name: 'Exhibitor Dealer - Basic ', value: 'Exhibitor Dealer - Basic ' },
          { name: 'Exhibitor Dealer - Premium', value: 'Exhibitor Dealer - Premium' },
          { name: 'Exhibitor Dealer - Elite', value: 'Exhibitor Dealer - Elite' },
          { name: 'Exhibitor Distributor - Non-Member', value: 'Exhibitor Distributor - Non-Member' },
          { name: 'Exhibitor Distributor - Basic', value: 'Exhibitor Distributor - Basic' },
          { name: 'Exhibitor Distributor - Premium', value: 'Exhibitor Distributor - Premium' },
          { name: 'Exhibitor Distributor - Elite', value: 'Exhibitor Distributor - Elite' },
          { name: 'Exhibitor Independent Rep - Non-Member', value: 'Exhibitor Independent Rep - Non-Member' },
          { name: 'Exhibitor Independent Rep - Basic', value: 'Exhibitor Independent Rep - Basic' },
          { name: 'Exhibitor Independent Rep - Premium', value: 'Exhibitor Independent Rep - Premium' },
          { name: 'Exhibitor Independent Rep - Elite', value: 'Exhibitor Independent Rep - Elite' },
          { name: 'Exhibitor Manufacturer - Non-Member', value: 'Exhibitor Manufacturer - Non-Member' },
          { name: 'Exhibitor Manufacturer - Basic', value: 'Exhibitor Manufacturer - Basic' },
          { name: 'Exhibitor Manufacturer - Premium', value: 'Exhibitor Manufacturer - Premium' },
          { name: 'Exhibitor Manufacturer - Elite', value: 'Exhibitor Manufacturer - Elite' },
          { name: 'Exhibitor Producer - Non-Member', value: 'Exhibitor Producer - Non-Member' },
          { name: 'Exhibitor Producer - Basic', value: 'Exhibitor Producer - Basic' },
          { name: 'Exhibitor Producer - Premium', value: 'Exhibitor Producer - Premium' },
          { name: 'Exhibitor Producer - Elite', value: 'Exhibitor Producer - Elite' },
          { name: 'Exhibitor Other - Non-Member', value: 'Exhibitor Other - Non-Member' },
          { name: 'Exhibitor Other - Basic', value: 'Exhibitor Other - Basic' },
          { name: 'Exhibitor Other - Premium', value: 'Exhibitor Other - Premium' },
          { name: 'Exhibitor Other - Elite', value: 'Exhibitor Other - Elite' },
          { name: 'Contractor', value: 'Contractor' },
          { name: 'Staff - Nonmember', value: 'Staff - Nonmember' },
          { name: 'Staff - Basic', value: 'Staff - Basic' },
          { name: 'Staff - Premium', value: 'Staff - Premium' },
          { name: 'Staff - Elite', value: 'Staff - Elite' },
          { name: 'Virtual Only - Nonmember', value: 'Virtual Only - Nonmember' },
          { name: 'Virtual Only - Basic', value: 'Virtual Only - Basic' },
          { name: 'Virtual Only - Premium', value: 'Virtual Only - Premium' },
          { name: 'Virtual Only - Elite', value: 'Virtual Only - Elite' },
          { name: 'Attendee Tuesday Admit', value: 'Attendee Tuesday Admit' },
          { name: 'Attendee Sunday Admit', value: 'Attendee Sunday Admit' },
          { name: 'Attendee Monday Admit', value: 'Attendee Monday Admit' },

        ]
      },
      addUserId: {
        name: 'addUserId',
        type: 'string'
      },
      statusCode: {
        name: 'statusCode',
        type: 'string'
      },
      event: {
        name: 'event',
        type: 'string'
      },
      eventId: {
        name: 'eventId',
        type: 'string'
      },
      eventYear: {
        name: 'eventYear',
        type: 'string'
      },
    }
  }
  
  columns = Object.values(this.config.fields);

  classNames: QueryBuilderClassNames = {
    removeIcon: 'fa fa-minus',
    addIcon: 'fa fa-plus',
    arrowIcon: 'fa fa-chevron-right px-2',
    button: 'btn',
    buttonGroup: 'btn-group',
    rightAlign: 'order-12 ml-auto',
    switchRow: 'd-flex px-2',
    switchGroup: 'd-flex align-items-center',
    switchRadio: 'custom-control-input',
    switchLabel: 'custom-control-label',
    switchControl: 'custom-control custom-radio custom-control-inline',
    row: 'row p-2 m-1',
    rule: 'border',
    ruleSet: 'border',
    invalidRuleSet: 'alert alert-danger',
    emptyWarning: 'text-danger mx-auto',
    operatorControl: 'form-control',
    operatorControlSize: 'col-auto pr-0',
    fieldControl: 'form-control',
    fieldControlSize: 'col-auto pr-0',
    entityControl: 'form-control',
    entityControlSize: 'col-auto pr-0',
    inputControl: 'form-control',
    inputControlSize: 'col-auto'
  }
  sortUpTracker = [];
  sortDownTracker = [];
  // validation = this.getValidation();
  original_validation = this.getValidation();
  validation = this.original_validation;
  dragger;
  page = 1;
  pageSize = 10;
  pagingNumber = 0;

  constructor(private modalService: NgbModal) {
    this.generatePaging();
  }

  showPage(i): boolean {
    // console.log(i, this.validation[i], (i < this.page*this.pageSize && i >= (this.page-1)*this.pageSize));
    return (i < this.page * this.pageSize && i > (this.page - 1) * this.pageSize);
  }

  public limitOnChange(pageSize) {
    this.page = 1;
    this.pageSize = pageSize;
    this.generatePaging();
  }

  public generatePaging() {
    this.page = 1;
    this.pagingNumber = 0;
    this.pagingNumber = Math.ceil(this.validation?.length / (this.pageSize / 10));
  }

  updateDragger() {
    if (this.dragger) {
      this.dragger.destroy();
      this.dragger = tableDragger(document.getElementById('table'), {
        dragHandler: '.handle',
        animation: 300
      });
    }

  }
  filterData(): void {
    let tempArray = [];
    let originalArray = this.original_validation;
    this.validation = this.original_validation;
    //originalArray = this.query.condition === "and" ? this.original_validation : this.validation;
    if (this.query.rules.length > 0) {
      this.query.rules.forEach(rule => {
        this.applyRuleset(this.query.condition, rule, originalArray);
      });
    }
    this.removeDuplicates();
  }

  applyRuleset(condition, rule, originalArray?): void {
    if (rule.rules) {
      rule.rules.forEach(rule => {
        if(rule.condition){
          this.applyRuleset(rule.condition, rule, originalArray);
        } else {
          if (condition === "or") {
            this.validation = this.applyOperator(condition, rule, originalArray);
          }
          if (condition === "and") {
            this.validation = this.applyOperator(condition, rule);
          }
        }
      });
    } else {
      if (condition === "or") {
        this.validation = this.applyOperator(condition, rule, originalArray);
      }
      if (condition === "and") {
        this.validation = this.applyOperator(condition, rule);
      }
    }
  }

  applyOperator(condition, rule, originalArray?): any[] {

    // console.log('applyOperator', condition, rule, originalArray);

    // if (rule?.condition === "or") {
    //   this.applyOperator(rule.condition, rule, originalArray);
    // }
    // if (rule?.condition === "and") {
    //   this.applyOperator(rule.condition, rule);
    // }

    if (condition === "or") {
      return this.orOperator(originalArray, rule);
    }

    if (condition === "and") {
      console.log('andOperator');
      return this.andOpertaor(this.validation, rule);
    }
  }

  orOperator(originalArray, rule): any[] {
    let tempArray = [];
    originalArray.map(item => {
      switch (rule.operator) {
        case '=':
          if ((item[rule.field] == rule.value) ||  (rule.value == undefined ) || (rule.value == '')) tempArray.push(item);
          break;
        case 'in':
          if (rule.value.includes(item[rule.field])) tempArray.push(item);
          break;
        case 'contains':
          if (item[rule.field].includes(rule.value)) tempArray.push(item);
          break;
        case 'not in':
          if (!rule.value.includes(item[rule.field])) tempArray.push(item);
          break;
        case '!=':
          if ((item[rule.field] != rule.value) ||  (rule.value == undefined ) || (rule.value == '')) tempArray.push(item);
          break;
        case '>':
          if ((item[rule.field] > rule.value) ||  (rule.value == undefined ) || (rule.value == '')) tempArray.push(item);
          break;
        case '<':
          if ((item[rule.field] < rule.value) ||  (rule.value == undefined ) || (rule.value == '')) tempArray.push(item);
          break;
        case '>=':
          if ((item[rule.field] >= rule.value) ||  (rule.value == undefined ) || (rule.value == '')) tempArray.push(item);
          break;
        case '<=':
          if ((item[rule.field] <= rule.value) ||  (rule.value == undefined ) || (rule.value == '')) tempArray.push(item);
          break;


        default:
          // 
          break;

      }
    });
    return tempArray;
  }
  
  andOpertaor(tempArray, rule): [] {
    if ((rule.value == undefined) || (rule.value == "")){
      return tempArray;
    }
    switch (rule.operator) {
      case '=':
        return tempArray.filter(item => item[rule.field] == rule.value);
        break;
      case 'in' || 'contains':
        return tempArray.filter(item => rule.value.includes(item[rule.field]));
        break;
      case 'not in':
        return tempArray.filter(item => !rule.value.includes(item[rule.field]));
        break;
      case '!=':
        return tempArray.filter(item => item[rule.field] != rule.value);
        break;
      case '>':
        return tempArray.filter(item => item[rule.field] > rule.value);
        break;
      case '<':
        return tempArray.filter(item => item[rule.field] < rule.value);
        break;
      case '>=':
        return tempArray.filter(item => item[rule.field] >= rule.value);
        break;
      case '<=':
        return tempArray.filter(item => item[rule.field] <= rule.value);
        break;

      default:
        // 
        break;

    }
    
  }

  removeDuplicates() {
    this.validation = [...new Set(this.validation)];
    //  this.validation.filter((value,index) => this.validation.indexOf(value === index))
  }
  ngAfterViewInit(): void {
    this.dragger = tableDragger(document.getElementById('table'), {
      dragHandler: '.handle',
      animation: 300
    });
  }

  initTableDragger(): void {
  }

  getFields(): void {

  }
  log(name) {
    console.log(name, this.original_validation);
    console.log(name, this.validation);
  }
  save(data) {
    console.log('before save');
    this.original_validation = this.validation;
    console.log('after save');
  }

  reset(data) {
    console.log('before reset');
    this.validation = this.original_validation;
  }

  changedValue(data) {
    console.log('changedValue');
    this.validation[data.position] = data.data;
  }

  ngOnDestroy(): void {
    this.dragger.destroy();
  }

  showColumn(column): boolean {
    return (this.findAllByKey(this.query.rules, 'field').includes(column)) || this.showAllColumns;
  }

  findAllByKey(obj, keyToFind) {
    return Object.entries(obj)
      .reduce((acc, [key, value]) => (key === keyToFind)
        ? acc.concat(value)
        : (typeof value === 'object')
        ? acc.concat(this.findAllByKey(value, keyToFind))
        : acc
      , [])
  }
  

  toggleShowAllColumns() {
    this.showAllColumns = !this.showAllColumns;
  }


  openCard(valid: any, index: number) {
    const openCardRef = this.modalService.open(EventDataManagerCardComponent, {
      size: 'xl',
      windowClass: 'modal-custom',
      scrollable: true
    });

    openCardRef.componentInstance.valid = valid;
    openCardRef.componentInstance.position = index;

  }

  getValidation(): any[] {
    const mockrecords = 10;
    const linkedRecords = 5;
    const sessionRecords = 10;
    const word = ["Excited", "Anxious", "Overweight", "Jumpy", "Misunderstood", "Squashed", "Gargantuan", "Broad", "Crooked", "Curved", "Deep", "Even", "Excited", "Anxious", "Overweight", "Demonic", "Jumpy", "Misunderstood", "Squashed", "Gargantuan", "Broad", "Crooked", "Curved", "Deep", "Even", "Flat", "Hilly", "Jagged", "Round", "Shallow", "Square", "Steep", "Straight", "Thick", "Thin", "Cooing", "Deafening", "Faint", "Harsh", "High-pitched", "Hissing", "Hushed", "Husky", "Loud", "Melodic", "Moaning", "Mute", "Noisy", "Purring", "Quiet", "Raspy", "Screeching", "Shrill", "Silent", "Soft", "Squeaky", "Squealing", "Thundering", "Voiceless", "Whispering"]
    const regType = this.config.fields['regType'].options.map(item => { return item['name'] });
    const regCode = this.config.fields['regCode'].options.map(item => { return item['name'] });
    
    const recordType = ["registrationData", "attendeeData",];

    const company = ["ABC, Inc.", "XYZ, Inc.",];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",];
    const firstName = ["Adam", "Alex", "Aaron", "Ben", "Carl", "Dan", "David", "Edward", "Fred", "Frank", "George", "Hal", "Hank", "Ike", "John", "Jack", "Joe", "Larry", "Monte", "Matthew", "Mark", "Nathan", "Otto", "Paul", "Peter", "Roger", "Roger", "Steve", "Thomas", "Tim", "Ty", "Victor", "Walter"];
    const lastName = ["Anderson", "Ashwoon", "Aikin", "Bateman", "Bongard", "Bowers", "Boyd", "Cannon", "Cast", "Deitz", "Dewalt", "Ebner", "Frick", "Hancock", "Haworth", "Hesch", "Hoffman", "Kassing", "Knutson", "Lawless", "Lawicki", "Mccord", "McCormack", "Miller", "Myers", "Nugent", "Ortiz", "Orwig", "Ory", "Paiser", "Pak", "Pettigrew", "Quinn", "Quizoz", "Ramachandran", "Resnick", "Sagar", "Schickowski", "Schiebel", "Sellon", "Severson", "Shaffer", "Solberg", "Soloman", "Sonderling", "Soukup", "Soulis", "Stahl", "Sweeney", "Tandy", "Trebil", "Trusela", "Trussel", "Turco", "Uddin", "Uflan", "Ulrich", "Upson", "Vader", "Vail", "Valente", "Van Zandt", "Vanderpoel", "Ventotla", "Vogal", "Wagle", "Wagner", "Wakefield", "Weinstein", "Weiss", "Woo", "Yang", "Yates", "Yocum", "Zeaser", "Zeller", "Ziegler", "Bauer", "Baxster", "Casal", "Cataldi", "Caswell", "Celedon", "Chambers", "Chapman", "Christensen", "Darnell", "Davidson", "Davis", "DeLorenzo", "Dinkins", "Doran", "Dugelman", "Dugan", "Duffman", "Eastman", "Ferro", "Ferry", "Fletcher", "Fietzer", "Hylan", "Hydinger", "Illingsworth", "Ingram", "Irwin", "Jagtap", "Jenson", "Johnson", "Johnsen", "Jones", "Jurgenson", "Kalleg", "Kaskel", "Keller", "Leisinger", "LePage", "Lewis", "Linde", "Lulloff", "Maki", "Martin", "McGinnis", "Mills", "Moody", "Moore", "Napier", "Nelson", "Norquist", "Nuttle", "Olson", "Ostrander", "Reamer", "Reardon", "Reyes", "Rice", "Ripka", "Roberts", "Rogers", "Root", "Sandstrom", "Sawyer", "Schlicht", "Schmitt", "Schwager", "Schutz", "Schuster", "Tapia", "Thompson", "Tiernan", "Tisler"];
    const boolean = ['Yes', 'No'];
    const sessionCode = ['WCL', 'WNR', 'FEG', 'MLS', 'EFD', 'PRF', 'WML', 'AVF', 'XLF', 'NJD', 'GTH'];
    let mockData = [];
    let session = [];
    let linked = [];


    for (var i = 0; i <= sessionRecords; i++) {
      let rate = this.randomIntFromInterval(50, 200);
      let discount = this.randomIntFromInterval(15, 40);
      let date = `${this.randomName(days)}, ${this.randomIntFromInterval(1, 12)}/${this.randomIntFromInterval(1, 28)}/${this.randomIntFromInterval(21, 22)}`;
      session.push({
        'session': `${this.randomName(sessionCode)}`,
        'quantity': '1',
        'description': `${this.randomName(word)} ${this.randomName(word)} ${this.randomName(word)} ${this.randomName(word)} `,
        'dates': `
        ${date} ${this.randomIntFromInterval(1, 5)}:${this.randomIntFromInterval(10, 59)} PM - 
        ${date} ${this.randomIntFromInterval(6, 12)}:${this.randomIntFromInterval(10, 59)} PM
        `,
        'rate': `$${rate}.00`,
        'discount': `$${discount}.00`,
        'total': `$${rate-discount}.00`,
      });
    }



    for (var i = 0; i <= linkedRecords; i++) {
      linked.push({
        'firstName': `${this.randomName(firstName)}`,
        'lastName': `${this.randomName(lastName)}`,
        'keyContact': `${this.randomName(boolean)}`,
        'regType': `${this.randomIntFromInterval(100, 999)}`,
        'rdm': `${this.randomIntFromInterval(100, 999)}`,
        'due': `$${this.randomIntFromInterval(0, 500)}.00`,
        'status': `Added`,
      });
    }



    for (var i = 0; i <= mockrecords; i++) {
      const year = this.randomIntFromInterval(1940, 2000);
      const month = this.randomIntFromInterval(1, 12);
      const day = this.randomIntFromInterval(1, 28);
      const first = this.randomName(firstName);
      const last = this.randomName(lastName);

      let exhibitor = {
        exhibitorNumber: `${this.randomIntFromInterval(1000, 2000)}`,
        groupLeaderFlag: `${this.randomName(regCode)}`,
        exhibitorType: `${this.randomName(regCode)}`,
        speaker: `${this.randomName(regCode)}`,
        exhibitorAddOns: `${this.randomName(regCode)}`,
        promoCode: `${this.randomName(regCode)}`,
      }

      mockData.push(
        {
          'recordType': `${this.randomName(recordType)}`,
          'regUId': `${this.randomIntFromInterval(5000, 10000)}`,
          'attendeeUId': `${this.randomIntFromInterval(5000, 10000)}`,
          'memberUId': `${this.randomIntFromInterval(5000, 10000)}`,
          'firstName': `${first}`,
          'lastName': `${last}`,
          'regType': `${this.randomName(regType)}`,
          'statusCode': `${this.randomName(regType)}code`,
          'company': `${this.randomName(company)}`,
          'email': `${first}@${last}.com`,
          'badgeId': `${this.randomName(word)}${this.randomIntFromInterval(5000, 10000)}`,
          'orgId': `${this.randomIntFromInterval(100, 1000)}`,
          'event': `${this.randomName(word)} Event`,
          'eventYear': `2021`,
          'eventId': `${this.randomIntFromInterval(1000, 9999)}`,
          'regCode': `${this.randomName(regCode)}`,
          'addUserId': `${this.randomIntFromInterval(100000, 999999)}-${this.randomIntFromInterval(1000, 9999)}-${this.randomIntFromInterval(1000, 9999)}-${this.randomIntFromInterval(1000, 9999)}-${this.randomIntFromInterval(100000000, 999999999)}`,

          'standardRate': `${this.randomIntFromInterval(100, 1000)}.00`,
          'discountAmount': `${this.randomIntFromInterval(50, 100)}.00`,
          'discountRate': `${this.randomIntFromInterval(50, 100)}.00`,

          'badgeFirstName': `${first}`,
          'badgeLastName': `${last}`,
          'legalFirstName': `${first}`,
          'legalLastName': `${last}`,

          'title': ``,
          'ccName': ``,
          'address1': `${this.randomIntFromInterval(150, 999)} ${this.randomName(word)} St`,
          'address2': ``,
          'geoCode': ``,
          'zipCode': ``,
          'city': ``,
          'state': ``,
          'country': ``,
          'phoneCountryCode': ``,
          'phoneAreaCode': ``,
          'phoneNumber': ``,
          'ccEmail': `cc${first}@${last}.com`,
          'photoFlag': ``,
          'qualificationFlag': ``,
          'photoImage': ImageConstants.csiImagePlaceholder,
          'questions': [
            {
              'text': 'What is your current involvement in the cannibas industry?',
              'answer': `Answer to the question current involvement in the cannibas industry will go here`,
            },
            {
              'text': 'What part of the industry does your business primarily operate in?',
              'answer': `My business primarily operates in ${this.randomName(word)}`,
            },
            {
              'text': 'Does your business buy or sell from the cannibas industry?',
              'answer': `My business ${this.randomName(boolean) ? 'buys' : 'sells'} from the cannibas industry`,
            },
            {
              'text': 'Select which markets you are primarily focus on in the next 12 months?',
              'answer': `In the next 12 months I will focus on the ${this.randomName(word)} industry`,
            },
            {
              'text': 'What products or services is your company considering in the next 12 months?',
              'answer': `${this.randomName(word)}, ${this.randomName(word)}, ${this.randomName(word)}`,
            },
          ],
          'sessions': session,
          'linkedRecords': linked,
          ...(`${this.randomName(recordType)}`==='registrationData' && exhibitor),
          
        }
      )
    }

    return mockData;

  }
  sortColumn($event, property) {

    if (this.sortDownTracker.includes(property)) {
      this.sortDownTracker = [];
      this.sortUpTracker = [];
      this.sortUpTracker.push(property);
      this.validation.sort((b, a) => a[property] - b[property]);
      this.validation.sort(function (b, a) {
        var titleA = a[property].toLowerCase(), titleB = b[property].toLowerCase();
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
      this.validation.sort((b, a) => new Date(a[property]).getTime() - new Date(b[property]).getTime());
    } else {
      this.sortUpTracker = [];
      this.sortDownTracker = [];
      this.sortDownTracker.push(property);
      this.validation.sort((a, b) => a[property] - b[property]);
      this.validation.sort(function (a, b) {
        var titleA = a[property].toLowerCase(), titleB = b[property].toLowerCase();
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
      this.validation.sort((a, b) => new Date(a[property]).getTime() - new Date(b[property]).getTime());
    }
  }
  randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  randomName(word) {
    return word ? word[Math.floor(Math.random() * word.length)] : null;
  }

}