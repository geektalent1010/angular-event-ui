import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  SimpleChange,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteConfirmComponent } from '../../modals/delete-confirm/delete-confirm.component';
import * as moment from 'moment';
import { SessionServiceService } from 'src/app/services/session-service.service';
import { RegtypeData } from '../../interfaces/Regtype';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { countryCodes } from '../event-info/constants';
import Swal from 'sweetalert2';
import { generateUniqueGLCode } from 'src/app/components/angular-chat-ui-kit/components/utils/common';

@Component({
  selector: 'app-discounts',
  templateUrl: './discounts.component.html',
  styleUrls: ['./discounts.component.scss'],
})
export class DiscountsComponent implements OnInit {
  @Input('data') discountList: any[];
  @Input('regtypesList') regtypesList: any[];
  @Input('pageType') pageType: string;
  @Input('noDiscounts') noDiscounts: boolean;

  discountEditIndex: number = null;
  discountCodes: any[] = [];
  discountGroupList: any[] = [];
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true,
  };

  dropdownSettingsForCountries: IDropdownSettings = {
    singleSelection: false,
    idField: 'itemId',
    textField: 'itemText',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true,
  };
  selectedDiscountType: string = '4';

  countryCodes = [];

  @Output() onNoDiscountsChange = new EventEmitter();

  selectedItems: boolean[] = [];

  constructor(
    private modalService: NgbModal,
    private sessionService: SessionServiceService
  ) {}

  ngOnInit(): void {
    this.discountCodes = this.sessionService.discountCodes?.filter(
      (discount) => discount.discountType !== 'null'
    );
    this.discountGroupList = [
      {
        label: 'Promo',
        value: 'promo',
      },
      {
        label: 'vip',
        value: 'vip',
      },
    ];
    [...Array(99).keys()]?.forEach((item: number) => {
      const discountGroup = {
        label: item + 1,
        value: item + 1,
      };
      this.discountGroupList.push(discountGroup);
    });
    if (Array.isArray(this.regtypesList)) {
      this.regtypesList = this.regtypesList.map(
        (regtype: RegtypeData) => regtype.code + ' - ' + regtype.description
      );
    }

    this.countryCodes = countryCodes.map((el) => {
      return { itemId: el.code, itemText: el.name };
    });

    this.selectedItems = this.discountList.map(
      (el) => el.discountStatus === 'active'
    );
  }

  ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
    console.log('this.discountList: ', this.discountList);

    if (changes.discountList) {
      if (this.noDiscounts) {
        this.discountList = [];
      }
      this.selectedItems = this.discountList.map(
        (el) => el.discountStatus === 'active'
      );
    }
  }
  /** More check */
  getDiscountType(type: string) {
    const discountCodes: any[] = this.discountCodes?.filter(
      (discount) => discount.discountType !== 'null'
    );
    const discount: any = discountCodes.find(
      (discountTypeInfo: any) => discountTypeInfo.discountType === type
    );
    if (discount) return discount.discountDescription;
    return null;
  }

  editDiscount(i: number) {
    const isValid: boolean = this.isValidDiscount(
      this.discountList[this.discountEditIndex]
    );
    if (this.discountEditIndex === null || isValid) this.discountEditIndex = i;
  }

  isValidDiscount(discount: any) {
    let isValid: boolean = true;
    if (!discount) return true;
    if (
      discount.startDate &&
      discount.endDate &&
      moment(discount.startDate).isValid() &&
      moment(discount.endDate).isValid()
    ) {
    } else {
      isValid = false;
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: 'Add the start date and end date',
        confirmButtonColor: '#3085d6',
      });
    }
    if (
      !(
        (discount.allotment > 0 && discount.allotment <= 1000) ||
        discount.allotment === null
      )
    ) {
      isValid = false;
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: 'Allotment should be 1 ~ 1000.',
        confirmButtonColor: '#3085d6',
      });
    }
    return isValid;
  }

  removeDiscount(i: number) {
    const deleteRegtypeConfirmModalRef = this.modalService.open(
      DeleteConfirmComponent,
      {
        size: 'sm',
        windowClass: 'modal-custom-deleteRegtypeConfirm',
      }
    );
    deleteRegtypeConfirmModalRef.componentInstance.confirmMsg =
      'Delete this item?';
    deleteRegtypeConfirmModalRef.result
      .then((agree: boolean) => {
        console.log('Do you want to delete?: ', agree);
        if (agree === true) {
          if (this.discountEditIndex === i) this.discountEditIndex = null;
          this.discountList?.splice(i, 1);
          this.selectedItems?.splice(i, 1);
        }
      })
      .catch((err: Error) => {
        console.error('close error: ', err);
      });
  }

  dateRangeCreated(event: any, i: number) {
    this.discountList[i].startDate = moment(event[0]).format('MM/DD/YYYY');
    this.discountList[i].endDate = moment(event[1]).format('MM/DD/YYYY');
  }

  createNewDiscount() {
    if (this.noDiscounts) return;

    this.discountList.unshift({
      discountName: '',
      discountGroup: '',
      discountStatus: 'active',
      discountDescription: '',
      regTypes: [],
      appliedRegtypes: [],
      appliedCountries: [{ itemId: 'US', itemText: 'United States' }],
      discountType: this.selectedDiscountType,
      amount: null,
      discountcd: '',
      discountauthcode: null,
      promoCode: '',
      createdDate: new Date(),
      startDate: null,
      endDate: null,
      priority: null,
      allotment: null,
      glCode: generateUniqueGLCode(),
    });
    this.discountEditIndex = 0;
    this.selectedItems.unshift(true);
  }

  saveEdition() {
    console.log(this.discountList);
    const isValid: boolean = this.isValidDiscount(
      this.discountList[this.discountEditIndex]
    );
    if (isValid) {
      this.selectedItems[this.discountEditIndex] =
        this.discountList[this.discountEditIndex].discountStatus === 'active'
          ? true
          : false;
      this.discountEditIndex = null;
    }
  }

  countries(discount) {
    if (discount.appliedCountries && discount.appliedCountries.length > 0)
      return discount.appliedCountries.length > 3
        ? discount.appliedCountries[0].itemText +
            ',' +
            discount.appliedCountries[1].itemText +
            '...'
        : discount.appliedCountries.map((el) => el.itemText).join(', ');
    else return '';
  }

  checkNoDiscounts() {
    this.onNoDiscountsChange.emit(this.noDiscounts);
    if (this.noDiscounts) {
      this.discountList.length = 0;
      this.selectedItems.length = 0;
    }
  }

  checkedItem(checked: boolean, idx: number) {
    this.selectedItems[idx] = checked;
    this.discountList[idx].discountStatus = checked ? 'active' : 'inactive';
  }

  checkedBre(checked: boolean, idx: number) {
    this.discountList[idx].useBre = checked;
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
              this.discountList.splice(i, 1);
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
    this.selectedItems = this.selectedItems.map((el, idx) => {
      this.discountList[idx].discountStatus = val ? 'active' : 'inactive';
      return val;
    });
  }

  disableDeleteBtn() {
    return this.selectedItems.every((el) => !el);
  }
}
