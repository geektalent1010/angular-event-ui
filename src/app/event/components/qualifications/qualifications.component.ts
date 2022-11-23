import {
  ChangeDetectorRef,
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  SimpleChange,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UploadService } from 'src/app/services/upload.service';
import { RegtypeData } from '../../interfaces/Regtype';
import { CreateQualificationComponent } from '../../modals/create-qualification/create-qualification.component';
import { DeleteConfirmComponent } from '../../modals/delete-confirm/delete-confirm.component';

@Component({
  selector: 'app-qualifications',
  templateUrl: './qualifications.component.html',
  styleUrls: ['./qualifications.component.scss'],
})
export class QualificationsComponent implements OnInit {
  @Input('data') qualificationList: any[];
  @Input('regtypesList') regtypesList: any[];
  @Input('pageType') pageType: string;
  @Input('noQualifications') noQualifications: boolean;
  editIndex: number = null;
  typeList: string[] = [
    'Business Card',
    'Published Article with Byline',
    'Military ID',
    'Editorial',
    'Insurance Certificate',
    'YouTube Analytics',
    'YouTube Studio Statistics',
    'Press Pass',
    'Published Photo with Photo Credit',
    'Media Assignment Letter',
    'Member ID',
    'taxIDNumber',
    'payStub',
    'busLi',
    'photoID',
  ];

  @Output() onNoQualificationsChange = new EventEmitter();

  selectedItems: boolean[] = [];

  constructor(
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private bucket: UploadService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    console.log('qualificationList: ', this.qualificationList);
    console.log('regtypesList: ', this.regtypesList);
    console.log('pageType: ', this.pageType);

    this.selectedItems = this.qualificationList.map((el) => false);
  }

  ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
    if (changes.qualificationList) {
      if (this.noQualifications) {
        this.qualificationList = [];
      }
      this.selectedItems = this.qualificationList.map((el) => false);
    }
  }

  editQualification(i: number) {
    const createQualificationModalRef = this.modalService.open(
      CreateQualificationComponent,
      {
        size: 'lg',
        windowClass: 'modal-custom-createQualification',
      }
    );
    createQualificationModalRef.componentInstance.regTypes =
      this.regtypesList.map((regtype: RegtypeData) => regtype.description);
    createQualificationModalRef.componentInstance.isEdit = true;
    createQualificationModalRef.componentInstance.data =
      this.qualificationList[i];
    createQualificationModalRef.result
      .then((qualification: any) => {
        if (!qualification) {
          return;
        }
        this.qualificationList[i] = qualification;
      })
      .catch((err) => console.error(err));
  }

  removeQualification(i: number) {
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
          if (this.editIndex === i) this.editIndex = null;
          this.qualificationList?.splice(i, 1);
          this.selectedItems.splice(i, 1);
        }
      })
      .catch((err: Error) => {
        console.error('close error: ', err);
      });
  }

  createNewQualification() {
    if (this.noQualifications) return;

    const createQualificationModalRef = this.modalService.open(
      CreateQualificationComponent,
      {
        size: 'lg',
        windowClass: 'modal-custom-createQualification',
      }
    );
    createQualificationModalRef.componentInstance.regTypes =
      this.regtypesList.map((regtype: RegtypeData) => regtype.description);
    createQualificationModalRef.componentInstance.isEdit = false;
    createQualificationModalRef.result
      .then((qualification: any) => {
        console.log('New Created qualification: ', qualification);
        if (!qualification) {
          return;
        }
        if (Array.isArray(qualification.regType)) {
          Array(...qualification.regType).forEach((regtype: string) => {
            const isExistingQual = this.qualificationList.find(
              (item) =>
                qualification.qualification.toLowerCase() ==
                  item.qualification.toLowerCase() && item.regType === regtype
            );
            if (!isExistingQual) {
              this.qualificationList.push({
                ...qualification,
                regType: regtype,
              });
              this.selectedItems.push(false);
            } else {
              this.toastService.show(
                `${qualification.qualification} - ${regtype} is already exists`,
                {
                  delay: 6000,
                  classname: 'bg-danger text-light',
                  headertext: 'Duplicated Error',
                  autohide: true,
                }
              );
            }
          });
        }
      })
      .catch((err) => console.error(err));
  }

  uploadLogo(event, i: number) {
    let reader = new FileReader(); // HTML5 FileReader API
    let file = event.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert('file size cannot be greater than 5 MB');
      return;
    }
    if (event.target.files && event.target.files[0]) {
      reader.readAsDataURL(file);
      this.saveImg(file, i);
    }
    // When file uploads set it to file formcontrol
    reader.onload = () => {
      this.qualificationList[
        i
      ].sampleQualificationFileDataData = `${reader.result}`;
    };
    this.cdr.markForCheck();
  }

  saveImg(file, i: number) {
    this.qualificationList[i].sampleQualificationFileData =
      this.bucket.uploadFile('Qualifications', file);
  }

  checkNoQualifications() {
    this.onNoQualificationsChange.emit(this.noQualifications);
    if (this.noQualifications) {
      this.qualificationList.length = 0;
      this.selectedItems.length = 0;
    }
  }

  checkedItem(checked: boolean, idx: number) {
    this.selectedItems[idx] = checked;
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
          let i = this.selectedItems.length - 1;
          while (i >= 0) {
            if (this.selectedItems[i]) {
              this.qualificationList.splice(i, 1);
              this.selectedItems.splice(i, 1);
            }
            i--;
          }
        }
      })
      .catch((err: Error) => {
        console.error('close error: ', err);
      });
  }

  selectAllItems() {
    let val = this.disableDeleteBtn();
    this.selectedItems = this.selectedItems.map((el) => val);
  }

  disableDeleteBtn() {
    return this.selectedItems.every((el) => !el);
  }
}
