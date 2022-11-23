import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { v4 as uuid } from 'uuid';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-custom-question',
  templateUrl: './custom-question.component.html',
  styleUrls: ['./custom-question.component.scss']
})
export class CustomQuestionComponent implements OnInit {
  @Input() question;
  _questionList;
  _regType;
  @Input() set questionList(value: string) {
    this._questionList = value;
  };
  @Input() set regtype(value: string) {
    this._regType = value;
  };
  customQuestionsForm: FormGroup;
  selectQuestionForm: FormGroup;
  addNewRowResp = false;
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
    idField: 'questionName',
    textField: 'questionName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 6,
    allowSearchFilter: true
  };
  AddNewQuestion = false;
  constructor(private activeModal: NgbActiveModal, private fb: FormBuilder) {
    console.log("this.questionList", this._questionList);
  }


  ngOnInit(): void {
    this.customQuestionsForm = this.fb.group({
      pollingTypeCode: ['', [Validators.required, Validators.maxLength(30)]],
      responseLayout: ['', [Validators.required, Validators.maxLength(30)]],
      demQuestion: [uuid().substring(29), [Validators.required, Validators.maxLength(30)]],
      description: ['', [Validators.required, Validators.maxLength(200)]],
      additionalInfoName: [''],
      additionalInfoValue: [''],
      demDetails: this.fb.array([]),
    });
    this.selectQuestionForm = this.fb.group({
      question: [[]],
      questionArray:[this._questionList]
    });
    if (this.question) {
      this._questionList = this.question.questionArray.length > 0 ? this.question.questionArray : this._questionList;
      this.selectQuestionForm.patchValue(this.question)
    }
  }

  closeModal() {
    this.activeModal.close(this.selectQuestionForm.value);
  }

  save() {
    if (this.customQuestionsForm.invalid) {
      alert("invalid form")
      return;
    }
    const demdetails = this.customQuestionsForm.value.demDetails.map(dem=>{
      dem['demQuestion'] = this.customQuestionsForm.value.description;
      return dem;
    })
    let obj = {
      "id": null,
      "questionName": this.customQuestionsForm.value.demQuestion,
      "category": this._regType,
      "checked": "true",
      "responseLayout": this.customQuestionsForm.value.responseLayout,
      "question": this.customQuestionsForm.value.description,
      "pollingType": this.customQuestionsForm.value.pollingTypeCode,
      "demDetails":  demdetails
    }
    this._questionList.push(obj);
    this.selectQuestionForm.patchValue({questionArray:this._questionList});
    this.AddNewQuestion = !this.AddNewQuestion;
    this.customQuestionsForm.reset();
    this.customQuestionsForm.patchValue({ demQuestion:uuid().substring(29)})
  }
  submit(){
    this.activeModal.close(this.selectQuestionForm.value);
  }

  responseChange(x) {
    this.demDetailsClear();
    if (x == 'Dropdown' || x == 'CheckboxList' || x == 'RadioButtonList') {
      this.addNewRow();
      this.addNewRowResp = true;
    } else if (x == 'Freetext') {
      this.addNewRowResp = false;
    } else {
      this.addNewRow();
      this.addNewRowResp = false;
    }
  }

  addNewRow() {
    this.formArr.push(this.initRows());
  }

  demDetailsClear() {
    this.formArr.controls = [];
    this.formArr.updateValueAndValidity();
  }

  get formArr() {
    return this.customQuestionsForm.get('demDetails') as FormArray;
  }

  deleteRow(index: number) {
    this.formArr.removeAt(index);
  }

  initRows() {
    return this.fb.group({
      demQuestion: [this.customQuestionsForm.value.demQuestion],
      dedDescription: [
        '',
        [
          Validators.required,
          Validators.maxLength(255),
        ],
      ],
      dedValue: ['', [Validators.required, Validators.maxLength(50)]],
    });
  }

  addQuestion(){
    this.AddNewQuestion = !this.AddNewQuestion;
  }

}
