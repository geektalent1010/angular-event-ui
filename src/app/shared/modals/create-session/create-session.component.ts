import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-create-session',
  templateUrl: './create-session.component.html',
  styleUrls: ['./create-session.component.scss']
})
export class CreateSessionComponent implements OnInit {
  @Input() discountList: any[];
  @Input() speakerList: any[];
  @Input() isEdit: boolean;
  @Input() data: any;
  date = new Date();
  sessionForm = new FormGroup({});
  sessionTypesOptions = [
    'On-Site',
    'Virtual'
  ];
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
    'DENT',
  ];
  constructor(
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef,
    public fb: FormBuilder,
  ) {
    this.sessionForm = this.fb.group({
      sesName: ['', [Validators.required, Validators.maxLength(300)]],
      sesType: ['', [Validators.required]],
      sesPrivateSession: ['', [Validators.required]],
      sesCapacity: [
        '',
        [Validators.required, Validators.max(9999), Validators.min(1)],
      ],
      sesTopics: ['', [Validators.required]],
      sesSynopsis: [''],
      sesSpeaker: [''],
      sesCost: ['', [Validators.required]],
      sesDiscount: [''],
      sesStartDate: ['', [Validators.required]],
      sesStartTime: ['', [Validators.required]],
      sesEndDate: ['', [Validators.required]],
      sesEndTime: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    if (this.isEdit) {
      this.editSession(this.data);
    }
  }


  closeModal() {
    this.activeModal.close();
  }

  addSession() {
    if (
      this.sessionForm.invalid ||
      this.isDateOutOfOrder(
        this.sessionForm.get('sesStartDate'),
        this.sessionForm.get('sesEndDate')
      ) ||
      this.isTimeOutOfOrder(
        this.sessionForm.get('sesStartDate'),
        this.sessionForm.get('sesEndDate'),
        this.sessionForm.get('sesStartTime'),
        this.sessionForm.get('sesEndTime')
      )
    ) {
      this.markFormGroupTouched(this.sessionForm);
      alert('Please fill all mandatory fields in Sessions');
      return;
    }
    if (+this.sessionForm.controls.sesCost.value > 9999) {
      alert('Please valid values in Sessions');
      return;
    }

    if (this.sessionForm.valid) {
      var newSession = {
        name: this.sessionForm.controls.sesName.value,
        sessionType: this.sessionForm.controls.sesType.value,
        privateSession: this.sessionForm.controls.sesPrivateSession.value,
        sessionAttendeeCapacity: this.sessionForm.controls.sesCapacity.value,
        topics: this.sessionForm.controls.sesTopics.value,
        speaker: this.sessionForm.controls.sesSpeaker.value,
        synopsis: this.sessionForm.controls.sesSynopsis.value,
        cost: this.sessionForm.controls.sesCost.value,
        discount: this.sessionForm.controls.sesDiscount.value,
        startDate: this.sessionForm.controls.sesStartDate.value,
        startTime: this.sessionForm.controls.sesStartTime.value,
        endDate: this.sessionForm.controls.sesEndDate.value,
        endTime: this.sessionForm.controls.sesEndTime.value
      };
      this.activeModal.close(newSession);
    } else {
      Object.keys(this.lf).forEach((field: string) => {
        this.lf[field].markAsTouched();
        this.lf[field].updateValueAndValidity();
      });
    }
  }

  get lf() {
    return this.sessionForm.controls;
  }

  isDateOutOfOrder(startDate, endDate) {
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

  isTimeOutOfOrder(startDate, endDate, startTime, endTime) {
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

  private markFormGroupTouched(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private editSession(data) {
    this.sessionForm.controls.sesName.setValue(data.name);
    this.sessionForm.controls.sesType.setValue(
      this.sessionTypesOptions.includes(data.sessionType)
        ? data.sessionType
        : ''
    );
    this.sessionForm.controls.sesPrivateSession.setValue(
      data.privateSession
    );
    this.sessionForm.controls.sesCapacity.setValue(
      data.sessionAttendeeCapacity
    );
    this.sessionForm.controls.sesTopics.setValue(
      this.sessionTopicsOptions.includes(
        data.topics.toString()
      )
        ? data.topics
        : ''
    );
    this.sessionForm.controls.sesSpeaker.setValue(
      data.speaker
    );
    this.sessionForm.controls.sesSynopsis.setValue(
      data.synopsis
    );
    this.sessionForm.controls.sesCost.setValue(data.cost);
    this.sessionForm.controls.sesDiscount.setValue(
      data.discount
    );
    this.sessionForm.controls.sesStartDate.setValue(
      data.startDate
    );
    this.sessionForm.controls.sesStartTime.setValue(
      data.startTime
    );
    this.sessionForm.controls.sesEndDate.setValue(
      data.endDate
    );
    this.sessionForm.controls.sesEndTime.setValue(
      data.endTime
    );
  }
}
