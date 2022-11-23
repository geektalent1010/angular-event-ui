import { Component, Input, OnInit, SimpleChange } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteConfirmComponent } from '../../modals/delete-confirm/delete-confirm.component';
import * as moment from 'moment';
import { EventCostData } from '../../interfaces/EventCost';
import Swal from 'sweetalert2';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { RegtypeData } from '../../interfaces/Regtype';
import * as _ from 'lodash';

@Component({
  selector: 'app-packages',
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.scss'],
})
export class PackagesComponent implements OnInit {
  @Input('data') eventCosts: EventCostData[];
  @Input('regtypesList') regtypesList: any[];
  @Input('pageType') pageType: string;
  regcodeEditIndex: number = null;
  duplicatedIndex: number[] = [];
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true,
  };
  onlyOneRegtype: boolean = false;
  // pkgNameDuplicate: boolean = false;
  membersCategory: any[] = ['Member', 'Non member', 'None'];
  addedRateIndex: number = 0;

  constructor(private modalService: NgbModal) {}

  ngOnInit(): void {
    console.log('eventCosts: ', this.eventCosts);
    this.eventCosts = this.eventCosts.map((eventCost: EventCostData) => {
      return {
        ...eventCost,
        refCodes: eventCost.refCodes,
      };
    });
    this.regtypesList = this.regtypesList.map(
      (regtype: RegtypeData) => regtype.code + ' - ' + regtype.description
    );
    // }
    /** Determine the reg package rate index */
    if (this.eventCosts?.[0]?.rates?.duringEventBirdStartDate3)
      this.addedRateIndex = 3;
    else if (this.eventCosts?.[0]?.rates?.duringEventBirdStartDate2)
      this.addedRateIndex = 2;
    else if (this.eventCosts?.[0]?.rates?.duringEventBirdStartDate)
      this.addedRateIndex = 1;
    else this.addedRateIndex = 0;
  }

  ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
    if (changes.eventCosts) {
    }
  }

  createRegcode() {
    if (
      this.regcodeEditIndex === null ||
      this.validateEditingPackage(
        this.eventCosts[this.regcodeEditIndex],
        this.regcodeEditIndex
      )
    ) {
      this.regcodeEditIndex = 0;
      this.eventCosts.unshift({
        isChecked: false,
        refCodes: [],
        rates: {
          duringEventBirdStartDate: null,
          duringEventBirdEndDate: null,
          duringEventBirdRate: 0,
          duringEventBirdStartDate2: null,
          duringEventBirdEndDate2: null,
          duringEventBirdRate2: 0,
          duringEventBirdStartDate3: null,
          duringEventBirdEndDate3: null,
          duringEventBirdRate3: 0,
        },
        customPackage: {
          name: '',
          description: '',
          cost: 0,
        },
        nonMember: 'None',
      });
    }
  }

  editRegcode(i: number) {
    if (
      this.regcodeEditIndex === null ||
      this.validateEditingPackage(
        this.eventCosts[this.regcodeEditIndex],
        this.regcodeEditIndex
      )
    ) {
      this.regcodeEditIndex = i;
    }
  }

  removeRegcode(i: number) {
    const deleteRegtypeConfirmModalRef = this.modalService.open(
      DeleteConfirmComponent,
      {
        size: 'sm',
        windowClass: 'modal-custom-deleteConfirm',
      }
    );
    deleteRegtypeConfirmModalRef.componentInstance.confirmMsg =
      'Delete this package?';
    deleteRegtypeConfirmModalRef.result
      .then((agree: boolean) => {
        console.log('Do you want to delete?: ', agree);
        if (agree === true) {
          if (this.regcodeEditIndex === i) this.regcodeEditIndex = null;
          this.eventCosts?.splice(i, 1);
        }
      })
      .catch((err: Error) => {
        console.error('close error: ', err);
      });
  }

  dateRangeCreated(event: any, type: string, i: number) {
    const startDate: string = moment(event[0]).format('YYYY-MM-DD');
    const endDate: string = moment(event[1]).format('YYYY-MM-DD');
    switch (type) {
      case '1':
        this.eventCosts[i].rates.duringEventBirdStartDate = startDate;
        this.eventCosts[i].rates.duringEventBirdEndDate = endDate;
        break;
      case '2':
        this.eventCosts[i].rates.duringEventBirdStartDate2 = startDate;
        this.eventCosts[i].rates.duringEventBirdEndDate2 = endDate;
        break;
      case '3':
        this.eventCosts[i].rates.duringEventBirdStartDate3 = startDate;
        this.eventCosts[i].rates.duringEventBirdEndDate3 = endDate;
        break;
      default:
        break;
    }
  }

  getDateFormat(date: string) {
    if (date) return new Date(date);
    return null;
  }

  checkedZerocost(checked: boolean) {
    this.eventCosts[this.regcodeEditIndex].zeroCost = checked;
    if (checked) {
      this.eventCosts[this.regcodeEditIndex].rates.duringEventBirdRate = 0;
      this.eventCosts[this.regcodeEditIndex].rates.duringEventBirdRate2 = 0;
      this.eventCosts[this.regcodeEditIndex].rates.duringEventBirdRate3 = 0;
      this.eventCosts[this.regcodeEditIndex].customPackage.cost = 0;
    }
  }

  save(savingEventCost: EventCostData) {
    if (this.validateEditingPackage(savingEventCost, this.regcodeEditIndex)) {
      this.regcodeEditIndex = null;
      this.duplicatedIndex = [];
    }
  }

  validateEditingPackage(editingEventCost: EventCostData, index: number) {
    if (!editingEventCost) return true;
    if (editingEventCost.refCodes.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: `Please select 1 regtype${
          this.onlyOneRegtype ? ' at least' : ''
        }.`,
        confirmButtonColor: '#3085d6',
      });
      return false;
    }

    if (this.onlyOneRegtype) {
      if (editingEventCost.refCodes.length > 1) {
        Swal.fire({
          icon: 'warning',
          title: 'Check Again',
          text: `Please select 1 regtype per package.`,
          confirmButtonColor: '#3085d6',
        });
        return false;
      }
      /*const isInvalid: boolean = this.eventCosts.some(
        (eventCost: EventCostData, i: number) => {
          if (
            this.regcodeEditIndex !== i &&
            !_.isEmpty(eventCost.customPackage?.name) &&
            eventCost.customPackage?.name?.trim().toLowerCase() ===
              editingEventCost?.customPackage?.name?.trim().toLowerCase()
          ) {
            const res: boolean = [...editingEventCost.refCodes].some(
              (regCode: string) =>
                [...eventCost.refCodes]
                  ?.map((refCode: string) => refCode.trim().toLowerCase())
                  .includes(regCode.trim().toLowerCase())
            );
            if (res) {
              this.duplicatedIndex.push(i);
            }
            return res;
          } else {
            return false;
          }
        }
      );
      if (isInvalid) {
        Swal.fire({
          icon: 'warning',
          title: 'Check Again',
          text: 'The package name is already existing for the same regtype',
          confirmButtonColor: '#3085d6',
        });
        return false;
      }*/
    }

    /** Validate if the package name is unique */
    this.duplicatedIndex = [];
    const packageName: string = editingEventCost?.customPackage?.name;
    const invalid: boolean = this.eventCosts.some(
      (eventCost: EventCostData, i: number) => {
        const res: boolean =
          i !== index &&
          !_.isEmpty(eventCost?.customPackage?.name) &&
          eventCost?.customPackage?.name.trim().toLowerCase() ===
            packageName.trim().toLowerCase();
        if (res) {
          this.duplicatedIndex.push(i);
        }
        return res;
      }
    );
    if (invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: 'The package name is already existing.',
        confirmButtonColor: '#3085d6',
        showDenyButton: true,
        confirmButtonText: 'Save',
        denyButtonText: "Don't save",
      }).then((result) => {
        if (result.isConfirmed) {
          this.regcodeEditIndex = null;
          this.duplicatedIndex = [];
        }
      });
      return false;
    }

    /** Validate if the other fields is unique */
    const otherIdList: any[] = [];
    const editingIdList: any[] = [];
    this.eventCosts.forEach((eventCost: EventCostData, i: number) => {
      if (i !== index) {
        eventCost.refCodes?.forEach((refCode: string) => {
          otherIdList.push({
            index: i,
            refCode: refCode,
            zeroCost: eventCost.zeroCost,
            nonMember: eventCost.nonMember,
            duringEventBirdStartDate: eventCost.rates.duringEventBirdStartDate,
            duringEventBirdEndDate: eventCost.rates.duringEventBirdEndDate,
            duringEventBirdRate: Number(eventCost.rates.duringEventBirdRate),
            duringEventBirdStartDate2: eventCost.rates.duringEventBirdStartDate,
            duringEventBirdEndDate2: eventCost.rates.duringEventBirdEndDate,
            duringEventBirdRate2: Number(eventCost.rates.duringEventBirdRate),
            duringEventBirdStartDate3: eventCost.rates.duringEventBirdStartDate,
            duringEventBirdEndDate3: eventCost.rates.duringEventBirdEndDate,
            duringEventBirdRate3: Number(eventCost.rates.duringEventBirdRate),
            cost: Number(eventCost.customPackage.cost),
          });
        });
      }
    });

    editingEventCost.refCodes?.forEach((refCode: string) => {
      editingIdList.push({
        refCode: refCode,
        zeroCost: editingEventCost.zeroCost,
        nonMember: editingEventCost.nonMember,
        duringEventBirdStartDate:
          editingEventCost.rates.duringEventBirdStartDate,
        duringEventBirdEndDate: editingEventCost.rates.duringEventBirdEndDate,
        duringEventBirdRate: Number(editingEventCost.rates.duringEventBirdRate),
        duringEventBirdStartDate2:
          editingEventCost.rates.duringEventBirdStartDate,
        duringEventBirdEndDate2: editingEventCost.rates.duringEventBirdEndDate,
        duringEventBirdRate2: Number(
          editingEventCost.rates.duringEventBirdRate
        ),
        duringEventBirdStartDate3:
          editingEventCost.rates.duringEventBirdStartDate,
        duringEventBirdEndDate3: editingEventCost.rates.duringEventBirdEndDate,
        duringEventBirdRate3: Number(
          editingEventCost.rates.duringEventBirdRate
        ),
        cost: Number(editingEventCost.customPackage.cost),
      });
    });
    let otherInvalid: boolean = false;
    editingIdList.forEach((editingId: any) => {
      return otherIdList.forEach((otherId: any) => {
        if (_.isEqual(_.omit(otherId, ['index']), editingId)) {
          this.duplicatedIndex.push(otherId.index);
          otherInvalid = true;
        }
      });
    });

    if (otherInvalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: 'The package is duplicated',
        confirmButtonColor: '#3085d6',
      });
      return false;
    }

    /** Validate if the package dates is existing */
    if (
      this.addedRateIndex > 0 &&
      (!editingEventCost.rates.duringEventBirdStartDate ||
        !editingEventCost.rates.duringEventBirdEndDate)
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: 'Rate 1 Period are required to save package',
        confirmButtonColor: '#3085d6',
      });
      return false;
    }
    if (
      this.addedRateIndex > 1 &&
      (!editingEventCost.rates.duringEventBirdStartDate2 ||
        !editingEventCost.rates.duringEventBirdEndDate2)
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: 'Rate 2 Period are required to save package',
        confirmButtonColor: '#3085d6',
      });
      return false;
    }
    if (
      this.addedRateIndex > 2 &&
      (!editingEventCost.rates.duringEventBirdStartDate3 ||
        !editingEventCost.rates.duringEventBirdEndDate3)
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: 'Rate 3 Period are required to save package',
        confirmButtonColor: '#3085d6',
      });
      return false;
    }
    return true;
  }

  getValidatePackagesBeforeNext() {
    if (this.regcodeEditIndex !== null) return false;
    let valid: boolean = true;
    let invalidCostIndexs: number[] = [];
    this.eventCosts?.forEach((eventCost: EventCostData, i: number) => {
      if (eventCost.refCodes.length === 0) {
        invalidCostIndexs.push(i);
        valid = false;
      }
    });
    if (!valid) {
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: 'Please select 1 regtype at least',
        confirmButtonColor: '#3085d6',
      });
      return valid;
    }

    // if (!this.ChangePkgNameDuplicate()) {
    //   return false;
    // }

    /** Validate if the other fields is unique */
    const idList: string[] = [];
    this.eventCosts.forEach((eventCost: EventCostData, i: number) => {
      eventCost.refCodes?.forEach((refCode: string) => {
        idList.push(
          JSON.stringify({
            refCode: refCode,
            zeroCost: eventCost.zeroCost,
            nonMember: eventCost.nonMember,
            duringEventBirdStartDate: eventCost.rates.duringEventBirdStartDate,
            duringEventBirdEndDate: eventCost.rates.duringEventBirdEndDate,
            duringEventBirdRate: eventCost.rates.duringEventBirdRate,
            duringEventBirdStartDate2: eventCost.rates.duringEventBirdStartDate,
            duringEventBirdEndDate2: eventCost.rates.duringEventBirdEndDate,
            duringEventBirdRate2: eventCost.rates.duringEventBirdRate,
            duringEventBirdStartDate3: eventCost.rates.duringEventBirdStartDate,
            duringEventBirdEndDate3: eventCost.rates.duringEventBirdEndDate,
            duringEventBirdRate3: eventCost.rates.duringEventBirdRate,
            cost: eventCost.customPackage.cost,
          })
        );
      });
    });
    if (idList.length !== new Set(idList).size) {
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: 'Some package is duplicated.',
        confirmButtonColor: '#3085d6',
      });
      return false;
    }

    if (this.onlyOneRegtype) {
      valid = !this.eventCosts?.some(
        (eventCost: EventCostData) => eventCost.refCodes.length > 1
      );
      if (!valid) {
        Swal.fire({
          icon: 'warning',
          title: 'Check Again',
          text: 'Please allow only 1 regtype per package.',
          confirmButtonColor: '#3085d6',
        });
        return valid;
      }

      /*let packageMap: Map<any, number> = new Map<any, number>();
      this.eventCosts.forEach((eventCost: EventCostData) => {
        [...eventCost.refCodes].forEach((refCode: string) => {
          let existingValue: number = packageMap.get(refCode);
          if (existingValue) {
            packageMap.set(refCode, existingValue + 1);
          } else {
            packageMap.set(refCode, 1);
          }
        });
      });
      valid = Array.from(packageMap.values()).every((count) => count === 1);
      if (!valid) {
        Swal.fire({
          icon: 'warning',
          title: 'Check Again',
          text: 'The package name is already existing for the same regtype',
          confirmButtonColor: '#3085d6',
        });
      }
      return valid;*/
    }

    return valid;
  }

  ChangeAllowOneRegtype() {
    if (this.onlyOneRegtype) {
      this.eventCosts?.forEach((eventCost: EventCostData) => {
        if (eventCost.refCodes.length > 1) eventCost.refCodes.splice(1);
      });
    }
  }
  /*ChangePkgNameDuplicate() {
    if (!this.pkgNameDuplicate) {
      // Validate if package name is unique
      let count = {};
      this.eventCosts.forEach((eventCost: EventCostData) => {
        const name = eventCost.customPackage.name.trim().toLocaleLowerCase();
        if (name !== '') {
          if (count[name]) {
            count[name] += 1;
          } else {
            count[name] = 1;
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
        Swal.fire({
          icon: 'warning',
          title: 'Check Again',
          text:
            'Some package ' +
            (duplicated.length === 1 ? 'name is ' : 'names are ') +
            ' duplicated. ' +
            duplicated.join(', '),
          confirmButtonColor: '#3085d6',
        });
        return false;
      }
    }
    return true;
  }*/

  checkedItem(checked: boolean, idx: number) {
    this.eventCosts[idx].isChecked = checked;
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
      'Delete these packages?';
    deleteRegtypeConfirmModalRef.result
      .then((agree: boolean) => {
        console.log('Do you want to delete?: ', agree);
        if (agree === true) {
          this.eventCosts = this.eventCosts.filter(
            (eventCost: EventCostData) => eventCost.isChecked === false
          );
        }
      })
      .catch((err: Error) => {
        console.error('close error: ', err);
      });
  }

  selectAllItems() {
    let val = this.disableDeleteBtn();
    this.eventCosts.forEach((eventCost: EventCostData) => {
      eventCost.isChecked = val;
    });
  }

  disableDeleteBtn() {
    return this.eventCosts.every(
      (eventCost: EventCostData) => !eventCost.isChecked
    );
  }

  addRate() {
    if (this.addedRateIndex < 3) {
      this.addedRateIndex++;
    }
  }

  deleteRate() {
    if (this.addedRateIndex > 0) {
      for (let i = 0; i < this.eventCosts.length; i++) {
        if (this.addedRateIndex === 1) {
          this.eventCosts[i].rates.duringEventBirdStartDate = null;
          this.eventCosts[i].rates.duringEventBirdEndDate = null;
          this.eventCosts[i].rates.duringEventBirdRate = 0;
        } else if (this.addedRateIndex === 2) {
          this.eventCosts[i].rates.duringEventBirdStartDate2 = null;
          this.eventCosts[i].rates.duringEventBirdEndDate2 = null;
          this.eventCosts[i].rates.duringEventBirdRate2 = 0;
        } else if (this.addedRateIndex === 3) {
          this.eventCosts[i].rates.duringEventBirdStartDate3 = null;
          this.eventCosts[i].rates.duringEventBirdEndDate3 = null;
          this.eventCosts[i].rates.duringEventBirdRate3 = 0;
        }
      }
      this.addedRateIndex--;
    }
  }
}
