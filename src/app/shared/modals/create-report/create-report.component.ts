import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ReportService } from 'src/app/services/report.service';
import { API_URL2 } from 'src/app/services/url/url';

var headers= new HttpHeaders()
.set('content-type', 'application/json')
.set('Access-Control-Allow-Headers', 'Content-Type')
.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
.set('Access-Control-Allow-Origin', '*');

@Component({
  selector: 'app-create-report',
  templateUrl: './create-report.component.html',
  styleUrls: ['./create-report.component.scss']
})
export class CreateReportComponent implements OnInit {
  reportForm: FormGroup;
  eventList: any[] = [];
  displayInList: any[] = [
    "Event Metrics Tab",
    "Event Portal Dashboard"
  ];
  categoryList: any[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private httpClient: HttpClient,
    private reportService: ReportService
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
    this.reportForm = new FormGroup({
      event: new FormControl("", Validators.required),
      Name: new FormControl("", Validators.required),
      // reportKeywords: new FormControl("", Validators.required),
      CategoryId: new FormControl("", Validators.required),
      Description: new FormControl(""),
      reportFile: new FormControl(null, Validators.required),
      // displayIn: new FormControl(this.displayInList[0], Validators.required),
    });
    this.getAllEvent();
    this.getAllCategories();
    this.setReportFile();
  }

  getAllEvent() {
    const GET_ALL_EVENTS = API_URL2 + '/csi/event/services/eventV2/getAllEvents';
    this.httpClient.get(GET_ALL_EVENTS, { headers }).subscribe((eventsResponse: any) => {
      if (eventsResponse?.statusMessage === "Success") {
        const loggedInUser = localStorage.getItem("username");
        this.eventList = eventsResponse?.response?.events?.filter((event: any) => event.addUserid === loggedInUser);
      } else {
        console.error("failed to get the all events");
      }
    }, (error: HttpErrorResponse) => {
      console.error(error);
    });
  }

  getAllCategories() {
    this.reportService.getAllCategories().subscribe((categories: any) => {
      if (Array.isArray(categories)) {
        this.categoryList = categories;
      }
    }, (error: HttpErrorResponse) => {
      console.error(error);
    });
  }

  /** Set the blank report file as reportFile of the reportForm */
  setReportFile() {
    this.httpClient.get("/assets/reportfile_sample/BlankCanvas.trdx", { responseType: 'blob', headers: headers })
    .subscribe((response: Blob) => {
      this.lf["reportFile"].setValue(response);
      this.lf["reportFile"].updateValueAndValidity();
    });
  }

  get lf() {
    return this.reportForm.controls;
  }

  closeModal() {
    this.activeModal.close();
  }

  createReport() {
    Object.keys(this.lf)?.forEach(key => {
      this.lf[key].markAsTouched();
    });
    if (this.reportForm.valid) {
      const formData = new FormData();
      const reportFormValues = this.reportForm.value;
      formData.append("Name", String(reportFormValues?.Name).trim());
      formData.append("CategoryId", reportFormValues?.CategoryId);
      formData.append("Description", reportFormValues?.Description);
      formData.append("reportFile", reportFormValues?.reportFile, "BlankCanvas.trdx");
      this.reportService.createReport(formData).subscribe((report: any) => {
        if (report) {
          this.activeModal.close(report);
        }
      }, (error: HttpErrorResponse) => {
        console.error(error);
      });
    }
  }

  onReportFileSelect(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.lf["reportFile"].setValue(file);
      this.lf["reportFile"].updateValueAndValidity();
    }
  }
}
