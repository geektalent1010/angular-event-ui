import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ReportService, ReportUserData } from '../services/report.service';
import { CreateReportComponent } from '../shared/modals/create-report/create-report.component';
import { EditReportComponent } from '../shared/modals/edit-report/edit-report.component';
import { PublishReportComponent } from '../shared/modals/publish-report/publish-report.component';
import * as moment from "moment";
import { MdbTableDirective, MdbTablePaginationComponent } from 'angular-bootstrap-md';
import { Subject } from 'rxjs-compat';
import { forkJoin } from 'rxjs';
import { API_URL2 } from '../services/url/url';
interface ReportData {
  Id: String,
  lastEditedDate: Date,
  lastEditedUser: String,
  reportName: String,
  description: String,
  categoryId: String,
  LockedBy: String,
  highlight: Boolean,
  editable?: Boolean
};

@Component({
  selector: 'app-report-explorer',
  templateUrl: './report-explorer.component.html',
  styleUrls: ['./report-explorer.component.scss']
})
export class ReportExplorerComponent implements OnInit, AfterViewInit {
  @ViewChild(MdbTablePaginationComponent, { static: true }) reportTablePagination: MdbTablePaginationComponent;
  @ViewChild(MdbTableDirective, { static: true }) reportTable: MdbTableDirective
  currentTab = 1;
  reportList: ReportData[] = [];
  filteredReportList: ReportData[] = [];
  periodOptions: any[] = [
    { label: "Last 24 hours", value: "1" },
    { label: "Last 7 days", value: "7" },
    { label: "Last 14 days", value: "14" },
    { label: "Last 30 days", value: "30" }
  ];
  searchForm: FormGroup = new FormGroup({
    period: new FormControl(this.periodOptions[3].value),
    search: new FormControl("")
  });
  userId: Subject<string> = new Subject<string>();
  lastEventNameByUser: String;

  constructor(
    private modalService: NgbModal,
    private reportService: ReportService,
    private http: HttpClient,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.reportList = [];
    const username: string = localStorage.getItem("username");
    const password: string = localStorage.getItem("password");
    this.getLastCreatedEventName();
    this.getAllReportUsers();
    this.reportService.reportUserLogin(username, password).then((token: any[]) => {
      if (token) {
        if (localStorage.getItem("reportUserId")) {
          this.getAllReports();
        } else {
          this.userId.subscribe(() => {
            this.getAllReports();
          });
        }
      }
    }).catch(error => {
      console.error(error);
    });
    this.searchForm.controls["period"].valueChanges.subscribe((period: string) => {
      this.searchFilter(period, "period");
    });
    this.searchForm.controls["search"].valueChanges.pipe(
      startWith(""),
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((search: string) => {
      this.searchFilter(search, "search");
    });
  }

  ngAfterViewInit() {
    this.reportTablePagination.setMaxVisibleItemsNumberTo(10);
    this.reportTablePagination.calculateFirstItemIndex();
    this.reportTablePagination.calculateLastItemIndex();
    this.cdRef.detectChanges();
  }

  getLastCreatedEventName() {

    const username: string = localStorage.getItem("username");

    var LAST_EVENT_API = API_URL2 + '/csi/event/services/eventV2/getLastEventCreatedByUser?username=' + username;
    this.http.get(LAST_EVENT_API).subscribe(data => {
      console.log("getLastEventCreatedByUser");
      console.log(data);
      console.log(data['response']['Error']);
      if (data['response']['Error'] != undefined) {

          var returnedData = data;
          console.log(returnedData);

       // window.location.href='/eventerror';
      }
      else {
        this.lastEventNameByUser = data['response']['event']['evtname'];
        console.log(this.lastEventNameByUser);
      }
    });

  }

  getAllReportUsers() {
    this.reportService.telerkLogin().then((access_token: string) => {
      if (access_token) {
        this.reportService.getAllUsers().subscribe((userList: ReportUserData[]) => {
          const username: string = localStorage.getItem("username");
          const userId: string = userList.find((user: ReportUserData) => user.Username === username)?.Id;
          localStorage.setItem("reportUserId", userId);
          this.userId.next(userId);
        }, (error: HttpErrorResponse) => {
          console.error(error);
        });
      }
    }).catch(error => {
      console.error(error);
    });
  }

  /** Search and Filter the report list on the table */
  searchFilter(value: string, field: string) {
    let searchValues = this.searchForm.value;
    if (value && field) {
      searchValues[field] = value;
    }
    let filteredReportList = this.reportList
      .filter((report: any) => {
        const diffHours = moment().diff(moment(report.lastEditedDate), "hours");
        if (diffHours <= Number(searchValues["period"]) * 24) {
          return true;
        } else {
          return false;
        }
      })
      .filter((report: any) => String(report?.reportName).toLowerCase().includes(searchValues["search"].toLowerCase()));

    this.filteredReportList = filteredReportList;
    this.reportTable.setDataSource(this.filteredReportList);
    this.filteredReportList = this.reportTable.getDataSource();
    this.reportTablePagination.firstPage();
    this.cdRef.detectChanges();
  }

  /** Get All reports */
  getAllReports() {
    this.reportService.getAllReports().subscribe((reports: any[]) => {
      const userId: string = localStorage.getItem("reportUserId");
      this.reportList = reports?.map((report: any) => {
        return {
          Id: report.Id,
          lastEditedDate: new Date(report.LastModifiedDate),
          lastEditedUser: report.CreatedByName,
          reportName: report.Name,
          description: report.Description,
          categoryId: report.CategoryId,
          LockedBy: report?.LockedBy,
          highlight: false,
          editable: report.CreatedBy === userId
        };
      });
      this.reportList = this.reportList.sort((a, b) => new Date(a.lastEditedDate) > new Date(b.lastEditedDate) ? -1 : 1);
      this.filteredReportList = this.reportList;
      this.searchFilter(null, null);
    }, (error: HttpErrorResponse) => {
      console.error("get app reports error: ", error);
    });
  }

  setTab(tab: number): void {
    this.currentTab = tab;
  }

  createReport() {
    const createReportModalRef = this.modalService.open(CreateReportComponent, {
      size: 'lg',
      windowClass: 'modal-custom-createReport'
    });
    createReportModalRef.result.then(report => {
      if (report) {
        const userId: string = localStorage.getItem("reportUserId");
        const newReport: ReportData = {
          Id: report.Id,
          lastEditedDate: new Date(report.LastModifiedDate),
          lastEditedUser: report.CreatedByName,
          reportName: report.Name,
          description: report.Description,
          categoryId: report.CategoryId,
          LockedBy: report?.LockedBy,
          highlight: true,
          editable: report.CreatedBy === userId
        };
        this.reportList.push(newReport);
        this.reportList.sort((a, b) => new Date(a.lastEditedDate) > new Date(b.lastEditedDate) ? -1 : 1);
        this.searchFilter(null, null);
        window.open("/tlkreportdesigner/" + newReport?.reportName, "_blank");
      }
    });
  }

  editReport(report: any) {
    const editReportModalRef = this.modalService.open(EditReportComponent, {
      size: 'lg',
      windowClass: 'modal-custom-editReport'
    });
    editReportModalRef.componentInstance.report = report;
    editReportModalRef.result.then(isEditing => {});
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  publish(report: any) {
    const publishReportModalRef = this.modalService.open(PublishReportComponent, {
      size: 'lg',
      windowClass: 'modal-custom-publishReport'
    });
    publishReportModalRef.componentInstance.report = report;
    publishReportModalRef.result.then(isPublished => {});
  }

  edit(report: any) {
    window.open("/tlkreportdesigner/" + report?.reportName, "_blank");
  }

  export(report: any, exportType: string) {
    this.reportService.exportReport(report.Id, exportType).then((documentLink: string) => {
      const a = document.createElement('a')
      a.href = documentLink
      a.click();
      URL.revokeObjectURL(documentLink);
    }).catch(error => {
      if (!error) {
        console.error("Failed to export the report.");
      }
    });
  }

  live(report: any) {
    const previewLink = "/tlkreportviewer/" + report?.reportName + "?report_name=" + this.lastEventNameByUser;
    window.open(previewLink,'_blank');
  }
}
