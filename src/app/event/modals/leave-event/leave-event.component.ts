import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

type LeaveAction = 'save' | 'ignore' | 'continue';
@Component({
  selector: 'app-leave-event',
  templateUrl: './leave-event.component.html',
  styleUrls: ['./leave-event.component.scss'],
})
export class LeaveEventComponent implements OnInit {
  @Input() pageType: string;
  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}

  leave(action: LeaveAction) {
    this.activeModal.close({ action });
  }
}
