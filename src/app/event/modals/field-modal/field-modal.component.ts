import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { FieldData } from '../../interfaces/customPage';

@Component({
  selector: 'app-field-modal',
  templateUrl: './field-modal.component.html',
  styleUrls: ['./field-modal.component.scss'],
})
export class FieldModalComponent implements OnInit {
  @Input('isCreate') isCreate: boolean = true;
  @Input('field') field: FieldData;
  @Input('requiredIsArray') requiredIsArray: boolean = false;
  @Input('regtypesList') regtypesList: any[];
  @Input('showColumn') showColumn: boolean = false;
  @Input('showLookup') showLookup: boolean = false;
  fieldForm: FormGroup = new FormGroup({});
  typeList: string[] = [
    'input_free',
    'input_phone',
    'input_email',
    'input_password',
    'checkbox',
    'select',
    'business rule',
    'add demo question',
    'partial-reg-lookup',
    'img_upload',
  ];

  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true,
  };

  constructor(public activeModal: NgbActiveModal) {
    this.fieldForm = new FormGroup({
      label: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      // type: new FormControl(this.typeList[0], Validators.required),
      type: new FormControl(this.typeList[0]),
      value: new FormControl(''),
      column: new FormControl(1),
      static: new FormControl(false, Validators.required),
      disable: new FormControl(false, Validators.required),
      required: new FormControl(this.requiredIsArray ? [] : false),
      visible: new FormControl(true, Validators.required),
      lookup: new FormControl(false),
    });
    this.lf['static'].valueChanges.subscribe((value: boolean) => {
      console.error('test: ', value);
      if (value === true) {
        this.lf['value'].setValidators(Validators.required);
        this.lf['value'].updateValueAndValidity();
      } else {
        this.lf['value'].clearValidators();
        this.lf['value'].updateValueAndValidity();
      }
    });
  }

  ngOnInit(): void {
    if (this.field) {
      this.fieldForm.patchValue(this.field);
    }
  }

  get lf() {
    return this.fieldForm.controls;
  }

  saveField() {
    if (this.fieldForm.valid) {
      this.activeModal.close({
        ...this.fieldForm.value,
        isActive: this.field?.isActive ?? true,
      });
    } else {
      Object.keys(this.lf).forEach((key: string) => {
        this.lf[key].markAsTouched();
        this.lf[key].updateValueAndValidity();
      });
    }
  }
  handleChange(type: string) {
    // if (type === 'business rule' || type === 'add demo question') {
    //   this.fieldForm.patchValue({ name: 'VISALETTER' });
    // } else {
    this.fieldForm.patchValue({ name: '' });
    // }
  }
}
