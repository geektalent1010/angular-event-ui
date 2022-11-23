import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  ElementRef
} from '@angular/core';
import cloneDeep from 'lodash/cloneDeep';
// import * as sortedIndex from 'lodash/sortedIndex';
import { ReportsService } from '../reports.service';
// import { FiltersComponent } from '../filters/filters.component';
import { DatePickerComponent } from '../date-picker/date-picker.component';
import { FormGroup, FormControl } from '@angular/forms';
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  // allCodes: string[] = [];

  // Exhibitor and excluded codes are hardcoded now
  // but should be populated in a database table
  codes = {
    Exhibitor: ['EX', 'EO'],
    exclude: ['CN', 'CX', 'EKC', 'ST', 'PR', 'GKC', 'GSC'],
    Attendee: []
  };

  fieldDropdownData = [];
  filterDropdownData = [];
  groupbyDropdownData = [];
  lastFilterSectionId = 0;

  now = new Date();
  reportsSettings = {
    fields: [],
    filters: [],
    groupby: [],
    selectedFromToDateTime: {
      from: {
        date: {
          month: this.now.getMonth() + 1,
          day: this.now.getDate(),
          year: this.now.getFullYear()
        },
        time: { hour: this.now.getHours(), minute: this.now.getMinutes() }
      },
      to: {
        date: {
          month: this.now.getMonth() + 1,
          day: this.now.getDate(),
          year: this.now.getFullYear()
        },
        time: { hour: this.now.getHours(), minute: this.now.getMinutes() }
      }
    }
  }; // used to persist data between tabs

  filterSections = [];

  reviewData = {};
  saveData = { filters: [] };
  timeReady = false;
  // reportInterval = {};
  activeReport = 1;
  activeTab = 1;
  isCollapsed = true;
  saveReportForm: FormGroup;
  savedReports = [];
  reportId = 0; //this should be obtained from backend
  reportSaved = false;
  reportNameBlank = false;
  reportNameNonUnique = false;

  @ViewChildren(DatePickerComponent) datePickers: QueryList<
    DatePickerComponent
  >;

  constructor(
    private reportsService: ReportsService,
    private hostElement: ElementRef
  ) { }
  private clearReportsSettings() {
    this.now = new Date();
    this.reportsSettings = {
      fields: [],
      filters: [],
      groupby: [],
      selectedFromToDateTime: {
        from: {
          date: {
            month: this.now.getMonth() + 1,
            day: this.now.getDate(),
            year: this.now.getFullYear()
          },
          time: { hour: this.now.getHours(), minute: this.now.getMinutes() }
        },
        to: {
          date: {
            month: this.now.getMonth() + 1,
            day: this.now.getDate(),
            year: this.now.getFullYear()
          },
          time: { hour: this.now.getHours(), minute: this.now.getMinutes() }
        }
      }
    }; // used to persist data between tabs
  }

  private clearDropdownData() {
    this.fieldDropdownData = [];
    this.filterDropdownData = [];
    this.groupbyDropdownData = [];
    this.lastFilterSectionId = 0;
  }
  private clearReviewData() {
    this.reviewData = {};
  }
  private clearSaveData() {
    this.saveData = { filters: [] };
  }
  private resetReportSelections() {
    this.clearDropdownData();
    this.clearReviewData();
    this.clearSaveData();
    this.clearReportsSettings();
    this.clearFilterSections();
    this.initialize();
  }

  private clearFilterSections() {
    this.filterSections = [];
  }
  // private getAttendeeCodes(allCodes: string[]) {

  //   let nonAttendeeCodes = new Set([
  //     ...this.codes.Exhibitor,
  //     this.codes.exclude
  //   ]);
  //   let attendeeCodes = [...allCodes].filter(x => !nonAttendeeCodes.has(x));
  //   return attendeeCodes;
  // }

  private updateFilterSelections() {
    for (let i = 0; i < this.filterSections.length; i++) {
      for (let j = 0; j < this.filterSections[i].data.length; j++) {
        let secondColSelectionsForFirstColSelection = this.saveData['filters'][
          i
        ].data
          .filter(x => x.firstColId == j)
          .map(x => x.secondColChecked);
        let isFirstColFilterJSelected = secondColSelectionsForFirstColSelection.some(
          x => x.length > 0
        )
          ? true
          : false;
        this.filterSections[i].data[j]['checked'] = isFirstColFilterJSelected;
      }
    }
  }

  private setSecondColData(event) {
    if (event.firstColInd == -1) {
      return;
    }
    if (this.saveData.filters.length == 0) {
      return;
    }
    // if (
    //   !this.saveData['filters'].some(x =>
    //     x.data.some(y => y.secondColChecked.length > 0)
    //   )
    // ) {
    //   return;
    // }

    let relevantBlockData = this.saveData['filters'].filter(
      x => x.id == event.blockId
    )[0];

    // let fieldName = relevantBlockData.filter(x => x.firstColId == event.firstColId)[0];
    let fieldName = this.filterSections.filter(x => x.id == event.blockId)[0]
      .data[event.firstColInd].label;

    event.filterObj.reportsService
      .getFilterValues(fieldName)
      .subscribe(values => {
        event.filterObj.secondColValues = values;
        let relevantArray = relevantBlockData.data.filter(
          x => x.firstColId == event.firstColInd
        )[0];
        event.filterObj.lastSelectedGroup = {
          id: event.firstColInd,
          label: fieldName,
          checked: true
        };

        for (let i = 0; i < event.filterObj.secondColValues.length; i++) {
          if (relevantArray.secondColChecked.includes(i)) {
            event.filterObj.secondColValues[i].checked = true;
          }
        }
        if (event.filterObj.dropdownList.length == 2) {
          event.filterObj.dropdownList.last.tgl.nativeElement.click();
        }
      });
  }
  ngOnInit(): void {
    this.initialize();
    // thisData.reportsService.getEventCodes('735CHSTO21').subscribe(results => {
    // this.allCodes = results.eventCodes;
    // this.codes.Attendee = this.getAttendeeCodes(this.allCodes);
    // });
  }

  private initialize() {
    this.saveReportForm = new FormGroup({
      reportSettingName: new FormControl()
    });
    this.reportsService.getFilters().subscribe(results => {
      this.filterDropdownData = results;
      this.filterSections = [
        {
          id: this.lastFilterSectionId,
          data: cloneDeep(this.filterDropdownData)
        }
      ];
    });

    this.saveData['filters'] = [
      {
        id: this.lastFilterSectionId,
        data: this.filterDropdownData.map(x => ({
          firstColId: x.id,
          secondColChecked: []
        }))
      }
    ];
    this.reportsService.getFields().subscribe(results => {
      this.fieldDropdownData = results;
    });
    this.reportsService.getGroupby().subscribe(results => {
      this.groupbyDropdownData = results;
    });
  }
  setSelectedGroups(filterObj, parent, groups: any[]) {
    filterObj.selectedGroups = groups;
    // if (filterObj.selectedGroups.includes(group)) {
    //   filterObj.selectedGroups.filter(x => x != group);
    // }

    // filterObj.selectedGroups.push(group);
  }
  setSelectedFields(fieldObj, parent, fields: any[]) {
    fieldObj.selectedFields = fields;
    fieldObj.thirdColValues = fields.map(x => {
      return { firstColId: x.id, text: x.label };
    });

    parent.reportsSettings.fields = parent.fieldDropdownData;
  }
  setSelectedGroupby(groupbyObj, parent, fields: any[]) {
    groupbyObj.selectedFields = fields;
    groupbyObj.thirdColValues = fields.map(x => {
      return { firstColId: x.id, text: x.label };
    });
    parent.reportsSettings.groupby = parent.groupbyDropdownData;
  }
  setLastSelectedGroup(filterObj, group: any) {
    filterObj.lastSelectedGroup = group;
    filterObj.update();
  }

  getSecondColumnContent(filterObj, group: any) {
    filterObj.reportsService.getFilterValues(group).subscribe(values => {
      filterObj.secondColValues = values;
    });
  }

  setLastSelectedField(fieldObj, field: any) {
    fieldObj.lastSelectedField = field;
  }
  addOrBlock() {
    this.lastFilterSectionId += 1;
    this.filterSections.push({
      id: this.lastFilterSectionId,
      data: cloneDeep(this.filterDropdownData)
    });
    let blockObj = {
      id: this.lastFilterSectionId,
      data: this.filterDropdownData.map(x => ({
        firstColId: x.id,
        secondColChecked: []
      }))
    };
    if (this.saveData.filters.length > 0) {
      this.saveData['filters'].push(blockObj);
    } else {
      this.saveData['filters'] = [blockObj];
    }
  }

  removeBlock(event) {
    this.filterSections = this.filterSections.filter(x => x.id != event);
    this.saveData['filters'] = this.saveData['filters'].filter(
      x => x.id != event
    );
    delete this.reviewData[event];
  }

  setActiveReport(reportType) {
    this.activeReport = reportType;
  }
  setActiveTab(tabNo) {
    this.activeTab = tabNo;
    this.setTabData(tabNo);
  }

  setTabData(tabNo) {
    if (tabNo == 2) {
      this.getMostRecentFilterData();
    }
  }

  updateReviewDataBlock(orBlockId) {
    this.reviewData[orBlockId] = this.getReviewDataBySectionId(orBlockId);
    // TODO
  }
  getReviewDataBySectionId(sectionId, fromComp = 'asil') {
    // helper function to list in the html
    // let newData = this.reviewData.filter(x => x.orBlockId == sectionId);
    let newData = this.saveData['filters'].filter(x => x.id == sectionId)[0]
      .data;
    let returnData = [];
    let relevantFilterSection = this.filterSections.filter(
      x => x.id == sectionId
    )[0].data;
    let text = '';
    for (let i = 0; i < relevantFilterSection.length; i++) {
      let selectedSecondCols = newData.filter(
        x => x.firstColId == relevantFilterSection[i].id
      )[0].secondColChecked;
      if (selectedSecondCols.length > 0) {
        text = newData[i].text;
        // text = `${relevantFilterSection[i].label} IN`;
        // for (let selection of selectedSecondCols) {
        //   text += ` ${selection}`;
        // }
        if (text) {
          returnData.push({ text: text });
        }
      }
    }
    // relevantFilterSection.data.
    //
    return new Array(returnData);
  }

  addBlockForReview(event) {
    // if (!this.reviewData.map(x => x.orBlockId).includes(event.orBlockId)) {
    //   let position = sortedIndex(
    //     this.reviewData.map(x => x.orBlockId),
    //     event.orBlockId
    //   );
    //   this.reviewData.splice(position, 0, event);
    // }
    for (let i = 0; i < this.saveData['filters'].length; i++) {
      if (this.saveData['filters'][i].id == event.orBlockId) {
        for (let j = 0; j < this.saveData['filters'][i].data.length; j++) {
          if (
            this.saveData['filters'][i].data[j].firstColId ==
            event.saveData.firstColSelection
          ) {
            this.saveData['filters'][i].data[j].secondColChecked =
              event.saveData.secondColSelection;
            this.saveData['filters'][i].data[j].text = event.data.filter(
              x => x.firstColId == j
            )[0].text;
          }
        }
      }
    }
    this.updateReviewDataBlock(event.orBlockId);
  }
  // removeAndCond(event) {
  //   for (let i = 0; i < this.saveData['filters'].length; i++) {
  //     if (this.saveData['filters'][i].id == event.orBlockId) {
  //       for (let j = 0; j < this.saveData['filters'][i].data.length; j++) {
  //         if (
  //           this.saveData['filters'][i].data[j].firstColId ==
  //           event.saveData.firstColSelection
  //         ) {
  //           this.saveData['filters'][i].data[j].secondColChecked = [];
  //         }
  //       }
  //     }
  //   }
  //   this.updateReviewDataBlock(event.orBlockId);
  // }

  getMostRecentFilterData() {
    this.updateFilterSelections();

    // this.filterSections.map();
    if (this.saveData) {
    }
  }
  getDateTime() {
    this.reportsSettings.selectedFromToDateTime['from'] = {
      date: this.datePickers.first.date,
      time: this.datePickers.first.time
    };
    // this.reportInterval['from'] =
    // this.reportInterval['to'] =

    this.reportsSettings.selectedFromToDateTime['to'] = {
      date: this.datePickers.last.date,
      time: this.datePickers.last.time
    };
  }

  getFields(selected) {
    this.reportsSettings.fields = selected;
  }
  getFilters(selected) {
    this.reportsSettings.filters = selected;
  }

  removeFromSaveData(event) {
    for (let i = 0; i < this.saveData['filters'].length; i++) {
      if (this.saveData['filters'][i].id == event.blockId) {
        for (let j = 0; j < this.saveData['filters'][i].data.length; j++) {
          if (
            this.saveData['filters'][i].data[j].firstColId == event.firstColId
          ) {
            this.saveData['filters'][i].data[j].secondColChecked = [];
          }
        }
      }
    }

    this.updateReviewDataBlock(event.orBlockId);
  }

  resetErrors(e?){
    this.reportNameNonUnique = false;
    this.reportNameBlank = false;
  }

  saveReportSetting() {
    this.resetErrors();
    let savedReportName = this.saveReportForm.get('reportSettingName').value;
    if (savedReportName) {
      savedReportName = savedReportName.trim();
    } else {
      return;
    }
    if (!savedReportName.replace(/\s/g, "").length) {
      this.reportNameBlank = true;
      return;
    }
    if (!this.isReportNameUnique(savedReportName)) {
      this.reportNameNonUnique = true;
      return;
    }
    this.savedReports.push({
      id: this.reportId,
      reportName: savedReportName,
      saveData: cloneDeep(this.saveData),
      reportsSettings: cloneDeep(this.reportsSettings),
      collapsed: true
    });
    this.reportId += 1;
    this.reportSaved = true;
    this.resetReportSelections();
  }

  remove(i){
    this.savedReports.splice(i, 1);
  }

  isReportNameUnique(reportName) {
    return (
      this.savedReports.filter(x => x.reportName == reportName).length == 0
    );
  }
  getCheckedList(candidateList) {
    return candidateList.filter(x => x.checked);
  }
  getFiltersWithText(filterArray) {
    return filterArray.filter(x => 'text' in x);
  }
  createArray(i) {
    return new Array(i + 1);
  }
}
