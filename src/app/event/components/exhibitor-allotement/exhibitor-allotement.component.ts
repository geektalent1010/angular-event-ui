import { Component, Input, OnInit, SimpleChange } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteConfirmComponent } from '../../modals/delete-confirm/delete-confirm.component';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-exhibitor-allotement',
  templateUrl: './exhibitor-allotement.component.html',
  styleUrls: ['./exhibitor-allotement.component.scss'],
})
export class ExhibitorAllotementComponent implements OnInit {
  @Input('data') exhibitorAllotmentList: any[];
  @Input('pageType') pageType: string;

  editIndex: number = -1;
  formError = {};

  constructor(
    private modalService: NgbModal,
    private toastService: ToastService
  ) {}

  selectedItems: boolean[] = [];

  ngOnInit(): void {
    console.log('exhibitorAllotmentList: ', this.exhibitorAllotmentList);
    console.log('pageType: ', this.pageType);

    this.selectedItems = this.exhibitorAllotmentList.map((el) => false);
  }

  ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
    if (changes.exhibitorAllotmentList) {
      this.selectedItems = this.exhibitorAllotmentList.map((el) => false);

      let count = {};
      this.exhibitorAllotmentList.forEach((item) => {
        if (typeof item['Primary_Contact_Email_Address'] !== 'undefined') {
          if (count[item['Primary_Contact_Email_Address']]) {
            count[item['Primary_Contact_Email_Address']] += 1;
          } else {
            count[item['Primary_Contact_Email_Address']] = 1;
          }
        }
      });
      let duplicated = [];
      for (let key in count) {
        if (count[key] > 1) {
          duplicated.push(key);
        }
      }

      if (duplicated.length > 0) {
        this.toastService.show(
          'Email ' +
            (duplicated.length === 1 ? 'address is ' : 'addresses are ') +
            ' duplicated. ' +
            duplicated.join(', '),
          {
            delay: 8000,
            classname: 'bg-warning text-light',
            headertext: 'Warning',
            autohide: true,
          }
        );
      }
    }
  }

  createAllotment() {
    this.exhibitorAllotmentList.unshift({
      exhuid: null,
      Exhibitor_ID: '',
      Org_Id: null,
      evtuid: null,
      Contract_num: null,
      Booth_Number: null,
      Company_Name: '',
      Booth_Square_Footage: '',
      Booth_Dimensions: '',
      Allotment: null,
      Primary_Contact_First_Name: '',
      Primary_Contact_Last_Name: '',
      Primary_Contact_Title: '',
      Address1: '',
      Address2: '',
      City: '',
      State: '',
      Postal_Code: null,
      Country: '',
      Primary_Contact_Email_Address: '',
      Phone_Number: null,
      Company_Website_URL: '',
      Membership_Status: 0,
      Blocklisting: null,
      Fax: '',
    });
    this.editIndex = 0;

    this.selectedItems.unshift(false);
  }

  editAllotment(i: number) {
    if (this.editIndex >= 0) {
      this.toastService.show('Please save the current item.', {
        delay: 8000,
        classname: 'bg-warning text-light',
        headertext: 'Warning',
        autohide: true,
      });
    } else {
      this.editIndex = i;
    }
  }

  removeAllotment(i: number) {
    const deleteAllotmentConfirmModalRef = this.modalService.open(
      DeleteConfirmComponent,
      {
        size: 'sm',
        windowClass: 'modal-custom-deleteConfirm',
      }
    );
    deleteAllotmentConfirmModalRef.componentInstance.confirmMsg =
      'Delete this code?';
    deleteAllotmentConfirmModalRef.result
      .then((agree: boolean) => {
        console.log('Do you want to delete?: ', agree);
        if (agree === true) {
          if (this.editIndex === i) this.editIndex = null;
          this.exhibitorAllotmentList?.splice(i, 1);
          this.selectedItems.splice(i, 1);
        }
      })
      .catch((err: Error) => {
        console.error('close error: ', err);
      });
  }

  saveAllotment(i: number) {
    const requiredFields = [
      'Org_Id',
      'Exhibitor_ID',
      'Company_Name',
      'Primary_Contact_Email_Address',
      'Address1',
      'City',
      'State',
      'Postal_Code',
      'Country',
      'Phone_Number',
      'Allotment',
    ];

    const fieldNames = {
      Org_Id: 'Org ID',
      Exhibitor_ID: 'Exhibitor ID',
      Company_Name: 'Company Name',
      Contract_num: 'Contact',
      Primary_Contact_Email_Address: 'Email',
      Address1: 'Address',
      Address2: 'Address2',
      City: 'City',
      State: 'State',
      Postal_Code: 'Zip',
      Country: 'Country',
      Phone_Number: ' Phone',
      Fax: 'Fax',
      Allotment: 'Allotment',
    };

    const curExallotment = this.exhibitorAllotmentList[this.editIndex];
    let formIsValid = true;
    let formError = {};

    if (!curExallotment['Primary_Contact_Email_Address']) {
      formIsValid = false;
      formError['Primary_Contact_Email_Address'] = true;
    } else if (
      typeof curExallotment['Primary_Contact_Email_Address'] !== 'undefined'
    ) {
      //regular expression for email validation
      let pattern = new RegExp(
        /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i
      );
      let filtered = this.exhibitorAllotmentList.filter((item) => {
        return (
          typeof item['Primary_Contact_Email_Address'] !== 'undefined' &&
          item['Primary_Contact_Email_Address'].trim().toLowerCase() ===
            curExallotment['Primary_Contact_Email_Address'].trim().toLowerCase()
        );
      });
      if (
        !pattern.test(curExallotment['Primary_Contact_Email_Address']) ||
        filtered.length >= 2
      ) {
        formIsValid = false;
        formError['Primary_Contact_Email_Address'] = true;
      }
    }

    if (!curExallotment['Phone_Number']) {
      formIsValid = false;
      formError['Phone_Number'] = true;
    } else if (typeof curExallotment['Phone_Number'] !== 'undefined') {
      //regular expression for email validation
      let pattern = new RegExp(
        /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
      );
      if (!pattern.test(curExallotment['Phone_Number'])) {
        formIsValid = false;
        formError['Phone_Number'] = true;
      }
    }

    if (!curExallotment['Postal_Code']) {
      formIsValid = false;
      formError['Postal_Code'] = true;
    } else if (typeof curExallotment['Postal_Code'] !== 'undefined') {
      //regular expression for email validation
      let pattern = new RegExp(/(^\d{5}$)|(^\d{5}-\d{4}$)/);
      if (!pattern.test(curExallotment['Postal_Code'])) {
        formIsValid = false;
        formError['Postal_Code'] = true;
      }
    }

    for (let field of requiredFields) {
      if (!curExallotment[field]) {
        formIsValid = false;
        formError[field] = true;
      }
    }

    console.log(formError, curExallotment);
    this.formError = formError;

    let errorFields = [];
    Object.keys(formError).forEach((field) =>
      errorFields.push(fieldNames[field])
    );
    if (formIsValid) {
      this.editIndex = -1;
    } else {
      this.toastService.show(
        'Please complete invalid fields: ' + errorFields.join(', '),
        {
          delay: 8000,
          classname: 'bg-warning text-light',
          headertext: 'Warning',
          autohide: true,
        }
      );
    }
  }

  checkedItem(checked: boolean, idx: number) {
    this.selectedItems[idx] = checked;
  }

  deleteSelectedItems() {
    const deleteRegtypeConfirmModalRef = this.modalService.open(
      DeleteConfirmComponent,
      {
        size: 'sm',
        windowClass: 'modal-custom-deleteConfirm',
      }
    );
    deleteRegtypeConfirmModalRef.componentInstance.confirmMsg =
      'Delete these items?';
    deleteRegtypeConfirmModalRef.result
      .then((agree: boolean) => {
        console.log('Do you want to delete?: ', agree);
        if (agree === true) {
          let i = this.selectedItems.length - 1;
          while (i >= 0) {
            if (this.selectedItems[i]) {
              this.exhibitorAllotmentList.splice(i, 1);
              this.selectedItems.splice(i, 1);
            }
            i--;
          }
        }
      })
      .catch((err: Error) => {
        console.error('close error: ', err);
      });
  }

  selectAllItems() {
    let val = this.disableDeleteBtn();
    this.selectedItems = this.selectedItems.map((el) => val);
  }

  disableDeleteBtn() {
    return this.selectedItems.every((el) => !el);
  }
}
