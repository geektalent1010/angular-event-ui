import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ReportService } from 'src/app/services/report.service';

@Component({
  selector: 'app-publish-report',
  templateUrl: './publish-report.component.html',
  styleUrls: ['./publish-report.component.scss']
})
export class PublishReportComponent implements OnInit {
  @Input() public report;
  comment: string = "";

  constructor(
    private reportService: ReportService,
    public activeModal: NgbActiveModal
  ) { }

  ngOnInit(): void {
  }

  closeModal() {
    this.activeModal.close();
  }

  publish() {
    this.reportService.publishReport(this.report?.Id, this.comment).subscribe((response: any) => {
      console.error("publish response: ", response);
      this.activeModal.close(true);
    }, (error: HttpErrorResponse) => {
      console.error("publish report error: ", error);
    });
  }
}
