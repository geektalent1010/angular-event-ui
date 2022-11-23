import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MdbTableDirective } from 'angular-bootstrap-md';
import { Papa } from 'ngx-papaparse';
import { ToastService } from 'src/app/services/toast/toast.service';
import { QuestionData } from '../../interfaces/Question';

@Component({
  selector: 'app-import-questions',
  templateUrl: './import-questions.component.html',
  styleUrls: ['./import-questions.component.scss']
})
export class ImportQuestionsComponent implements OnInit {
  @Input() regTypes: any[];
  questionsForm: FormGroup;
  uploadedQuestions: QuestionData[] = [];
  filteredQuestions: QuestionData[] = [];
  @ViewChild(MdbTableDirective, { static: true }) tableEl: MdbTableDirective;
  headQuestionElements = [
    {
      field: "questionName",
      label: "Name"
    },
    // {
    //   field: "category",
    //   label: "Regtype Category"
    // },
    {
      field: "question",
      label: "Question"
    },
    {
      field: "PollingType",
      label: "Polling Type"
    }
  ];
  // invalidQuestionsNameList: any = {};
  invalidQuestionsNameString: string = '';
  
  constructor(
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef,
    private papa: Papa,
    public toastService: ToastService,
  ) {
    this.questionsForm = new FormGroup({
      sampleQuestionsFileDataB64: new FormControl(""),
      regType: new FormControl("", Validators.required)
    });
    this.lf["regType"].valueChanges.subscribe((value: string) => {
      this.filteredQuestions = this.uploadedQuestions?.filter((q: any) => q.category === value);
    });
  }

  ngOnInit(): void {
  }

  get lf() {
    return this.questionsForm.controls;
  }

  closeModal() {
    this.activeModal.close();
  }

  uploadSampleFile(input: HTMLInputElement) {
    let currentFile;
    const files = input.files;
    if (files && files.length) {
      currentFile = files[0];
      this.papa.parse(currentFile, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: 'greedy',
        worker: true,
        chunk: (result) => {
          console.log(result);
          let questionsList = [];
          result.data.forEach(row => {
            let newQuestions = {
              PollingType: row.pollingtypecode,
              category: row.regtype,
              responseLayout: row.responselayout,
              question: row.questionvalue,
              questionName: row.demquestion,
              dedDescription: row.responsevalue,
              dedValue: row.responsedefaultvalue,
              demQuestion: row.demquestion,
              additionalInfoName: row.additionalInfoName,
              additionalInfoValue: row.additionalInfoValue,
            }
            questionsList.push({ ...newQuestions });
          });
          let invalidQuestionsNames: any = {};
          questionsList.forEach((question: QuestionData, index: number) => {
            const sameNameQuestions: QuestionData[] = questionsList.filter((q: QuestionData, i: number) => index !== i && question.questionName === q.questionName);
            if (sameNameQuestions?.length > 0) {
              const valid: boolean = sameNameQuestions.every((q: QuestionData) => q.question === sameNameQuestions[0].question && q.responseLayout === sameNameQuestions[0].responseLayout);
              if (!valid) {
                invalidQuestionsNames[question.questionName] = question.questionName;
              }
            }
          });
          console.error("invalidQuestionsNames: ", invalidQuestionsNames);
          
          if (Object.keys(invalidQuestionsNames)?.length > 0) {
            questionsList = questionsList.filter((q: QuestionData) => !Object.keys(invalidQuestionsNames)?.includes(q.questionName));
            this.invalidQuestionsNameString = Object.keys(invalidQuestionsNames)?.join(", ");
            this.lf["sampleQuestionsFileDataB64"].setErrors({ diffDescriptionLayout: true });
          } else if (questionsList?.length > 0) {
            this.lf["sampleQuestionsFileDataB64"].setErrors(null);
          }
          
          questionsList = Object.values(questionsList.reduce((r, { PollingType, category, question,questionName,responseLayout,...rest }) => {
            const key = `${PollingType}-${questionName}-${question}`;
            r[key] = r[key] || { PollingType, category, question,questionName,responseLayout, demDetails: [] };
            if(rest.dedDescription && responseLayout?.toLowerCase() != 'freetext'){
              r[key]["demDetails"].push(rest)
            }
            return r;
          }, {}));
          this.uploadedQuestions = [];
          this.uploadedQuestions = questionsList?.filter((q: QuestionData) => q.questionName && q.question && q.PollingType);
          console.log("uploadedQuestions: ", this.uploadedQuestions);
        }
      });
    }
    this.cdr.markForCheck();
  }

  save() {
    if (this.questionsForm.valid && this.uploadedQuestions?.length) {
      const questions: QuestionData[] = this.uploadedQuestions?.map((q: QuestionData) => {
        return {
          ...q,
          category: this.lf["regType"].value
        };
      });
      this.activeModal.close(questions);
    } else {
      Object.keys(this.lf).forEach((field: string) => {
        this.lf[field].markAsTouched();
        this.lf[field].updateValueAndValidity();
      });
    }
  }
}
