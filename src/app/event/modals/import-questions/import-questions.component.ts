import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { Papa } from 'ngx-papaparse';
import Swal from 'sweetalert2';
import { QuestionData } from '../../interfaces/Question';

@Component({
  selector: 'app-import-questions',
  templateUrl: './import-questions.component.html',
  styleUrls: ['./import-questions.component.scss']
})
export class ImportQuestionsComponent implements OnInit {
  @Input() regtypesList: any[];
  questionsForm: FormGroup;
  invalidQuestionsNameString: string;
  uploadedQuestions: QuestionData[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private papa: Papa,
    private cdr: ChangeDetectorRef
  ) {
    this.questionsForm = new FormGroup({
      sampleQuestionsFileDataB64: new FormControl(""),
      regType: new FormControl("", Validators.required)
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
            let newQuestions: any = {
              pollingType: row.pollingtypecode,
              category: [row.regtype],
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
          
          questionsList = Object.values(questionsList.reduce((r, { pollingType, category, question,questionName,responseLayout,...rest }) => {
            const key = `${pollingType}-${questionName}-${question}`;
            r[key] = r[key] || { pollingType, category, question,questionName,responseLayout, demDetails: [] };
            if(rest.dedDescription && responseLayout?.toLowerCase() != 'freetext'){
              r[key]["demDetails"].push(rest)
            }
            return r;
          }, {}));
          this.uploadedQuestions = [];
          this.uploadedQuestions = questionsList?.filter((q: QuestionData) => q.questionName && q.question && q.pollingType);
          console.log("uploadedQuestions: ", this.uploadedQuestions);
          if (this.uploadedQuestions.length <= 0) {
            Swal.fire({
              icon: 'error',
              title: 'Invalid File detected',
              text: "Empty or wrong File",
              footer: 'Please check your file and try again',
              confirmButtonColor: '#3085d6',
            });
          }
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
          category: [this.lf["regType"].value]
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
