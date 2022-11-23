import { Component, Input, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { DemDetailData, QuestionData } from '../../interfaces/Question';
import { v4 as uuid } from 'uuid';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-edit-questions-detail',
  templateUrl: './edit-questions-detail.component.html',
  styleUrls: ['./edit-questions-detail.component.scss'],
})
export class EditQuestionsDetailComponent implements OnInit {
  @Input('question') question: QuestionData;
  @Input('regtypesList') regtypesList: string[];
  @Input('questionsList') questionsList: string[];

  customQuestionsForm: FormGroup;
  dedDescriptionMaxLength = 255;
  addNewRowResp: boolean = false;
  pollingTypeCodes = [
    'Registration',
    'Session',
    'Post-Event',
    'Goal',
    'Interest',
    'Achievement',
    'Qualification',
    'Survey',
    'Marketing',
    'Metric',
    'Open-Ended',
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
  private initialDemDetails = [];

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder) {
    this.customQuestionsForm = this.fb.group({
      pollingTypeCode: [
        'Registration',
        [Validators.required, Validators.maxLength(30)],
      ],
      category: [[], [Validators.required]],
      demQuestion: [
        uuid().substring(29),
        [Validators.required, Validators.maxLength(30)],
      ],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      responseLayout: ['Freetext', [Validators.required]],
      columns: [1],
      demDetails: this.fb.array([]),
      additionalInfoName: [''],
      additionalInfoValue: [''],
      chooseResponse: [false],
    });
  }

  ngOnInit(): void {
    if (this.question) this.patchForm();
    this.lf['responseLayout'].valueChanges.subscribe((value: string) => {
      this.responseChange(value);
    });
    this.lf['description'].valueChanges.subscribe((value: string) => {
      this.isDescFound(value.trim().toLowerCase());
    });
  }

  get lf() {
    return this.customQuestionsForm.controls;
  }

  get formArr() {
    return this.customQuestionsForm.get('demDetails') as FormArray;
  }

  private isDescFound(desc) {
    if (
      this.question?.question.trim().toLowerCase() !== desc &&
      this.questionsList.includes(desc)
    ) {
      this.lf['description'].setErrors({ descFound: true });
    } else {
      if (this.lf['description'].errors?.['descFound'])
        delete this.lf['description'].errors['descFound'];
    }
  }

  patchForm() {
    this.formArr.controls = [];
    this.formArr.updateValueAndValidity();
    this.customQuestionsForm.reset();
    let demDetails: DemDetailData[] = Array.isArray(this.question.demDetails)
      ? this.question.demDetails
      : [];
    demDetails = demDetails?.map((row) => ({
      dedDescription: row.dedDescription,
      dedValue: row.dedValue?.toString().trim(),
      dedDisplaySeq: row.dedDisplaySeq?.toString().trim(),
    }));
    this.initialDemDetails = [
      ...new Map(demDetails.map((v) => [v.dedDescription, v])).values(),
    ];

    for (let i = 0; i < demDetails.length; i++) {
      this.addNewRow();
    }

    const patchValue = {
      demQuestion: this.question.questionName,
      category: this.question.category,
      description: this.question.question,
      pollingTypeCode: this.question.pollingType,
      demDetails: this.initialDemDetails ? this.initialDemDetails : [],
      responseLayout: this.getExactResponseLayoutValue(
        this.question.responseLayout
      ),
      columns: this.question.columns ? this.question.columns : 1,
      additionalInfoName: this.question.additionalInfoName,
      additionalInfoValue: this.question.additionalInfoValue,
      chooseResponse: this.question.chooseResponse,
    };

    if (
      patchValue.responseLayout === 'Dropdown' ||
      patchValue.responseLayout === 'CheckboxList' ||
      patchValue.responseLayout === 'CheckboxListSelectAll' ||
      patchValue.responseLayout === 'RadioButtonList'
    ) {
      this.addNewRowResp = true;
    } else if (patchValue.responseLayout === 'Freetext') {
      this.addNewRowResp = false;
    } else {
      this.addNewRowResp = false;
    }

    this.customQuestionsForm.patchValue(patchValue);
  }
  getExactResponseLayoutValue(responseLayout: string): string {
    if (!responseLayout) return 'Freetext';
    switch (responseLayout.toLowerCase()) {
      case 'freetext':
        return 'Freetext';
      case 'dropdown':
        return 'Dropdown';
      case 'checkbox':
        return 'Checkbox';
      case 'checkboxlist':
        return 'CheckboxList';
      case 'radiobuttonlist':
        return 'RadioButtonList';
      case 'dateinput':
        return 'DateInput';
      case 'checkboxlistselectall':
        return 'CheckboxListSelectAll';
      default:
        return 'Freetext';
    }
  }
  responseChange(x: string) {
    this.formArr.controls = [];
    this.formArr.updateValueAndValidity();
    switch (x) {
      case 'Dropdown':
        this.addDropDownNewRow();
        this.addNewRowResp = true;
        break;
      case 'CheckboxList':
      case 'CheckboxListSelectAll':
      case 'RadioButtonList':
        if (
          Array.isArray(this.initialDemDetails) &&
          this.initialDemDetails.length > 0
        ) {
          for (let i = 0; i < this.initialDemDetails.length; i++) {
            this.addNewRow();
          }
          this.customQuestionsForm.patchValue({
            demDetails: [...this.initialDemDetails],
          });
        } else {
          this.addNewRow();
        }
        this.addNewRowResp = true;
        break;
      case 'Freetext':
      case 'DateInput':
        this.addNewRowResp = false;
        break;
      default:
        this.addNewRow();
        this.addNewRowResp = false;
        break;
    }
  }

  closeModal() {
    this.activeModal.close();
  }

  addNewRow() {
    this.formArr.push(this.initRows());
  }

  addDropDownNewRow() {
    let tempForm = new FormGroup({
      demQuestion: new FormControl('None'),
      dedDescription: new FormControl('None'),
      dedValue: new FormControl('None'),
    });

    tempForm.disable({ onlySelf: true });
    this.formArr.push(tempForm);
    this.formArr.push(this.initRows());
  }

  initRows() {
    return new FormGroup({
      demQuestion: new FormControl(''),
      dedDescription: new FormControl('', [
        Validators.required,
        Validators.maxLength(this.dedDescriptionMaxLength),
      ]),
      dedValue: new FormControl('', [
        Validators.required,
        Validators.maxLength(50),
      ]),
      dedDisplaySeq: new FormControl('', [Validators.maxLength(50)]),
    });
  }

  deleteRow(index: number, value: any) {
    this.formArr.removeAt(index);
  }

  saveQuestion() {
    if (this.customQuestionsForm.invalid) {
      this.markFormGroupTouched(this.customQuestionsForm);
      const alert = 'Please fill required details';
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: alert,
        confirmButtonColor: '#3085d6',
      });
      return;
    }
    if (
      this.checkDuplicate(this.customQuestionsForm.getRawValue().demDetails)
    ) {
      const alert = 'Duplicate Question responses';
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: alert,
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    this.activeModal.close({
      ...this.customQuestionsForm.getRawValue(),
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  checkDuplicate(demDetails: DemDetailData[]) {
    return (
      [...new Map(demDetails.map((v) => [v.dedDescription, v])).values()]
        .length != demDetails?.length
    );
  }
}
