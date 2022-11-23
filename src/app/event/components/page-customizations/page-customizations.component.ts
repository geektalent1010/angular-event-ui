import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChange,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Stepper from 'bs-stepper';
import {
  FieldData,
  PageCustomizationConfig,
  WorkflowData,
  PageData,
  SectionData,
} from '../../interfaces/customPage';
import { DeleteConfirmComponent } from '../../modals/delete-confirm/delete-confirm.component';
import { FieldModalComponent } from '../../modals/field-modal/field-modal.component';
import { mandatoryFields, WorkflowList } from './defaultPageData';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'app-page-customizations',
  templateUrl: './page-customizations.component.html',
  styleUrls: ['./page-customizations.component.scss'],
})
export class PageCustomizationsComponent implements OnInit {
  @Input('eventInfo') eventInfo: any;
  @Input('pageType') pageType: string;
  @Input('pageList') pageList: WorkflowData[];
  @Input('businessRulesInp') businessRulesInp: [];
  @Input('builderSelection')
  get builderSelection(): string {
    return this._builderSelection;
  }
  set builderSelection(builderSelection: string) {
    this._builderSelection =
      (builderSelection && builderSelection.trim()) || '';
  }
  private _builderSelection = '';
  @Input('selectedWorkflow') selectedWorkflow: WorkflowData;
  @Input('selectedPage') selectedPage: PageData;
  @Input('selectedSection') selectedSection: SectionData;
  @Input('stepIndex') stepIndex: number;
  @Input('regtypesList') regtypesList: any[];
  @Output()
  onBackPageCustomizationConfig: EventEmitter<PageCustomizationConfig> = new EventEmitter();
  private stepper: Stepper;

  touchedStep: boolean = false;
  mandatoryFields = [];

  error: any = {};

  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    sanitize: false,
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText',
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
  };

  constructor(private modalService: NgbModal) {}

  ngOnInit(): void {
    console.log(' this.pageList ===>  ', this.pageList);
    // this.pageList.pop();
    // this.pageList = [ ...this.pageList, WorkflowList[3]];

    const organizer =
      localStorage.getItem('firstName') +
      ' ' +
      localStorage.getItem('nameLast');
    console.log(organizer);

    let paymentNotice =
      WorkflowList[0].pageList[2].sectionsList[0].fieldsList[0].value;
    paymentNotice = paymentNotice.replaceAll('[organizer]', organizer);

    let terms_conditions =
      WorkflowList[0].pageList[2].sectionsList[1].fieldsList[0].value;
    terms_conditions = terms_conditions.replaceAll('[organizer]', organizer);
    terms_conditions = terms_conditions.replaceAll(
      '[eventName]',
      this.eventInfo?.eventName
    );

    WorkflowList[0].pageList[2].sectionsList[0].fieldsList[0].value =
      paymentNotice;
    WorkflowList[0].pageList[2].sectionsList[1].fieldsList[0].value =
      terms_conditions;
  }

  ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
    console.log('ngonchanges!!! ', changes);
    if (changes.businessRulesInp) {
      this.businessRulesInp.forEach((br: any) => {
        if (
          br.businessRule.selectedWorkflow === 'pageCustomization' ||
          (br.businessRule.selectedWorkflow === 'workflow' &&
            br.businessRule.selectedPage === 'personal_info')
        ) {
          let selectedWorkflow = this.pageList?.find(
            (w: WorkflowData) => w.workflow === 'attendee'
          );
          let selectedPage = selectedWorkflow?.pageList?.find(
            (page: PageData) => page.name === 'personal_info'
          );
          let selectedSection = selectedPage?.sectionsList?.find(
            (section: SectionData) =>
              section.name === br.businessRule.selectedPage
          );
          if (
            selectedSection &&
            !selectedSection.fieldsList.some(
              (el) => el.name === br.businessRule.ruleName
            )
          ) {
            selectedSection.fieldsList.push({
              label: br.businessRule.ruleName,
              name: br.businessRule.ruleName,
              type: 'business rule',
              value: '',
              static: false,
              disable: false,
              required: true,
              visible: true,
              isActive: true,
            });
          }
        }
      });
    }
    if (changes.pageList) {
      this.filterWorkflowData(
        this.pageList?.length <= 0 ? WorkflowList : this.pageList,
        this.pageList?.length > 0
      );
      this.selectedWorkflow = null;
      this.selectedPage = null;
      this.selectedSection = null;
      this.stepIndex = 0;
      if (changes.pageList.firstChange) {
        this.stepper = new Stepper(document.querySelector('#stepper1'), {
          linear: true,
          animation: true,
        });
      }
      this.stepper.to(1);
      this.changeConfig();
    }
    if (changes.stepIndex) {
      if (this.stepIndex > 0) {
        this.stepper.to(this.stepIndex + 1 || 0);
        this.changeConfig();
      }
    }
  }

  filterWorkflowData(workflowList: WorkflowData[], saved: boolean = false) {
    const newWorkflowList: WorkflowData[] = workflowList?.map(
      (workflow: WorkflowData) =>
        this._builderSelection.includes('workflow5') &&
        workflow.workflow === 'attendee'
          ? {
              ...workflow,
              pageList: workflow?.pageList?.map((page: PageData) => ({
                ...page,
                sectionsList: page?.sectionsList?.filter(
                  (section: SectionData) => section.name !== 'reg_account_info'
                ),
              })),
            }
          : workflow
    );
    this.pageList = newWorkflowList;
    if (saved) {
      this.selectedWorkflow = newWorkflowList?.find(
        (w: WorkflowData) => w.workflow === this.selectedWorkflow?.workflow
      );
      this.selectedPage = this.selectedWorkflow?.pageList?.find(
        (page: PageData) => page.name === this.selectedPage?.name
      );
      this.selectedSection = this.selectedPage?.sectionsList?.find(
        (section: SectionData) => section.name === this.selectedSection?.name
      );
    }
  }

  previous() {
    this.stepIndex -= 1;
    this.stepper.previous();
    this.changeConfig();
  }

  next() {
    if (this.isValidStep()) {
      this.stepIndex += 1;
      this.touchedStep = false;
      this.stepper.next();
      this.changeConfig();

      this.sortFieldlist();
    } else {
      this.touchedStep = true;
    }
  }

  isValidStep(): boolean {
    let returnValue: boolean = true;
    switch (this.stepIndex) {
      case 0:
        returnValue = Boolean(this.selectedWorkflow);
        break;
      case 1:
        returnValue = Boolean(this.selectedPage);
        break;
      case 2:
        returnValue = Boolean(this.selectedSection);
        break;
      default:
        break;
    }
    return returnValue;
  }

  removeField(i: number) {
    const removeFieldConfirmModalRef = this.modalService.open(
      DeleteConfirmComponent,
      {
        size: 'sm',
        windowClass: 'modal-custom-deleteConfirm',
      }
    );
    removeFieldConfirmModalRef.componentInstance.confirmMsg =
      'Delete this field?';
    removeFieldConfirmModalRef.result
      .then((agree: boolean) => {
        console.log('Do you want to delete?: ', agree);
        if (agree === true) {
          // this.selectedSection.fieldsList.splice(i, 1);
          this.selectedSection.fieldsList[i].isActive = false;
          this.changeConfig();
        }
      })
      .catch((err: Error) => {
        console.error('close error: ', err);
      });
  }

  editField(i: number) {
    const editFieldModalRef: any = this.modalService.open(FieldModalComponent, {
      size: 'normal',
      windowClass: 'modal-custom-editField',
    });
    editFieldModalRef.componentInstance.isCreate = false;
    editFieldModalRef.componentInstance.field =
      this.selectedSection?.fieldsList[i];
    editFieldModalRef.componentInstance.regtypesList = Array.isArray(
      this.regtypesList
    )
      ? this.regtypesList.map(
          (regtype) => regtype.code + ' - ' + regtype.description
        )
      : [];
    editFieldModalRef.componentInstance.requiredIsArray = false;
    editFieldModalRef.componentInstance.showColumn =
      this.selectedWorkflow?.workflow === 'show organizer';
    editFieldModalRef.componentInstance.showLookup =
      this.selectedSection?.name === 'badge-type';
    editFieldModalRef.result
      .then((field: FieldData) => {
        console.log('Edited Field: ', field);
        if (!field) {
          return;
        }
        this.selectedSection.fieldsList[i] = field;
        this.changeConfig();
        this.sortFieldlist();
      })
      .catch((err: Error) => {
        console.error('close error: ', err);
      });
  }

  addNewField() {
    const createFieldModalRef: any = this.modalService.open(
      FieldModalComponent,
      {
        size: 'normal',
        windowClass: 'modal-custom-createField',
      }
    );
    createFieldModalRef.componentInstance.isCreate = true;
    createFieldModalRef.componentInstance.regtypesList = Array.isArray(
      this.regtypesList
    )
      ? this.regtypesList.map(
          (regtype) => regtype.code + ' - ' + regtype.description
        )
      : [];
    createFieldModalRef.componentInstance.requiredIsArray = false;
    createFieldModalRef.componentInstance.showColumn =
      this.selectedWorkflow?.workflow === 'show organizer';
    createFieldModalRef.componentInstance.showLookup =
      this.selectedSection?.name === 'badge-type';
    createFieldModalRef.result
      .then((field: FieldData) => {
        console.log('New Created Field: ', field);
        if (!field) {
          return;
        }
        this.selectedSection.fieldsList.push(field);
        this.changeConfig();
        this.sortFieldlist();
      })
      .catch((err: Error) => {
        console.error('close error: ', err);
      });
  }

  isArray(obj: any) {
    return Array.isArray(obj);
  }

  changeConfig(type: string = '') {
    if (type === 'workflow') this.selectedPage = null;
    if (type === 'page') this.selectedSection = null;

    const config: PageCustomizationConfig = {
      selectedWorkflow: this.selectedWorkflow,
      selectedPage: this.selectedPage,
      selectedSection: this.selectedSection,
      stepIndex: this.stepIndex,
    };

    if (this.selectedWorkflow) {
      this.mandatoryFields = mandatoryFields.find(
        (el) => el.workflow === this.selectedWorkflow?.workflow
      )?.value;
    }
    this.onBackPageCustomizationConfig.emit(config);
  }

  changeHeaderField(field: FieldData) {
    const linkFields: String[] = ['facebook', 'twitter', 'linkedin', 'youtube'];
    if (linkFields.includes(field.name) && field.value) {
      const regex: RegExp = new RegExp(
        '^(https:\\/\\/)[\\w\\-_]+(\\.[\\w\\-_]+)+([\\w\\-\\.,@?^=%&amp;:/~\\+#]*[\\w\\-\\@?^=%&amp;/~\\+#])?'
      );
      if (!regex.test(field.value)) {
        this.error[String(field.name)] = field.name + ' is invalid link';
      } else {
        delete this.error[String(field.name)];
      }
    }
  }

  validateCustomTab() {
    return Object.keys(this.error)?.length < 1;
  }

  changeActiveStatus(checked: boolean, i: number) {
    this.selectedSection.fieldsList[i].isActive = checked;
    this.changeConfig();
  }

  onDrop(event: any) {
    moveItemInArray(
      this.selectedSection.fieldsList,
      event.previousIndex,
      event.currentIndex
    );

    if (
      this.selectedWorkflow?.workflow === 'show organizer' &&
      this.selectedSection?.fieldsList?.length > 0
    ) {
      if (event.currentIndex === 0) {
        this.selectedSection.fieldsList[event.currentIndex].column = 1;
      } else {
        this.selectedSection.fieldsList[event.currentIndex].column =
          this.selectedSection.fieldsList[event.currentIndex - 1].column;
      }
    }
  }

  selectSection(e: Event, section: any) {
    e.preventDefault();
    e.stopPropagation();
    console.error('section: ', section);
    this.selectedSection = section;
    this.touchedStep = true;
  }

  toggleSection(i: number) {
    this.selectedPage.sectionsList[i].hidden =
      !this.selectedPage.sectionsList[i]?.hidden;
    if (
      this.selectedSection?.name === this.selectedPage.sectionsList[i]?.name
    ) {
      this.selectedSection.hidden = this.selectedPage.sectionsList[i].hidden;
    }
  }

  sortFieldlist() {
    if (
      this.selectedWorkflow?.workflow === 'show organizer' &&
      this.selectedSection?.fieldsList?.length > 0
    ) {
      this.selectedSection.fieldsList.sort((a, b) => {
        if (a.column > b.column) return 1;
        else if (a.column === b.column) return 0;
        else return -1;
      });
    }
  }
}
