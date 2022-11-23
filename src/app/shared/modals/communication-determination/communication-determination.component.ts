import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-communication-determination',
  templateUrl: './communication-determination.component.html',
  styleUrls: ['./communication-determination.component.scss']
})
export class CommunicationDeterminationComponent implements OnInit {

  @Input() communicationList: any;
  @Input() communicationData: any;
  _communicationData;
  constructor(private activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    if(this.communicationData){
      this._communicationData = {...this.communicationData};
    } else {
      this._communicationData = {name: ''};
    }
  }

  closeModal() {
    this.activeModal.close();
  }

  save() {
    this.activeModal.close(this._communicationData);
  }

}
