import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-package-action',
  templateUrl: './package-action.component.html',
  styleUrls: ['./package-action.component.scss']
})
export class PackageActionComponent implements OnInit {
  @Input() packageList: any;
  @Input() packageData: any;
  _packageData;
  constructor(private activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    if(this.packageData){
      this._packageData = {...this.packageData};
    } else {
      this._packageData = {name: ''};
    }
  }

  closeModal() {
    this.activeModal.close();
  }

  save() {
    this.activeModal.close(this._packageData);
  }

}
