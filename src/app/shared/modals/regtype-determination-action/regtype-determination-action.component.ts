import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-regtype-determination-action',
  templateUrl: './regtype-determination-action.component.html',
  styleUrls: ['./regtype-determination-action.component.scss']
})
export class RegTypeDeterminationComponent implements OnInit {
  @Input() regTypeList: any;
  @Input() regTypeData: any;
  _regTypeData;
  constructor(private activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    if(this.regTypeData){
      this._regTypeData = {...this.regTypeData};
    } else {
      this._regTypeData = {regType: ''};
    }
  }

  closeModal() {
    this.activeModal.close();
  }

  save() {
    this.activeModal.close(this._regTypeData);
  }

}
