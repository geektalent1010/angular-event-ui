import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReportService } from 'src/app/services/report.service';
import { environment } from 'src/environments/environment';
import { ReportChangeHistoryComponent } from '../report-change-history/report-change-history.component';

declare const Tiff: any;

@Component({
  selector: 'app-edit-report',
  templateUrl: './edit-report.component.html',
  styleUrls: ['./edit-report.component.scss']
})
export class EditReportComponent implements OnInit {
  @Input() public report;
  public revisionList: any[] = [];
  loadingThumbnail: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private reportService: ReportService,
    private httpClient: HttpClient,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.getThumbnail();
    this.reportService.getRevisions(this.report?.Id).subscribe((revisions: any[]) => {
      console.error("revision list: ", revisions);
      if (Array.isArray(revisions)) {
        this.revisionList = revisions;
      }
    }, (error: HttpErrorResponse) => {
      console.error(error);
    });
  }

  closeModal() {
    this.activeModal.close();
  }

  editReport() {
    // window.open(environment.telerkServer + "/Report/Designer/" + this.report?.Id, "_blank");
    window.open("/tlkreportdesigner/" + this.report?.reportName, "_blank");
    this.activeModal.close(true);
  }

  getThumbnail() {
    this.loadingThumbnail = true;
    this.spinner.show("thumbnailLoadingSpinner");
    this.reportService.exportReport(this.report.Id, "image").then((documentLink: string) => {
      if (documentLink) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'arraybuffer';
        xhr.open('GET', documentLink);
        xhr.onload = (e) => {
          try {
            var tiff = new Tiff({buffer: xhr.response});
            var canvas = tiff.toCanvas();
            document.getElementById("thumbnail").append(canvas);
            this.loadingThumbnail = false;
            this.spinner.hide("thumbnailLoadingSpinner");
          } catch (err) {
            const ErrorElement = document.createElement("h4");
            ErrorElement.innerHTML = "Empty Report";
            document.getElementById("thumbnail").append(ErrorElement);
            this.thumbnailErrorHandling(err);
          }
        };
        xhr.onerror = (err: any) => {
          this.thumbnailErrorHandling(err);
        }
        xhr.onabort = (err: any) => {
          this.thumbnailErrorHandling(err);
        }
        xhr.send();
      } else {
        this.thumbnailErrorHandling("Empty document Link.");
      }
    }).catch(error => {
      this.thumbnailErrorHandling(error);
    });
  }

  thumbnailErrorHandling(error: any) {
    this.loadingThumbnail = false;
    this.spinner.hide("thumbnailLoadingSpinner");
    console.error("Failed to load the thumbnail in the Tiff Canvas Viewer.");
    console.error(error);
  }

  viewChangeHistory() {
    this.activeModal.close();
    const changeHistoryModalRef = this.modalService.open(ReportChangeHistoryComponent, {
      size: 'lg',
      windowClass: 'modal-custom-reportChangeHistory'
    });
    changeHistoryModalRef.componentInstance.revisionList = this.revisionList;
    changeHistoryModalRef.result.then(report => {
    });
  }

  async getBase64ImageFromUrl(imageUrl) {
    var res = await fetch(imageUrl);
    var blob = await res.blob();
    return new Promise((resolve, reject) => {
      var reader  = new FileReader();
      reader.addEventListener("load", function () {
          resolve(reader.result);
      }, false);
      reader.onerror = () => {
        return reject(this);
      };
      reader.readAsDataURL(blob);
    })
  }
}
