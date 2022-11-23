import { Component, EventEmitter, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { RegtypeData } from '../../interfaces/Regtype';
import { CreateRegtypeComponent } from '../../modals/create-regtype/create-regtype.component';
import { DeleteConfirmComponent } from '../../modals/delete-confirm/delete-confirm.component';

@Component({
  selector: 'app-reg-types',
  templateUrl: './reg-types.component.html',
  styleUrls: ['./reg-types.component.scss']
})
export class RegTypesComponent implements OnInit {
  @Input("data") regtypesList: any[];
  @Input("pageType") pageType: string;
  regtypeEditIndex: number = null;
  @Output() deleteRegType = new EventEmitter<any>();

  selectedItems: boolean[] = [];

  constructor(
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.selectedItems = this.regtypesList.map(el => false);

    console.log("regtypesList: ", this.regtypesList);
  }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if (changes.regtypesList) {
      this.selectedItems = this.regtypesList.map(el => false);
    }    
  }

  createRegtype() {
    const createRegtypeModalRef = this.modalService.open(CreateRegtypeComponent, {
      size: 'lg',
      windowClass: 'modal-custom-createRegtype'
    });
    createRegtypeModalRef.componentInstance.regtypesList = this.regtypesList;
    createRegtypeModalRef.result.then((regtype: any) => {
      console.log("New Created Regtype: ", regtype);
      if (!regtype) {
        return;
      }
      this.regtypesList.push(regtype);
      this.selectedItems.push(false);
    }).catch((err: Error) => {
      console.error("close error: ", err);
    });
  }

  editRegtype(i: number) {
    if (this.regtypeEditIndex === null || this.isRegtypeValidate(this.regtypeEditIndex)) {
      this.regtypeEditIndex = i;
    }
  }

  isRegtypeValidate(i) {
    let isValid: boolean = true;
    if(this.regtypesList[i].code == '' || this.regtypesList[i].description == ''){
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Reg code  or Reg description cannot be empty",
        confirmButtonColor: '#3085d6',
      });
      isValid = false;
    }
    const inValid: boolean = this.regtypesList.some((regtype: RegtypeData, index: number) => 
      index !== i &&
      (
        regtype.code.toLowerCase() === this.regtypesList[i].code.toLowerCase() ||
        regtype.description.toLowerCase() === this.regtypesList[i].description.toLowerCase()
      )
    );
    if (inValid) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Please check if the code and description value is duplicated",
        confirmButtonColor: '#3085d6',
      });
      isValid = false;
    }
    return isValid;
  }

  removeRegtype(i: number) {
    const deleteRegtypeConfirmModalRef = this.modalService.open(DeleteConfirmComponent, {
      size: 'sm',
      windowClass: 'modal-custom-deleteConfirm'
    });
    deleteRegtypeConfirmModalRef.componentInstance.confirmMsg = "Delete this code?";
    deleteRegtypeConfirmModalRef.result.then((agree: boolean) => {
      console.log("Do you want to delete?: ", agree);
      if (agree === true) {
        if (this.regtypeEditIndex === i) this.regtypeEditIndex = null;
        this.deleteRegType.emit(i);
        this.selectedItems.splice(i, 1);
      }
    }).catch((err: Error) => {
      console.error("close error: ", err);
    });
  }

  saveRegtype(i: number) {
    if (this.isRegtypeValidate(i)) {
      this.regtypeEditIndex = null;
    }
  }

  validateRegtypes() {
    const hasEmpltyValue: boolean = this.regtypesList.some((regtype: RegtypeData, index: number) => regtype.code == "" || regtype.description == "");
    if (hasEmpltyValue) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Please check if the code and description value is empty",
        confirmButtonColor: '#3085d6',
      });
      return false;
    }

    const codeList: string[] = [...new Set(this.regtypesList.map((regtype: RegtypeData) => regtype.code.toLowerCase()))];
    const descriptioinList: string[] = [...new Set(this.regtypesList.map((regtype: RegtypeData) => regtype.description.toLowerCase()))];
    if (codeList.length !== this.regtypesList.length || descriptioinList.length !== this.regtypesList.length) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Please check if the code and description value is duplicated",
        confirmButtonColor: '#3085d6',
      });
      return false;
    }
    return true;
  }

  checkedItem(checked: boolean, idx: number) {
    this.selectedItems[idx] = checked;
  }

  deleteSelectedItems() {
    const deleteRegtypeConfirmModalRef = this.modalService.open(DeleteConfirmComponent, {
      size: 'sm',
      windowClass: 'modal-custom-deleteConfirm'
    });
    deleteRegtypeConfirmModalRef.componentInstance.confirmMsg = "Delete these codes?";
    deleteRegtypeConfirmModalRef.result.then((agree: boolean) => {
      console.log("Do you want to delete?: ", agree);
      if (agree === true) {
        let i = this.selectedItems.length - 1;
        while (i >= 0) {
          if (this.selectedItems[i]) {
            this.deleteRegType.emit(i);
            this.selectedItems.splice(i, 1);
          }
          i--;
        }
      }
    }).catch((err: Error) => {
      console.error("close error: ", err);
    });
  }

  selectAllItems() {
    let val = this.disableDeleteBtn();
    this.selectedItems = this.selectedItems.map(el => val);
  }

  disableDeleteBtn() {
    return this.selectedItems.every(el => !el);
  }
}
