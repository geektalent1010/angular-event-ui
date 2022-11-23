import { Component, Input, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SessionData } from 'aws-sdk/clients/wisdom';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { generateUniqueGLCode } from 'src/app/components/angular-chat-ui-kit/components/utils/common';
import { ToastService } from 'src/app/services/toast/toast.service';
import { SessionRateData } from '../../interfaces/Session';
import { DataService } from '../../services/data.service';
import { CreateSpeakerComponent } from '../create-speaker/create-speaker.component';

@Component({
  selector: 'app-create-session',
  templateUrl: './create-session.component.html',
  styleUrls: ['./create-session.component.scss'],
})
export class CreateSessionComponent implements OnInit {
  @Input('type') type: string;
  @Input('rateList') rateList: SessionRateData[];
  @Input('data') set data(session: any) {
    this.session = session;
    if (this.session) {
      this.patchForm();
    }
  }
  session: any = null;
  @Input('discountList') discountList: any[];
  @Input() regtypesList: string[];
  @Input() optiontypesList: string[];
  @Input('addedRateIndex') addedRateIndex: number;
  @Input('showMemberRate') showMemberRate: boolean;
  @Input('showNonMemberRate') showNonMemberRate: boolean;
  date = new Date();
  sessionForm: FormGroup;
  sessionTypesOptions = ['On-Site', 'Virtual'];
  sessionTopicsOptions = [
    'AGRICULTURE & FARMING',
    'AMUSEMENT, ENTERTAINMENT & GAMING',
    'SPORTING GOODS & RECREATION',
    'CONSUMER GOODS & RETAIL TRADE',
    'TOYS, HOBBIES & GIFTS',
    'EDUCATION, TRAINING, SCIENCE & RESEARCH',
    'ELECTRICAL & ELECTRONICS',
    'AUTOMOTIVE, TRUCKING & TRANSPORTATION',
    'TRAVEL, HOTELS & RESTAURANTS',
    'INDUSTRIAL',
    'MEDICAL & HEALTHCARE PRODUCTS',
    'BUILDING & CONSTRUCTION',
    'EXHIBITION & MEETING INDUSTRY',
    'FOOD & BEVERAGE',
    'MANUFACTURING & PACKAGING',
    'APPAREL, BEAUTY, SHOES & TEXTILES',
    'COMMUNICATIONS & BROADCASTING',
    'COMPUTERS & SOFTWARE APPLICATIONS',
    'AEROSPACE & AVIATION',
    'WASTE MANAGEMENT',
    'WATER, ENERGY & POWER',
    'POLICE, FIRE, SECURITY & EMERGENCY SERVICES',
    'MANAGEMENT, HUMAN RESOURCES & NETWORKING',
    'BUSINESS',
    'GOVERNMENT & MILITARY',
    'PRINTING, GRAPHICS, PHOTOGRAPHY & PUBLISHING',
    'MINING',
    'DENTAL',
    'CIVIC AND SOCIAL ORGANIZATIONS',
  ];
  speakerList: any[] = [];
  isVisible: boolean = true;
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true,
  };

  constructor(
    public activeModal: NgbActiveModal,
    public fb: FormBuilder,
    private toastService: ToastService,
    private modalService: NgbModal,
    private dataService: DataService
  ) {
    this.sessionForm = this.fb.group({
      sesName: ['', [Validators.required, Validators.maxLength(500)]],
      sesGLCode: [generateUniqueGLCode(), [Validators.required]],
      sesType: ['', [Validators.required]],
      sesSessident: ['', [Validators.required]],
      sesRegtypes: [[], [Validators.required]],
      sesOptType: [[], [Validators.required]],
      sesPrivateSession: ['', [Validators.required]],
      sesCapacity: ['', [Validators.required, Validators.min(1)]],
      sesTopics: [''],
      sesSynopsis: [''],
      sesSpeaker: [''],
      sesDiscount: [''],
      rateList: this.fb.array([]),
      hall: [''],
      room: [''],
      seats: [0],
      showQuantity: [false],
    });
  }

  ngOnInit(): void {
    if (this.type === 'create') {
      this.formArr.controls = [];
      this.formArr.updateValueAndValidity();
      this.sessionForm.reset();

      let rateList: SessionRateData[] = [];
      if (this.showMemberRate) {
        rateList?.push({
          category: 'member',
          startDate: null,
          startTime: null,
          endDate: null,
          endTime: null,
          cost: 0,
        });
      }
      if (this.showNonMemberRate) {
        rateList?.push({
          category: 'non-member',
          startDate: null,
          startTime: null,
          endDate: null,
          endTime: null,
          cost: 0,
        });
      }
      for (let i = 0; i < this.addedRateIndex; i++) {
        rateList?.push({
          category: i + 1,
          startDate: null,
          startTime: null,
          endDate: null,
          endTime: null,
          cost: 0,
        });
      }
      console.error('rateList.length: ', rateList.length);

      for (let i = 0; i < rateList.length; i++) {
        this.addNewRow();
      }

      this.lf['rateList'].patchValue(rateList);
    }
  }

  get lf() {
    return this.sessionForm.controls;
  }

  patchForm() {
    this.formArr.controls = [];
    this.formArr.updateValueAndValidity();
    this.sessionForm.reset();

    let rateList: SessionRateData[] = [];
    if (this.session) {
      rateList = this.rateList?.map((row) => ({
        category: row.category,
        startDate: row.startDate,
        startTime: row.startTime,
        endDate: row.endDate,
        endTime: row.endTime,
        cost: row.cost,
      }));
    }

    console.error('rateList.length: ', rateList?.length);

    if (rateList?.length) {
      for (let i = 0; i < rateList.length; i++) {
        this.addNewRow();
      }
    }

    this.sessionForm.patchValue({
      sesName: this.session?.name || '',
      sesGLCode: this.session?.glCode || generateUniqueGLCode(),
      sesType: this.session?.sessionType || '',
      sesSessident: this.session?.sessident || '',
      sesRegtypes: this.session?.regtypes || [],
      sesOptType: this.session?.optionType || [],
      sesPrivateSession: this.session?.privateSession || '',
      sesCapacity: this.session?.sessionAttendeeCapacity || '',
      sesTopics: this.session?.topics || '',
      sesSpeaker: this.session?.speaker || '',
      sesSynopsis: this.session?.synopsis || '',
      sesDiscount: this.session?.discount || '',
      rateList: rateList ? rateList : [],
      hall: this.session?.hall || '',
      room: this.session?.room || '',
      seats: this.session?.seats || 0,
      showQuantity: this.session?.showQuantity || false,
    });
  }

  test(value: any) {
    console.error(value);
  }

  closeModal() {
    this.activeModal.close();
  }

  add() {
    if (this.sessionForm.invalid) {
      this.markFormGroupTouched(this.sessionForm);
      this.toastService.show('Please fill all mandatory fields in Sessions', {
        delay: 6000,
        classname: 'bg-alert text-dark',
        headertext: 'Invalid Form',
        autohide: true,
      });
      return;
    }

    if (!this.validateDiscount()) {
      this.sessionForm.controls.sesDiscount.setValue('');
      return;
    }

    if (this.sessionForm.valid) {
      const session: any = this.sessionForm.getRawValue();
      var newSession: any = {
        name: session.sesName,
        glCode: session.sesGLCode,
        sessionType: session.sesType,
        sessident: session.sesSessident,
        regtypes: session.sesRegtypes,
        optionType: session.sesOptType,
        privateSession: session.sesPrivateSession,
        sessionAttendeeCapacity: session.sesCapacity,
        topics: session.sesTopics,
        speaker: session.sesSpeaker,
        synopsis: session.sesSynopsis,
        discount: session.sesDiscount,
        rateList: session.rateList,
        hall: session.hall,
        room: session.room,
        seats: session.seats,
        showQuantity: session.showQuantity,
      };
      // console.error("newSession: ", newSession);

      this.activeModal.close(newSession);
    } else {
      Object.keys(this.lf).forEach((field: string) => {
        this.lf[field].markAsTouched();
        this.lf[field].updateValueAndValidity();
      });
    }
  }

  isDateOutOfOrder(startDate, endDate) {
    if (this.lf['noSessionDate'].value) {
      return false;
    } else {
      if (startDate.value === (null || '') || endDate.value === (null || '')) {
        return false;
      }
      const sDate = new Date(startDate.value);
      const eDate = new Date(endDate.value);

      if (eDate < sDate) {
        return true;
      }
      return false;
    }
  }

  isTimeOutOfOrder(startDate, endDate, startTime, endTime) {
    if (this.lf['noSessionDate'].value) {
      return false;
    } else {
      if (
        startDate.value == '' ||
        endDate.value == '' ||
        startTime.value == '' ||
        endTime.value == ''
      ) {
        return false;
      }

      if (startDate.value == endDate.value) {
        const sDate = new Date(startDate.value + ' ' + startTime.value);
        const eDate = new Date(endDate.value + ' ' + endTime.value);

        if (eDate < sDate) {
          return true;
        }
      }
      return false;
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  createSpeaker() {
    this.isVisible = false;
    const createSpeakerModalRef = this.modalService.open(
      CreateSpeakerComponent,
      {
        size: 'lg',
        windowClass: 'modal-custom-createSpeaker',
      }
    );
    createSpeakerModalRef.result
      .then((speaker: any) => {
        console.log('Created Speaker: ', speaker);
        this.isVisible = true;
        if (!speaker) {
          return;
        }
      })
      .catch((err: Error) => {
        console.error('close error: ', err);
        this.isVisible = true;
      });
  }

  validateDiscount() {
    const discountObj = this.discountList.find(
      (dis) => dis.discountName == this.sessionForm.controls.sesDiscount.value
    );
    if (discountObj) {
      if (
        this.getTypeOfDiscount(discountObj.discountType) == '$' &&
        discountObj.amount > this.sessionForm.controls.sesCost.value
      ) {
        this.toastService.show(
          'Only discounts that are less than the session cost are applicable to the session',
          {
            delay: 6000,
            classname: 'bg-alert text-dark',
            headertext: 'Invalid Form',
            autohide: true,
          }
        );
        return false;
      } else if (
        this.getTypeOfDiscount(discountObj.discountType) == '%' &&
        discountObj.amount > 100
      ) {
        this.toastService.show('Discounts percentage is more than 100', {
          delay: 6000,
          classname: 'bg-alert text-dark',
          headertext: 'Invalid Form',
          autohide: true,
        });
        return false;
      }
    }
    return true;
  }

  getTypeOfDiscount(typeId) {
    if (['4', '6', '8', '10'].includes(typeId)) {
      return '$';
    } else if (['5', '7', '9', '11'].includes(typeId)) {
      return '%';
    }
  }

  initRows() {
    return new FormGroup({
      category: new FormControl(null),
      startDate: new FormControl(null, [Validators.required]),
      startTime: new FormControl(null, [Validators.required]),
      endDate: new FormControl(null, [Validators.required]),
      endTime: new FormControl(null, [Validators.required]),
      cost: new FormControl(0, [Validators.min(0), Validators.max(9999)]),
    });
  }

  addNewRow() {
    this.formArr.push(this.initRows());
  }

  get formArr() {
    return this.sessionForm.get('rateList') as FormArray;
  }
}
