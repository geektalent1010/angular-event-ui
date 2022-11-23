import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { SessionServiceService } from 'src/app/services/session-service.service';
import * as moment from 'moment';
import { isArray } from 'rxjs/internal-compatibility';
import Swal from 'sweetalert2';
import { RegtypeData } from '../../interfaces/Regtype';

@Component({
  selector: 'app-add-discount',
  templateUrl: './add-discount.component.html',
  styleUrls: ['./add-discount.component.scss']
})
export class AddDiscountComponent implements OnInit {
  @Input() public discountType;
  @Input() public discount;
  @Input() public discountList;
  @Input() public regtypesList;
  @Input() public isEdit;
  @Input() public index;

  discountCodes: any[] = [];
  discountGroupList: any[] = [];
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 6,
    allowSearchFilter: true
  };
  regtypeList: string[] = [];

  newDiscountForm: FormGroup;
  
  constructor(
    private sessionService: SessionServiceService,
    public activeModal: NgbActiveModal
  ) { }

  ngOnInit(): void {    
    this.discountCodes = this.sessionService.discountCodes?.filter(discount => discount.discountType !== 'null');
    this.discountGroupList = [
      {
        label: "Promo",
        value: "promo"
      },
      {
        label: "vip",
        value: "vip"
      }
    ];
    [...Array(99).keys()]?.forEach((item: number) => {
      const discountGroup = {
        label: item + 1,
        value: item + 1
      };
      this.discountGroupList.push(discountGroup);
    });
    if (isArray(this.regtypesList)) {
      this.regtypeList = this.regtypesList.map((regtype: RegtypeData) => regtype.code + " - " + regtype.description);
    }
    this.makeForm();
  }

  getRegType(appliedRegtypes, discountDescription ){
    if(appliedRegtypes && appliedRegtypes[0]){
     let regType;
     if (discountDescription.toLowerCase() == 'promo code percentage' || discountDescription.toLowerCase() == 'promo code monetary amount'){
      regType = appliedRegtypes.map(reg=>{
        return this.regtypeList.find(regType=> regType && regType.toLowerCase().includes(reg.toLowerCase()));
      })
     } else {
       regType = this.regtypeList.find(regType=> regType && regType.toLowerCase().includes(appliedRegtypes[0].toLowerCase()));
     }

     return regType?regType:'';
    }
    return "";
  }

  makeForm() {
    this.newDiscountForm = new FormGroup({
      discountType: new FormControl(this.discountType, Validators.required),
      discountName: new FormControl(this.discount?.discountName || "", Validators.required),
      amount: this.isPercent ?
        new FormControl(this.discount?.amount || "", [Validators.required, Validators.min(0), Validators.max(100)]) :
        new FormControl(this.discount?.amount || "", [Validators.required, Validators.min(0), Validators.max(9999)]),
      priority: new FormControl(this.discount?.priority || 1, Validators.required),
      discountGroup: new FormControl(this.discount?.discountGroup || "", Validators.required),
      discountDescription: new FormControl(this.discount?.discountDescription || "", Validators.required),
      appliedRegtypes: new FormControl(this.getRegType(this.discount?.appliedRegtypes,this.discount?.discountDescription), Validators.required),
      discountStatus: new FormControl(this.discount?.discountStatus || "", Validators.required),
    });

    if (this.discountType === "10" || this.discountType === "11") {
      this.newDiscountForm.addControl("discountauthcode", new FormControl(this.discount?.discountauthcode || "", [Validators.required, Validators.pattern(/^\d{5}$/)]));
    }
  }

  get isPercent() {
    if (
      this.discountType === "4" ||
      this.discountType === "6" ||
      this.discountType === "8" ||
      this.discountType === "10"
    ) {
      return false;
    } else {
      return true;
    }
  }

  get lf() {
    return this.newDiscountForm.controls;
  }

  closeModal() {
    this.activeModal.close();
  }

  save() {
    Object.keys(this.lf)?.forEach(key => {
      this.newDiscountForm.controls[key].markAsTouched();
    });
    if (this.newDiscountForm.valid) {
      let newDiscount = this.newDiscountForm.value;
      
      let alert: string;
      if (
        this.discountList.find(
          (discount, i) => (this.index != i || (this.index == i && !this.isEdit)) 
          && discount.discountType == newDiscount.discountType 
          && newDiscount.appliedRegtypes == discount.appliedRegtypes[0]
        ) && this.discountType !== "10" && this.discountType !== "11"
      ) {
        alert = "Regtype already existing for this discount type";
      } else if (this.discountList?.length > 0 && newDiscount.discountStatus === "active" && this.isDuplicatedName()) {
        alert = "Duplicate names are not allowed.";
      } else if (this.discountList?.length > 0 && newDiscount.discountStatus === "active" && this.isDuplicatePromo()) {
        alert = "Duplicate promocodes are not allowed.";
      } else if (this.discountList?.length > 0 && newDiscount.discountStatus === "active" && this.isDuplicatePriority()) {
        alert = "Duplicate priority for same reg types are not allowed.";
      } else {
        newDiscount['createdDate'] = new Date();
        newDiscount['discountcd'] = "";
        if (!Array.isArray(newDiscount.appliedRegtypes)) newDiscount.appliedRegtypes = [newDiscount.appliedRegtypes];
        this.activeModal.close(newDiscount);
      }
      if(alert){
        Swal.fire({
          icon: 'warning',
          title: 'Check Again',
          text: alert,
          confirmButtonColor: '#3085d6',
        });
      }
    }
  }

  isDuplicatedName() {
    let discountListExcept: any[] = this.discountList;
    if (this.isEdit) {
      discountListExcept = discountListExcept?.filter((discount: any) => discount?.discountName !== this.discount?.discountName);
    }
    return discountListExcept
      ?.filter(discount => discount?.discountStatus === "active")
      ?.some((discount: any) => discount?.discountName === this.newDiscountForm.value.discountName);
  }

  isDuplicatePromo() {
    let discountListExcept: any[] = this.discountList;
    if (this.isEdit) {
      discountListExcept = discountListExcept?.filter((discount: any) => discount?.discountName !== this.discount?.discountName);
    }
    return discountListExcept
      ?.filter(discount => discount?.discountStatus === "active" && (discount?.discountType === "10" || discount?.discountType === "11"))
      ?.some((discount: any) => discount?.discountauthcode === this.newDiscountForm.value.discountauthcode);
  }
  isDuplicatePriority() {
    let discountListExcept: any[] = this.discountList;
    if (this.isEdit) {
      discountListExcept = discountListExcept?.filter((discount: any) => discount?.discountName !== this.discount?.discountName);
    }
    return discountListExcept
      ?.filter(discount => discount?.discountStatus === "active")
      ?.some((discount: any) => discount?.priority === this.newDiscountForm.value.priority && discount?.appliedRegtypes.includes(this.newDiscountForm.value.appliedRegtypes));
  }

  changeDiscountType(e: any) {
    this.discountType = e.target.value;
    if (this.isPercent) {
      this.newDiscountForm.controls["amount"].setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
    } else {
      this.newDiscountForm.controls["amount"].setValidators([Validators.required, Validators.min(0), Validators.max(9999)]);
    }
    if (this.discountType === "10" || this.discountType === "11") {
      this.newDiscountForm.addControl("discountauthcode", new FormControl(this.discount?.discountauthcode || "", [Validators.required, Validators.minLength(5), Validators.maxLength(5)]));
    } else {
      this.newDiscountForm.removeControl("discountauthcode");
    }
    this.newDiscountForm.updateValueAndValidity();
  }

  datesUpdated(e: any) {

  }

  get test() {
    console.error(this.lf.discountauthcode.errors);
    return JSON.stringify(this.lf.discountauthcode.errors);
  }
}
