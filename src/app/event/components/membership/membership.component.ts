import { Component, Input, OnInit, SimpleChange } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteConfirmComponent } from '../../modals/delete-confirm/delete-confirm.component';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-membership',
  templateUrl: './membership.component.html',
  styleUrls: ['./membership.component.scss']
})
export class MembershipComponent implements OnInit {
  @Input("data") membershipInfoList: any[];
  @Input("pageType") pageType: string;
  editIndex: number = -1;
  formError = {};

  constructor(
    private modalService: NgbModal,
    private toastService: ToastService,
  ) { }

  selectedItems: boolean[] = [];

  ngOnInit(): void {
    console.log("membershipInfoList: ", this.membershipInfoList);
    console.log("pageType: ", this.pageType);

    this.selectedItems = this.membershipInfoList.map(el => false);
  }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if (changes.membershipInfoList) {
      this.selectedItems = this.membershipInfoList.map(el => false);
    }    
  }

  createMembership() {
    this.membershipInfoList.unshift({
      memberuid: null,
      Member_ID: "",
      evtuid: null,
      First_Name: "",
      Last_Name: "",
      Company_Name: "",
      Addr1: "",
      City: "",
      State_Code: "",
      Postal_Code: "",
      Country_Code: "",
      Phone: "",
      Preferred_Email_Address: "",
      Member_Class_Code: ""
    });
    this.editIndex = 0;

    this.selectedItems.unshift(false);
  }

  editMembership(i: number) {
    if (this.editIndex >= 0) {
      this.toastService.show("Please save the current item.", {
        delay: 8000,
        classname: 'bg-warning text-light',
        headertext: 'Warning',
        autohide: true,
      });
    } else {
      this.editIndex = i;
    }
  }

  removeMembership(i: number) {
    const deleteMembershipConfirmModalRef = this.modalService.open(DeleteConfirmComponent, {
      size: 'sm',
      windowClass: 'modal-custom-deleteConfirm'
    });
    deleteMembershipConfirmModalRef.componentInstance.confirmMsg = "Delete this code?";
    deleteMembershipConfirmModalRef.result.then((agree: boolean) => {
      console.log("Do you want to delete?: ", agree);
      if (agree === true) {
        if (this.editIndex === i) this.editIndex = null;
        this.membershipInfoList?.splice(i, 1);
        this.selectedItems.splice(i, 1);
      }
    }).catch((err: Error) => {
      console.error("close error: ", err);
    });
  }

  saveMembership(i: number) {
    const requiredFields = ['Member_ID', 'First_Name', 'Last_Name', 'Company_Name', 'Preferred_Email_Address', 'Addr1', 'City', 'State_Code', 'Postal_Code', 'Country_Code', 'Phone', 'Member_Class_Code'];
    
    const curMembership = this.membershipInfoList[this.editIndex];

    let formIsValid = true;
    let formError = {};

    if (!curMembership["Preferred_Email_Address"]) {
      formIsValid = false;
      formError["Preferred_Email_Address"] = true;
    } else if (typeof curMembership["Preferred_Email_Address"] !== "undefined") {
      //regular expression for email validation
      let pattern = new RegExp(
        /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i
      );
      if (!pattern.test(curMembership["Preferred_Email_Address"])) {
        formIsValid = false;
        formError["Preferred_Email_Address"] = true;
      }
    }

    if (!curMembership["Phone"]) {
      formIsValid = false;
      formError["Phone"] = true;
    } else if (typeof curMembership["Phone"] !== "undefined") {
      //regular expression for email validation
      let pattern = new RegExp(
        /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
      );
      if (!pattern.test(curMembership["Phone"])) {
        formIsValid = false;
        formError["Phone"] = true;
      }
    }

    if (!curMembership["Postal_Code"]) {
      formIsValid = false;
      formError["Postal_Code"] = true;
    } else if (typeof curMembership["Postal_Code"] !== "undefined") {
      //regular expression for email validation
      let pattern = new RegExp(
        /(^\d{5}$)|(^\d{5}-\d{4}$)/
      );
      if (!pattern.test(curMembership["Postal_Code"])) {
        formIsValid = false;
        formError["Postal_Code"] = true;
      }
    }

    for (let field of requiredFields) {
      if (!curMembership[field]) {
        formIsValid = false;
        formError[field] = true;
      }
    }

    console.log(formError, curMembership);
    this.formError = formError;

    if (formIsValid) {
      this.editIndex = -1;
    } else {
      this.toastService.show("Please fill out invalid fields.", {
        delay: 8000,
        classname: 'bg-warning text-light',
        headertext: 'Warning',
        autohide: true,
      });
    }
  }

  checkedItem(checked: boolean, idx: number) {
    this.selectedItems[idx] = checked;
  }

  deleteSelectedItems() {
    const deleteRegtypeConfirmModalRef = this.modalService.open(DeleteConfirmComponent, {
      size: 'sm',
      windowClass: 'modal-custom-deleteConfirm'
    });
    deleteRegtypeConfirmModalRef.componentInstance.confirmMsg = "Delete these items?";
    deleteRegtypeConfirmModalRef.result.then((agree: boolean) => {
      console.log("Do you want to delete?: ", agree);
      if (agree === true) {
        let i = this.selectedItems.length - 1;
        while (i >= 0) {
          if (this.selectedItems[i]) {
            this.membershipInfoList.splice(i, 1);
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
