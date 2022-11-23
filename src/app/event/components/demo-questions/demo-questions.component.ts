import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from 'src/app/services/toast/toast.service';
import { QuestionData } from '../../interfaces/Question';
import { DeleteConfirmComponent } from '../../modals/delete-confirm/delete-confirm.component';
import { ImportQuestionsComponent } from '../../modals/import-questions/import-questions.component';
import Swal from 'sweetalert2';
import { EditQuestionsDetailComponent } from '../../modals/edit-questions-detail/edit-questions-detail.component';
import { RegtypeData } from '../../interfaces/Regtype';

@Component({
  selector: 'app-demo-questions',
  templateUrl: './demo-questions.component.html',
  styleUrls: ['./demo-questions.component.scss'],
})
export class DemoQuestionsComponent implements OnInit {
  @Input('data') questionsList: QuestionData[];
  @Output() dataChange = new EventEmitter<QuestionData[]>();
  @Input('regtypesList') regtypesList: any[];
  @Input('pageType') pageType: string;
  headQuestionElements = [
    {
      field: 'checked',
      label: 'Id',
    },
    {
      field: 'questionName',
      label: 'Question Name',
    },
    {
      field: 'question',
      label: 'Question',
    },
    {
      field: 'PollingType',
      label: 'Polling Type',
    },
  ];
  questionElements: any[];
  regtypeControl: FormControl = new FormControl('');
  editIndex: number = null;
  editingQuestions: QuestionData = null;
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
  responseLayout: String;
  questionDialogRef;
  addNewRowResp = false;

  constructor(
    private modalService: NgbModal,
    public toastService: ToastService,
    private fb: FormBuilder
  ) {}

  uniqueIdx = 0;

  ngOnInit(): void {
    console.log('questionsList: ', this.questionsList);
    console.log('regtypesList: ', this.regtypesList);
    console.log('pageType: ', this.pageType);
    this.regtypeControl.valueChanges.subscribe((value: string) => {
      this.searchItems();
    });
  }

  ngOnChanges(changes) {
    this.questionsList = this.questionsList.map((el) => {
      el.id = this.uniqueIdx++;
      return el;
    });
    this.searchItems();
  }

  createQuestion() {
    const createQuestionModalRef = this.modalService.open(
      EditQuestionsDetailComponent,
      {
        size: 'lg',
        windowClass: 'modal-custom-createQuestion',
      }
    );
    createQuestionModalRef.componentInstance.regtypesList =
      this.regtypesList.map((regtype: RegtypeData) => regtype.description);
    createQuestionModalRef.componentInstance.questionsList =
      this.questionsList.map((item) => item.question.trim().toLowerCase());
    createQuestionModalRef.result
      .then((newQuestion: any) => {
        console.log('Created Question Detail: ', newQuestion);
        if (!newQuestion) {
          return;
        }
        this.handleQuestionEditorResponse(newQuestion);
      })
      .catch((err: Error) => {
        console.error('close error: ', err);
      });
  }

  handleQuestionEditorResponse(newQuestion: any) {
    let dup = false;
    this.questionElements.map((question: QuestionData, key) => {
      if (
        question.question === newQuestion.description &&
        question.questionName === newQuestion.demQuestion &&
        question.pollingType === newQuestion.pollingTypeCode &&
        (this.editIndex === null || question.id !== this.editIndex)
      ) {
        const alert = 'Question Name needs to be unique';
        Swal.fire({
          icon: 'warning',
          title: 'Check Again',
          text: alert,
          confirmButtonColor: '#3085d6',
        });
        dup = true;
      }
    });

    if (!dup) {
      if (this.editIndex !== null) {
        const existingIndex = this.questionsList.findIndex(
          (q: QuestionData) => q.id == this.editIndex
        );
        const existingQuestion: QuestionData =
          this.questionsList[existingIndex];
        const updatedQuestion: QuestionData = {
          ...existingQuestion,
          pollingType: newQuestion.pollingTypeCode,
          category: newQuestion.category,
          demDetails:
            newQuestion.responseLayout != 'Freetext'
              ? newQuestion.demDetails.map((dem) => {
                  dem.demQuestion = newQuestion.description;
                  return dem;
                })
              : [],
          questionName: newQuestion.demQuestion,
          responseLayout: newQuestion.responseLayout,
          columns: newQuestion.columns,
          additionalInfoName: newQuestion.additionalInfoName,
          additionalInfoValue: newQuestion.additionalInfoValue,
          chooseResponse: newQuestion.chooseResponse,
          question: newQuestion.description,
        };
        this.questionsList[existingIndex] = updatedQuestion;

        /** Update the questionElements */
        const existingQuestionIndex = this.questionElements.findIndex(
          (q: QuestionData) => q.id == this.editIndex
        );
        this.questionElements[existingQuestionIndex] = updatedQuestion;

        this.dataChange.emit(this.questionsList);

        this.toastService.show('question modified', {
          delay: 6000,
          classname: 'bg-success text-light',
          headertext: 'Success',
          autohide: true,
        });
      } else {
        let id = this.questionsList.length;
        this.questionsList.push({
          id,
          questionName: newQuestion.demQuestion,
          category: newQuestion.category,
          question: `${newQuestion.description}`,
          checked: true,
          pollingType: `${newQuestion.pollingTypeCode}`,
          demDetails:
            newQuestion.responseLayout != 'Freetext'
              ? newQuestion.demDetails.map((dem) => {
                  dem.demQuestion = newQuestion.description;
                  return dem;
                })
              : [],
          responseLayout: newQuestion.responseLayout,
          columns: newQuestion.columns,
          additionalInfoName: newQuestion.additionalInfoName,
          additionalInfoValue: newQuestion.additionalInfoValue,
          chooseResponse: newQuestion.chooseResponse,
        });

        this.dataChange.emit(this.questionsList);

        this.toastService.show('Questions added', {
          delay: 6000,
          classname: 'bg-success text-light',
          headertext: 'Success',
          autohide: true,
        });
        this.searchItems();
      }
      this.editIndex = null;
    } else {
      return;
    }
  }

  removeQuestion(i: number) {
    const deleteRegtypeConfirmModalRef = this.modalService.open(
      DeleteConfirmComponent,
      {
        size: 'sm',
        windowClass: 'modal-custom-deleteConfirm',
      }
    );
    deleteRegtypeConfirmModalRef.componentInstance.confirmMsg =
      'Delete this code?';
    deleteRegtypeConfirmModalRef.result
      .then((agree: boolean) => {
        console.log('Do you want to delete?: ', agree);
        if (agree === true) {
          const id: number = this.questionElements[i].id;
          this.questionElements?.splice(i, 1);
          this.questionsList = this.questionsList.filter(
            (q: QuestionData) => q.id !== id
          );
          this.dataChange.emit(this.questionsList);
        }
      })
      .catch((err: Error) => {
        console.error('close error: ', err);
      });
  }

  importQuestions() {
    const importQuestionsRef = this.modalService.open(
      ImportQuestionsComponent,
      {
        size: 'md',
        windowClass: 'modal-custom-importQuestions',
      }
    );

    importQuestionsRef.componentInstance.regtypesList = this.regtypesList;

    importQuestionsRef.result
      .then((questions: QuestionData[]) => {
        console.log('result: ', questions);
        if (questions) {
          let updateCount: number = 0;
          questions?.forEach((q: QuestionData) => {
            /** this.questionsList Check the duplication */
            const prevExistingIndex: any = this.questionsList?.findIndex(
              (oldQuestion: QuestionData) =>
                q.question === oldQuestion.question &&
                q.questionName === oldQuestion.questionName &&
                q.pollingType === oldQuestion.pollingType
            );
            if (prevExistingIndex > -1) {
              let categories =
                this.questionsList[prevExistingIndex].category || [];
              q.category.forEach((category: string) =>
                categories.push(category)
              );

              this.questionsList[prevExistingIndex] = {
                ...this.questionsList[prevExistingIndex],
                ...q,
                category: categories,
              };
              const existingTableQuestionIndex: number =
                this.questionElements.findIndex(
                  (tableQuestion: QuestionData) =>
                    tableQuestion.id ===
                    this.questionsList[prevExistingIndex]?.id
                );
              this.questionElements[existingTableQuestionIndex] = {
                ...this.questionElements[existingTableQuestionIndex],
                ...this.questionsList[prevExistingIndex],
                category: categories,
              };
              updateCount++;
            } else {
              /** Add the questions */
              q.id = this.uniqueIdx++; //this.questionsList.length;
              q.checked = false;
              this.questionsList.push(q);
              this.dataChange.emit(this.questionsList);
              this.searchItems();
            }
          });

          this.toastService.show(
            Number(questions.length) + ' questions added.',
            {
              delay: 8000,
              classname: 'bg-success text-light',
              headertext: 'Successfully Imported',
              autohide: true,
            }
          );
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }

  editQuestion(question: QuestionData) {
    this.editIndex = question.id;
    const editQuestionDetailModalRef = this.modalService.open(
      EditQuestionsDetailComponent,
      {
        size: 'lg',
        windowClass: 'modal-custom-editQuestionDetail',
      }
    );
    editQuestionDetailModalRef.componentInstance.question = question;
    editQuestionDetailModalRef.componentInstance.regtypesList =
      this.regtypesList.map((regtype: RegtypeData) => regtype.description);
    editQuestionDetailModalRef.componentInstance.questionsList =
      this.questionsList.map((item) => item.question.trim().toLowerCase());
    editQuestionDetailModalRef.result
      .then((editedQuestion: QuestionData) => {
        console.log('Edited Question Detail: ', editedQuestion);
        if (!editedQuestion) {
          return;
        }
        this.handleQuestionEditorResponse(editedQuestion);
      })
      .catch((err: Error) => {
        console.error('close error: ', err);
      });
  }

  searchItems() {
    if (this.regtypeControl.value) {
      this.questionElements = this.questionsList.filter((q: QuestionData) =>
        Array(...q.category)
          .map((v) => v.toLowerCase())
          .includes(this.regtypeControl.value.toLowerCase())
      );
    } else {
      this.questionElements = [];
    }
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
          let i = this.questionElements.length - 1;
          while (i >= 0) {
            if (this.questionElements[i].checked) {
              const id: number = this.questionElements[i].id;
              this.questionElements?.splice(i, 1);
              this.questionsList = this.questionsList.filter(
                (q: QuestionData) => q.id !== id
              );
            }
            i--;
          }
          this.dataChange.emit(this.questionsList);
        }
      })
      .catch((err: Error) => {
        console.error('close error: ', err);
      });
  }

  selectAllItems() {
    let val = this.disableDeleteBtn();
    this.questionElements = this.questionElements.map((el) => {
      el.checked = val;
      return el;
    });
  }

  disableDeleteBtn() {
    return this.questionElements.every((el) => !el.checked);
  }
}
