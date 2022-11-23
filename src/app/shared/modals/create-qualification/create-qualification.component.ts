import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadService } from 'src/app/services/upload.service';

@Component({
  selector: 'app-create-qualification',
  templateUrl: './create-qualification.component.html',
  styleUrls: ['./create-qualification.component.scss']
})
export class CreateQualificationComponent implements OnInit {
  @Input() regTypes: any[];
  @Input() isEdit: any[];
  @Input() data: any;
  qualificationForm: FormGroup;
  typeList: string[] = [
    "Business Card",
    "Published Article with Byline",
    "Military ID",
    "Editorial",
    "Insurance Certificate",
    "YouTube Analytics",
    "YouTube Studio Statistics",
    "Press Pass",
    "Published Photo with Photo Credit",
    "Media Assignment Letter",
    "Member ID",
    'taxIDNumber', 'payStub', 'busLi', 'photoID'
  ];
  sampleImg: string = "";
  sampleFileName: any;
  formRequirementDoc;
  formRequirementDocName;

  constructor(
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private bucket: UploadService
  ) {
    this.qualificationForm = new FormGroup({
      qualification: new FormControl("", Validators.required),
      sampleQualificationFileData: new FormControl(""),
      qualName: new FormControl("", Validators.required),
      regType: new FormControl("", Validators.required),
    });
  }

  ngOnInit(): void {
    if(this.isEdit){
      this.qualificationForm.patchValue(this.data);
      this.formRequirementDocName = this.data.formRequirement;
    }
  }


  get lf() {
    return this.qualificationForm.controls;
  }

  closeModal() {
    this.activeModal.close();
  }

  saveImg(file, type){
    if(type == 'sampleQualificationFileData'){
      this.sampleFileName = this.bucket.uploadFile('Qualifications',file)
    } else if(type == 'formRequirement') {
      this.formRequirementDocName = this.bucket.uploadFile('Qualifications',file);
    }
  }

  getImgLinkOfType(type){
    if(type == 'sampleQualificationFileData'){
      return  window.open("https://csi-event-images.s3.us-east-2.amazonaws.com/Qualifications/"+(this.sampleFileName?this.sampleFileName:this.qualificationForm.value.sampleQualificationFileData));
    } else if(type == 'formRequirement') {
      return  window.open("https://csi-event-images.s3.us-east-2.amazonaws.com/Qualifications/"+(this.formRequirementDocName?this.formRequirementDocName:this.qualificationForm.value.formRequirement));
    }
  }

  getImage(id){
    return this.http.get('url'+id);
  }

  uploadLogo(event, type) {
    let reader = new FileReader(); // HTML5 FileReader API
    let file = event.target.files[0];
    if(file.size >5000000){
      alert("file size cannot be greater than 5 MB");
      return;
    }
    if (event.target.files && event.target.files[0]) {
      reader.readAsDataURL(file);
      this.saveImg(file, type);
    }
    // When file uploads set it to file formcontrol
    reader.onload = () => {
      if(type == 'sampleQualificationFileData'){
        this.sampleImg = `${reader.result}`;
      } else if(type == 'formRequirement') {
        this.formRequirementDoc = `${reader.result}`;
      }
    };
    this.cdr.markForCheck();
  }

  save() {
    if (this.qualificationForm.valid) {
      const qualificationData: any = this.qualificationForm.value;
      this.activeModal.close({
        regType: qualificationData.regType,
        qualification: qualificationData.qualification,
        sampleQualificationFileData: this.sampleFileName,
        sampleQualificationFileDataData: this.sampleImg,
        formRequirement: this.formRequirementDocName,
        // formRequirementData: this.formRequirementDoc,
        qualName: qualificationData.qualName,
        editFlag: this.isEdit ? 'edited':null
      });
    } else {
      Object.keys(this.lf).forEach((field: string) => {
        this.lf[field].markAsTouched();
        this.lf[field].updateValueAndValidity();
      });
    }
  }
}
