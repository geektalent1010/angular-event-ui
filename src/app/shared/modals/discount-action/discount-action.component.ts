import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-discount-action',
  templateUrl: './discount-action.component.html',
  styleUrls: ['./discount-action.component.scss']
})
export class DiscountActionComponent implements OnInit {
  @Input() discountList: any;
  @Input() discountData: any;
  _discountData;
  constructor(private activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    if(this.discountData){
      this._discountData = {...this.discountData};
    } else {
      this._discountData = {name: ''};
    }
  }

  closeModal() {
    this.activeModal.close();
  }

  save() {
    this.activeModal.close(this._discountData);
  }

}
