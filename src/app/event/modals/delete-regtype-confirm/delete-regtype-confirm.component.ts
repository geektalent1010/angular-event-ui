import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-delete-regtype-confirm',
  templateUrl: './delete-regtype-confirm.component.html',
  styleUrls: ['./delete-regtype-confirm.component.scss']
})
export class DeleteRegtypeConfirmComponent implements OnInit {

  constructor(
    public activeModal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
  }

  delete() {
    this.activeModal.close(true);
  }

  cancel() {
    this.activeModal.close(false);
  }
}
