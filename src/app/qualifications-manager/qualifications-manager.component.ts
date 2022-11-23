import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AfterContentChecked, AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MdbTableDirective, MdbTablePaginationComponent } from 'angular-bootstrap-md';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ImageConstants } from '../event-pages/imageConstants';
import { API_URL2 } from '../services/url/url';

var headers= new HttpHeaders()
.set('content-type', 'application/json')
.set('Access-Control-Allow-Headers', 'Content-Type')
.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
.set('Access-Control-Allow-Origin', '*');

interface QualificationData {
  id?: string,
  approved: string,
  eventName: string,
  userName: string,
  fullName: string,
  regTypeName: string,
  regUid: string,
  docType: string,
  image: string,
  aiProbability: number,
  aiApproved: boolean,
  lastEdits: string | string[]
};

interface SearchData {
  keyword: string,
  event: string[],
  reg: string[],
  type: string[],
  status: string[]
};

@Component({
  selector: 'app-qualifications-manager',
  templateUrl: './qualifications-manager.component.html',
  styleUrls: ['./qualifications-manager.component.scss']
})
export class QualificationsManagerComponent implements OnInit, AfterViewChecked {
  @ViewChild(MdbTablePaginationComponent, { static: true }) qualificationTablePagination: MdbTablePaginationComponent;
  @ViewChild(MdbTableDirective, { static: true }) qualificationTable: MdbTableDirective
  qualificationList: QualificationData[] = [];
  qualification: QualificationData = null;
  filteredQualificationList: QualificationData[] = [];
  prevStatus: string = null;
  qualificationChangeHistories: any[] = [];
  comment: string = "";
  username: string = "";
  ApprovedOptions: string[] = [
    "Pending",
    "Approved",
    "Denied"
  ];

  private GET_QUALIFICATIONS_API = API_URL2 + "/csi/event/services/registerV2/getFormattedQualifications?username=";

  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 1,
    allowSearchFilter: true
  };
  searchDefaultData: SearchData = {
    keyword: "",
    event: [],
    reg: [],
    type: [
      "Photo ID",
      "Tax ID",
      "Pay Stub",
      "Business License",
      "Driver's License"
    ],
    status: [
      "Pending",
      "Approved",
      "Denied"
    ]
  };
  searchData: SearchData = {
    keyword: "",
    event: [],
    reg: [],
    type: [],
    status: []
  };
  searchSubject = new Subject()

  constructor(
    private httpClient: HttpClient,
    private cdRef: ChangeDetectorRef,
    private modalService: BsModalService,
    private ngbModalService: NgbModal
  ) {


		if (localStorage.getItem("Authorization")) {
	      headers = new HttpHeaders()
	      .set('content-type', 'application/json')
	      .set('Access-Control-Allow-Headers', 'Content-Type')
	      .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
	      .set('Access-Control-Allow-Origin', '*')
	      .set('Authorization', localStorage.getItem("Authorization"));
		}

	}

  ngOnInit(): void {
    this.qualificationList = [];
    this.qualificationChangeHistories = [];
    this.getQualifications();

    /** Debounce and subscribe the search by keyword */
    this.searchSubject.pipe(
      startWith(""),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((keyword: any) => {
      this.search();
    });
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
    this.qualificationTablePagination.setMaxVisibleItemsNumberTo(10);
    this.qualificationTablePagination.calculateFirstItemIndex();
    this.qualificationTablePagination.calculateLastItemIndex();
    this.cdRef.detectChanges();
  }

  /** Get the qualifications from the username */
  getQualifications() {
    this.username = localStorage.getItem("username");
    this.httpClient.get(this.GET_QUALIFICATIONS_API + this.username, { headers }).subscribe((qualificationRes: any) => {
      if (qualificationRes?.statusMessage === "Success") {
        let eventList: string[] = [];
        let regList: string[] = [];
        this.qualificationList = qualificationRes.response?.map((qualification: QualificationData, index: number) => {
          if (!eventList.includes(qualification.eventName)) {
            eventList.push(qualification.eventName);
          }
          if (!regList.includes(qualification.regTypeName)) {
            regList.push(qualification.regTypeName);
          }
          const lastEdits: string | string[] = qualification.lastEdits;
          let image: string = "";
          switch (qualification.docType) {
            case "Photo ID":
              image = ImageConstants.photoID;
              break;
            case "Tax ID":
              image = ImageConstants.taxIDNumber;
              break;
            case "Pay Stub":
              image = ImageConstants.payStub;
              break;
            case "Business License":
              image = ImageConstants.busLi;
              break;
            case "Driver's License":
              image = ImageConstants.csiImagePlaceholder;
              break;
            default:
              break;
          }
          return {
            ...qualification,
            lastEdits: Array.isArray(lastEdits) ? lastEdits[lastEdits.length - 1] : lastEdits,
            image: image
            // image: "data:image/png;base64," + qualification.image
          };
        });
        this.filteredQualificationList = [...this.qualificationList];
        this.searchDefaultData["event"] = eventList;
        this.searchDefaultData["reg"] = regList;
        this.search();
      } else {
        console.error("Get Qualification Reqest Failed: ", qualificationRes);
      }
    }, (error: HttpErrorResponse) => {
      console.error("Get Qualification Error: ", error);
    });
  }

  changeApproved(model: any, newValue: string, qualification: QualificationData) {
    this.changeStatus(qualification.id, newValue);
    this.prevStatus = qualification.approved;
    this.qualification = qualification;
    this.qualification.approved = newValue;
    const addCommentRef = this.ngbModalService.open(model, {
      size: 'lg',
      windowClass: 'modal-custom-addComment'
    });
    addCommentRef.result.then((saved: boolean) => {
      if (!saved) {
        // Back the approved toggle
        this.changeStatus(qualification.id, this.prevStatus);
      }
    }).catch((err: any) => {
      console.log("Add comment modal dismissed!");
      // Back the approved toggle
      this.changeStatus(qualification.id, this.prevStatus);
    });
  }

  changeStatus(id: string, value: string) {
    this.filteredQualificationList = this.filteredQualificationList.map((q: QualificationData) => {
      if (q.id === id) {
        return {
          ...q,
          approved: value
        };
      }
      return q;
    });
    this.cdRef.detectChanges();
  }

  /** Get the Change Histories from the API and Show the Change History Modal */
  showChangeHistory(model: any, qualification: QualificationData) {
    this.comment = "";
    this.qualificationChangeHistories = [];
    const commentHistoriesURL: string = `${environment.serviceAPI}/apiv2/csi/event/services/registerV2/getCommentHistories?qualificationId=${qualification.id}`;
    this.httpClient.get(commentHistoriesURL, { headers }).subscribe((commentHistoriesRes: any) => {
      console.error("Comment Histories Response: ", commentHistoriesRes);
      if (commentHistoriesRes.statusMessage === "Success") {
        this.qualificationChangeHistories = commentHistoriesRes.response;
      } else {
        console.error("Failed Comment Histories Response: ", commentHistoriesRes);
      }
    }, (error: HttpErrorResponse) => {
      console.error("Get Comment Histories Error: ", error);
    });
    this.ngbModalService.open(model, {
      size: 'lg',
      windowClass: 'modal-custom-changeHistory'
    });
  }

  toggleAiApproved(index: number, enable: boolean) {
    if (enable === true) {
      this.qualificationList[index].aiApproved = !this.qualificationList[index].aiApproved;
    }
  }

  /** Ng multiselect dropdown change item event */
  onItemChange(selected: string[], field: string = "") {
    if (field !== "") {
      this.searchData[field] = selected;
      this.search();
    }
  }

  /** Search keyworkd keyup event */
  searchKeyword() {
    this.searchSubject.next(this.searchData["keyword"])
  }

  /** Apply the search options to the table */
  search() {
    let filteredQualificationList: QualificationData[] = [];
    if (this.searchData["keyword"]) {
      const keyword = this.searchData["keyword"].trim().toLowerCase();
      filteredQualificationList = this.qualificationList.filter((qualification: QualificationData) => {
        if (qualification.eventName?.toLowerCase()?.includes(keyword)) {
          return true;
        }
        if (qualification.fullName?.toLowerCase()?.includes(keyword)) {
          return true;
        }
        if (qualification.regTypeName?.toLowerCase()?.includes(keyword)) {
          return true;
        }
        if (qualification.docType?.toLowerCase()?.includes(keyword)) {
          return true;
        }
        if (String(qualification.lastEdits)?.toLowerCase()?.includes(keyword)) {
          return true;
        }
        return false;
      });
    } else {
      filteredQualificationList = this.qualificationList;
    }
    if (this.searchData["event"].length > 0) {
      filteredQualificationList = filteredQualificationList
        .filter((qualification: QualificationData) => this.searchData["event"].includes(qualification.eventName));
    }
    if (this.searchData["reg"].length > 0) {
      filteredQualificationList = filteredQualificationList
        .filter((qualification: QualificationData) => this.searchData["reg"].includes(qualification.regTypeName));
    }
    if (this.searchData["type"].length > 0) {
      filteredQualificationList = filteredQualificationList
        .filter((qualification: QualificationData) => this.searchData["type"].includes(qualification.docType));
    }
    if (this.searchData["status"].length > 0) {
      filteredQualificationList = filteredQualificationList
        .filter((qualification: QualificationData) => this.searchData["status"].includes(qualification.approved));
    }
    this.filteredQualificationList = Object.assign(filteredQualificationList);
    this.qualificationTable.setDataSource(this.filteredQualificationList);
    this.filteredQualificationList = this.qualificationTable.getDataSource();
    this.qualificationTablePagination.firstPage();
    this.cdRef.detectChanges();
  }

  /** Add Comment */
  addComment(modal: any) {
    const commentRequest = {
      commentType: "qualification",
      attendeeQualificationId: this.qualification.id,
      discountId: 0,
      attendeeUid: localStorage.getItem("attendeeUid"),
      actions: this.qualification.approved,
      createdAt: new Date().toISOString(),
      regType: this.qualification.id,
      user: this.username,
      comment: this.comment,
      eventName: this.qualification.eventName,
      docType: this.qualification.docType
    };
    const approvalCommentURL: string = `${environment.serviceAPI}/apiv2/csi/event/services/registerV2/approvalComment`;
    this.httpClient.post(approvalCommentURL, commentRequest, { headers }).subscribe((commentRes: any) => {
      if (commentRes.statusMessage === "Success") {
        const index = this.qualificationList.findIndex((qualification: QualificationData) => qualification.id === this.qualification.id);
        this.qualificationList[index].lastEdits = this.comment;
        this.search();
        this.comment = "";
        modal.close(true);
      } else {
        console.error("Comment Failed Response: ", commentRes);
      }
    }, (error: HttpErrorResponse) => {
      console.error("Comment error: ", error);
    });
  }

  cancelComment(modal: any) {
    this.comment = "";
    modal.close(false);
  }
}
