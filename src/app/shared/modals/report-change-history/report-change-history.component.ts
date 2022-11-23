import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-report-change-history',
  templateUrl: './report-change-history.component.html',
  styleUrls: ['./report-change-history.component.scss']
})
export class ReportChangeHistoryComponent implements OnInit {
  @Input() public revisionList;
  historyList: any[] = [];

  constructor(
    public activeModal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
    // this.historyList = [
    //   {
    //     action: "Replaced Agent",
    //     dateCreated: new Date(),
    //     user: "JLevis",
    //     column: "Agent",
    //     changedFrom: "Jillian Carson",
    //     changedTo: "John Smith",
    //     description: "Jillian Carson left the team, added her replacement John Smith"
    //   }
    // ];
  }

  closeModal() {
    this.activeModal.close();
  }
}
