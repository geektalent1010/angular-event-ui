import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-session-action',
  templateUrl: './session-action.component.html',
  styleUrls: ['./session-action.component.scss']
})
export class SessionActionComponent implements OnInit {
  @Input() sessionList: any;
  @Input() sessionData: any;
  _sessionData;
  constructor(private activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    if(this.sessionData){
      this._sessionData = {...this.sessionData};
    } else {
      this._sessionData = {name: ''};
    }
  }

  closeModal() {
    this.activeModal.close();
  }

  save() {
    this.activeModal.close(this._sessionData);
  }

}
