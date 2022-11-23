import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

type FileType = 'csv' | 'excel';
type ExportType = 'selected' | 'event';

@Component({
  selector: 'app-psm-export',
  templateUrl: './psm-export.component.html',
  styleUrls: ['./psm-export.component.scss'],
})
export class PSMExportComponent implements OnInit {
  public exportType: ExportType;
  public fileType: FileType;
  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    this.exportType = 'selected';
    this.fileType = 'csv';
  }

  setExportType(val: ExportType) {
    this.exportType = val;
  }

  setFileType(val: FileType) {
    this.fileType = val;
  }

  export() {
    this.activeModal.close({
      exportType: this.exportType,
      fileType: this.fileType,
    });
  }
}
