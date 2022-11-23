import { EventEmitter, SimpleChanges } from '@angular/core';
import { Output } from '@angular/core';
import { OnChanges } from '@angular/core';
import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import Stepper from 'bs-stepper';
import { Papa } from 'ngx-papaparse';
import { SessionServiceService } from '../services/session-service.service';
import { ToastService } from '../services/toast/toast.service';
import Swal from 'sweetalert2'
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { MandatoryFields, QuestionResponseUniqProps } from './data';

@Component({
  selector: 'app-psm',
  templateUrl: './psm.component.html',
  styleUrls: ['./psm.component.scss']
})
export class PsmComponent implements OnInit , OnChanges{

  @Output() patchData = new EventEmitter<string>();
  @Input() patchInfo;
  @Input() isCreateEvent;
  psmIds = ['event_info', 'event_costs', 'qualifications' ,'sessions', 'eblast', 'questions_goals','discounts','exhibitorAllotment','membsershipAllotment'] // To Import add respective psmId;
  mandatoryFields = MandatoryFields // keys in mandatoryFields object should match with psmIds
  questionResponseUniqProps = QuestionResponseUniqProps;
  psmAttachments = {
    event_info: {
      path: '/assets/psm_samples/PSM_EventInfo.csv',
      fileName: 'PSM_EventInfo.csv'
    },
    event_costs: {
      path: '/assets/psm_samples/PSM_CostsInfo.csv',
      fileName: 'PSM_CostsInfo.csv'
    },
    qualifications: {
      path: '/assets/psm_samples/PSM_Qualifications.csv',
      fileName: 'PSM_Qualifications.csv'
    },
    sessions: {
      path: '/assets/psm_samples/PSM_Sessions.csv',
      fileName: 'PSM_Sessions.csv'
    },
    questions_goals: {
      path: '/assets/psm_samples/PSM_Demographics_Questions.csv',
      fileName: 'PSM_Demographics_Questions.csv'
    },
    discounts: {
      path: '/assets/psm_samples/PSM_Discounts.csv',
      fileName: 'PSM_Discounts.csv'
    },
    exhibitorAllotment: {
      path: '/assets/psm_samples/PSM_Exhibitor_Allotment.csv',
      fileName: 'PSM_Exhibitor_Allotment.csv'
    },
    membsershipAllotment: {
      path: '/assets/psm_samples/PSM_Membership.csv',
      fileName: 'PSM_Membership.csv'
    }
  };
  loading = false;
  data = [];
  columns = [];
  private stepper: Stepper;
  dataPrepared = [];
  uploadedRecords = {}
  historyInfo = {};
  public attachedFiles = {};
  importEnabled: boolean = false;
  constructor(
    private sessionService:SessionServiceService,
    private papa: Papa,
    public toastService: ToastService,
    private http: HttpClient
  ) { }
  ngOnChanges(changes: SimpleChanges): void {
    if(this.patchInfo && this.patchInfo.success){
      let str = ""
      this.psmIds.forEach( key => {
        if(this.patchInfo.details[key]){
          str += this.patchInfo.details[key]+"/"+this.uploadedRecords[key]+" "+key+", " 
        }
      })
      str = str.substring(0, str.length - 2)
      str += " imported." 
      console.log(this.patchInfo.details)
      this.toastService.show(str, {
        delay: 6000,
        classname: 'bg-success text-light',
        headertext: 'Successfully Imported',
        autohide: true,
      });
    }
  }

  next() {
    window.scroll(0, 0);
    this.stepper.next();
  }

  

  previous() {
    window.scroll(0, 0);
    this.stepper.previous();
  }

  onSubmit() {
    if(!this.isCreateEvent){
      const confirm = window.confirm("Your Existing Event values will be overwritten. Are you sure you want to continue?");
      if (!confirm) {
        return;
      }
    }
    this.psmIds.forEach(tabId => {
      if (this.data[tabId]) {
        this.dataPrepared[tabId] = this.prepareFormData(this.data[tabId], tabId);
      }
    });
    Object.keys(this.dataPrepared).forEach(key => {
      this.uploadedRecords[key] = this.dataPrepared[key].length;
      if(key == 'event_info'){
        this.uploadedRecords[key] = this.dataPrepared[key] ? 1: 0
      }else if(key == 'discounts'){
        this.uploadedRecords[key] = this.dataPrepared[key].discountList.length || 0; 
      }
    })
    this.patchFormData({ psmIds: this.psmIds, data: this.dataPrepared });
  }
  ngOnInit(): void {
    this.stepper = new Stepper(document.querySelector('#stepper1'), {
      linear: false,
      animation: true
    })
  }

  patchFormData(data) {
    this.patchData.emit(data);
  }


  importData(tabId) {
    this.patchInfo = {};
    this.patchInfo.success = true;
  }

  prepareFormData(dataObj, tabId) {
    if (tabId == 'event_info') {
      let data = dataObj[0];
      console.log('PSM data import', data);
      return ({
        eventName: data.eventName,
        salesExecName: data.SalesExecName,
        reqProjMgrName: data.RPMName,
        custServiceEmailAddress: data.CustServiceEmail,
        custServicePhoneNumber: data.CustServicePhoneNbr,
        eventYear: data.EventShowYear,
        description: data.EventInfoTxt,
        startDate: this.formatDate(new Date(data.StartDate)),
        startTime: data.StartTime,
        endDate: this.formatDate(new Date(data.EndDate)),
        endTime: data.EndTime,
        eventSecurityLevel: data.ShowSecurityType,
        categories: data.eventCategory,
        googleMerchantId: data.GoogleMerchantId,
        gateway: data.GatewayName,
        gatewayMerchantId: data.GatewayMerchantId,
        address1: data.venueAddress,
        address2:data.venueAddress2,
        address3: data.venueAddress3,
        city: data.venueCity,
        zip: data.venuePostalCode,
        state: data.venueState,
        county: data.venueCounty,
        country: data.venueCountry,
        countryCode: data.venueCountryCode,
        phone: data.mainPhoneNumber,
        builderIOID: '345234234',
        noRequiredQualifications: data.ReqdNoqualFlag ? true : false,
        TaxIDNumber: data.ReqdQualIdFlag ? true : false,
        PayStub: data.ReqdQualPayFlag ? true : false,
        BusLi: data.ReqdQualLicFlag ? true : false,
        PhotoID: data.ReqdPhotoFlag ? true : false,
        Seminar: false,
        Social: false,
        Trade: data.eventType == 'TRD' ? true : false,
        Workshop: false,
        eventFormat: data.eventFormat,
      });
    }
    else if (tabId == 'sessions') {
      let sessions = [];
      dataObj.forEach(row => {
        // const sdateTime = row.StartDateTime.split(' ');
        // const edateTime = row.EndDateTime.split(' ');
        const publicOrPrivate = row.PublicPrivate === 'Public' ? 'N' : row.PublicPrivate === 'Private' ? 'Y' : '';
        const newSession = {
          "name": row.SessionDescription,
          "sessionType": row.sessionType || '',
          "privateSession": publicOrPrivate,
          "sessionAttendeeCapacity": row.AllotmentRoomCapacity || '',
          "topics": row.Topic || '',
          "speaker": row.SpeakerName || '',
          "synopsis": row.SpeakerBio || '',
          "cost": isNaN(row.SessionRate)? '': row.SessionRate || '0',
          "startDate": this.formatDate(new Date(row["StartDate(MM/DD/YYYY)"])),
          "startTime": row["StartTime(24H)"],
          "endDate": this.formatDate(new Date(new Date(row["EndDate(MM/DD/YYYY)"]))),
          "endTime": row["EndTime(24H)"]
        }
        sessions.push(newSession);
      });
      return sessions;
    }
    else if (tabId == 'event_costs') {
      let eventCosts = [];
      dataObj.forEach(row => {
        eventCosts.push({
          EventRegType: row.EventRegType,
          refCodes: row.EventRegType + ' - ' + row.Description,
          rates: {
            earlyBirdStartDate: this.formatDate(new Date(row.EarlyBirdStartDate)),
            earlyBirdEndDate: this.formatDate(new Date(row.EarlyBirdEndDate)),
            earlyBirdRate: (row.EarlyBirdRate).toString().replaceAll('$',''),
            preEventBirdStartDate: this.formatDate(new Date(row.AdvanceStartDate)),
            preEventBirdEndDate: this.formatDate(new Date(row.AdvanceEndDate)),
            preEventBirdRate: (row.AdvanceRate).toString().replaceAll('$',''),
            duringEventBirdStartDate: this.formatDate(new Date(row.OnsiteStartDate)),
            duringEventBirdEndDate: this.formatDate(new Date(row.OnsiteEndDate)),
            duringEventBirdRate: (row.OnsiteRate).toString().replaceAll('$','')
          },
          customPackage: {
              name: row.custom_pckg_name,
              description: row.custom_pckg_description,
              cost: row.custom_pckg_cost
          }
        });
      });
      return eventCosts;
    }
    else if (tabId == 'eblast') {
      let currentUsersEmail = [];
      dataObj.forEach(row => {
        let myNewUser = {
          "EmailAddrTxt": row.EmailAddress,
          "NameFirst": row.NameFirst,
          "NameLast": row.NameLast,
        }
        currentUsersEmail.push({ ...myNewUser })

      });
      return currentUsersEmail;
    }
    else if (tabId == 'questions_goals') {
      let questionsGoals = [];
      dataObj.forEach(row => {
          let newQuestionsGoals = {
            PollingType: row.PollingType,
            category: row.FocusType,
            responseLayout: row.ResponseFieldType,
            question: row.Description,
            questionName: row.demQuestion,
            dedDescription: row.dedDescription,
            dedValue: row.dedValue,
            demQuestion: row.demQuestion,
            additionalInfoName: row.additionalInfoName,
            additionalInfoValue: row.additionalInfoValue,
          }
          questionsGoals.push({ ...newQuestionsGoals });

      });

      questionsGoals = Object.values(questionsGoals.reduce((r, { PollingType, category, question,questionName,responseLayout,...rest }) => {
        const key = `${PollingType}-${category}-${question}`;
        r[key] = r[key] || { PollingType, category, question,questionName,responseLayout, demDetails: [] };
        if(rest.dedDescription && responseLayout?.toLowerCase() != 'freetext'){
          r[key]["demDetails"].push(rest)
        }
        return r;
      }, {}))

      console.log(questionsGoals)
      return questionsGoals;
    } else if (tabId == 'discounts') {
      let data = { discountList: [] }
      dataObj.forEach(row => {
        data.discountList.push({
          discountType: row.DiscountCode,
          discountName: row.discountname,
          amount: row.Discount,
          discountGroup: row.DiscountGroupNbr,
          discountDescription: row.Description,
          appliedRegtypes: this.loadDicountRegtype(row["Reg Type"], row.Description),
          discountStatus: "active",
          discountcd: row.discode || "",
          createdDate: new Date(),
          startDate: new Date(row["Start Date and Time"]),
          endDate: new Date(row["End Date and Time"]),
          // Allotment: row.Allotment,
          // GLCode: row.GLCode,
          priority: row.Priority
        });
      });
      return data;
    } else if (tabId == 'qualifications') {
      let qualifications = [];
      dataObj.forEach(row => {
        let qualification = {
          "regType": row.regType,
          "qualification": row.qualification,
          "sampleQualificationFileData": '',
          "formRequirement":'',
          'editFlag': null,
          'qualName': row.qualification+" qualification"
        }

        if(qualifications.findIndex(e => e.regType == row.regType && row.qualification == e.qualification) == -1){
          qualifications.push({ ...qualification })
        }
      });
      return qualifications;
    } else if (tabId == 'exhibitorAllotment') {
      return dataObj.slice();
    } else if (tabId == 'membsershipAllotment') {
      return dataObj.slice();
    }
  }

    getAttachedFiles(tabId) {
      let blob = new Blob([this.attachedFiles[tabId].data], { type: 'text/csv' });
      let url = window.URL.createObjectURL(blob);
  
      if(navigator && navigator['msSaveOrOpenBlob']) {
          (navigator as any).msSaveBlob(blob, this.attachedFiles[tabId].fileName);
      } else {
          let a = document.createElement('a');
          a.href = url;
          a.download = this.attachedFiles[tabId].fileName;
          document.body.appendChild(a);
          a.click();        
          document.body.removeChild(a);
      }
      window.URL.revokeObjectURL(url);
  }

  loadDicountRegtype(regtype: any, description: string) {
    if (description.toLowerCase() == 'promo code percentage' || description.toLowerCase() == 'promo code monetary amount') {
      return regtype.split(',');
    }
    return regtype;
  }

  processOnFileSelect(input: HTMLInputElement, tabId) {
    let currentFile;
    const files = input.files;
    if (files && files.length) {
      currentFile = files[0];
      this.papaParse(currentFile,tabId,true,input)
      let fileReader: FileReader = new FileReader();
      fileReader.readAsText(currentFile);
      fileReader.onload = ev => {
        let csvdata = fileReader.result.toString();
        this.attachedFiles[tabId] = {
          data: csvdata , fileName: currentFile.name, lastUpdated: new Date()
        };
      };
    }

  }

  papaParse(currentFile,tabId,islertReq,input?){
    this.papa.parse(currentFile, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: 'greedy',
      worker: true,
      chunk: (result) => {
        console.log(result);
        if (this.validateStep(tabId, result.data, islertReq)) {
          this.attachedFiles[tabId] = {
            data: currentFile,
            fileName: this.psmAttachments[tabId].fileName,
            lastUpdated: new Date().toString()
          }
          this.data[tabId] = result.data;
          this.columns[tabId] = result.meta.fields;
          // this.historyInfo[tabId] = new Date();
          if(islertReq){
            this.toastService.show(result.data.length+"/"+result.data.length+" "+tabId+" records have been successfully uploaded.", {
              delay: 6000,
              classname: 'bg-success text-light',
              headertext: 'Successfully Uploaded',
              autohide: true,
            });
          }
        }
        else {
          this.reset(input, tabId);
        }
      }
    });
  }

  reset(file, stepName){
    console.dir(file);
    if(file){
      file.value = "";
    }
    this.data[stepName] = [];
    delete this.attachedFiles[stepName];
  }

  setData(data, title) {
    if (!title) return " "
    return data;
  }

  setHeader(title, index) {
    return title.toUpperCase();
  }


  formatDate(date) {
    if(isNaN(date)){
      return '';
    }
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = '' + d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }

  isEmpty(str) {
    str = str == null ? '': str.toString().trim()
    return str === '' ? true: false;
  }

  trimData(data){
    if(data){
      Object.keys(data).forEach(prop => { 
        if(data[prop]){
          data[prop] = data[prop].toString().trim();
        }
      })
    }
  }

  validateStep(tabId, data, islertReq) {
    let newQuestionGoals = []
    for (let i = 0; i < data.length; i++) {
      this.trimData(data[i]);
      let missingFields = this.getMissingFields(tabId, data[i]);
      if (missingFields.length > 0) {
        const fields = missingFields.join(', ');
        Swal.fire({
          icon: 'error',
          title: 'Invalid File detected',
          text: fields + " missing at row " + (i + 2),
          footer: 'Please check your file and try again',
          confirmButtonColor: '#3085d6',
        })
        return false;
      }
      if(tabId === 'discounts' && this.checkIfNotExists(data[i])){
        Swal.fire({
          icon: 'error',
          title: 'Invalid File detected',
          text: "Invalid discount type at row " + (i + 2),
          footer: 'Please check your file and try again',
          confirmButtonColor: '#3085d6',
        })
        return false;
      }
      if(tabId === 'questions_goals'){
        let isValid = true;
        let msg = '';
        if(this.checkIfValidLengths(data[i])){
          isValid = false;
          msg = 'question description contains more than 500 characters at row '
        } else if(!this.isValidResponseValues(data[i])){
          isValid = false;
          msg = "question doesn't have response name at row "
        } else if (this.isDuplicateQuestionResponses(data[i], newQuestionGoals)){
          isValid = false;
          msg = 'question has duplicate response values at row '
        } else {
          newQuestionGoals.push({...data[i]});
        }
        if(!isValid){
          Swal.fire({
            icon: 'error',
            title: 'Invalid File detected',
            text: msg + (i + 2),
            footer: 'Please check your file and try again',
            confirmButtonColor: '#3085d6',
          })
          return isValid;
        }
      }
    }
    return true;
  }

  isValidResponseValues(data) {
    if(data.ResponseFieldType?.toLowerCase() == 'freetext'){
      return true;
    } else {
      return !!data.dedDescription?.toString();
    }
  }
  
  checkIfValidLengths(data: any) {
    if(data?.Description?.length > 500){
      return true;
    }
    return false;
  }

  checkIfNotExists(data:any){
    console.log(data.Description);
    let check = this.sessionService.discountCodes.filter(e=>e.discountDescription == data.Description);
    if(check.length === 1){
      return false;
    }
    return true;
  }


  getMissingFields(tabId, row) {
    let missingFields = [];
    if (this.mandatoryFields[tabId]) {
      let isValid = true;
      this.mandatoryFields[tabId].forEach(field => {
        isValid = (!this.isEmpty(row[field])) && isValid;
        if (this.isEmpty(row[field])) {
          missingFields.push(field);
        }
      });
    }
    return missingFields;
  }


  fetchAllAttachmentsToImport () {
    let https = [];
    this.loading = true;
    Object.keys(this.psmAttachments).forEach(tabId => {
      const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
      https.push(this.http.get(this.psmAttachments[tabId].path, { headers, responseType: 'text'} ))
    })    
    forkJoin(https).subscribe(
      data => {
        Object.keys(this.psmAttachments).forEach((tabId,i) => {
          this.papaParse(data[i],tabId, false);
        })
      },
      err => {
        console.log(err)
      });
  }

  enableImport(){
    this.importEnabled = Object.keys(this.psmAttachments).filter((tabId) => !this.attachedFiles[tabId]?.fileName).length == 0;
    if(this.importEnabled){
      this.loading = false
    }
    return this.importEnabled
  }

  isDuplicateQuestionResponses(questData, newQuestionGoals){
    return newQuestionGoals.some(question => this.questionResponseUniqProps.every(prop => question[prop] == questData[prop] ));
  }

}