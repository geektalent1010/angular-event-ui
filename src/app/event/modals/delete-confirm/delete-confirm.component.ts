import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-delete-confirm',
  templateUrl: './delete-confirm.component.html',
  styleUrls: ['./delete-confirm.component.scss']
})
export class DeleteConfirmComponent implements OnInit {
  @Input() public confirmMsg;
  @Input() public agreeText;
  @Input() public cancelText;

  constructor(
    public activeModal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
    if (!this.confirmMsg) this.confirmMsg = "Delete this code?";
    if (!this.agreeText) this.agreeText = "Yes";
    if (!this.cancelText) this.cancelText = "Cancel";
  }

  delete() {
    this.activeModal.close(true);
  }

  cancel() {
    this.activeModal.close(false);
  }
}
