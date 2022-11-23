import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { DataService } from '../../services/data.service';
import { v4 as uuid } from 'uuid';
import { ToastService } from 'src/app/services/toast/toast.service';
import { SessionServiceService } from 'src/app/services/session-service.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';
type AOA = any[][];

@Component({
  selector: 'app-create-speaker',
  templateUrl: './create-speaker.component.html',
  styleUrls: ['./create-speaker.component.scss']
})
export class CreateSpeakerComponent implements OnInit {
  createNewSpeakerForm: FormGroup;
  activeSpeakerTab = 1;
  importedData = [];
  constructor(
    private dataService: DataService,
    private toastService: ToastService,
    private sessionService: SessionServiceService,
    public activeModal: NgbActiveModal,
  ) { }

  sepakerEvent = {
    speakerName:'',
    description: '',
    company: '',
    address: '',
    phone: '',
    email:'',
    website: '',
    highLevelCat: '',
    subcategory: '',
  }

  ngOnInit(): void {
    this.createNewSpeakerForm = new FormGroup({
      speakerName: new FormControl('', Validators.required),
      description: new FormControl(''),
      company: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      phone: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      website: new FormControl('', Validators.required),
      subcategory: new FormControl([]),
      highLevelCat: new FormControl(''),
      photoUpload: new FormControl(''),
      speakerUpload: new FormControl(''),
    });
    this.createNewSpeakerForm.controls['website'].valueChanges.subscribe(
      (value: string) => {
        if (value) {
          const weblinkPattern: RegExp =
            /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm;
          const valid: boolean = weblinkPattern.test(value);
          if (!valid) {
            this.lf['website'].setErrors({ link: true });
          } else {
            this.lf['website'].setErrors(null);
          }
        }
      }
    );
  }

  closeModal() {
    this.activeModal.close();
  }

  get lf() {
    return this.createNewSpeakerForm.controls;
  }

  saveNewSpeaker() {
    this.markFormGroupTouched(this.createNewSpeakerForm);
    let alert;
    if (this.createNewSpeakerForm.valid) {
      if (
        this.isDuplicateSpeaker(this.createNewSpeakerForm.value.speakerName)
      ) {
        alert = 'duplicate Speaker name';
        Swal.fire({
          icon: 'warning',
          title: 'Check Again',
          text: alert,
          confirmButtonColor: '#3085d6',
        });
        return false;
      }
      this.dataService.setSpeakerList({
        ...this.createNewSpeakerForm.value,
        sessionNumber: uuid(),
      });
      this.toastService.show('New Speaker Successfully saved', {
        delay: 6000,
        classname: 'bg-success text-light',
        headertext: 'Create Speaker',
        autohide: true,
      });
      this.closeModal();
      return true;
    } else {
      /** Get the invalid field tab index and go to the tab */
      const tabFields: string[][] = [
        ['speakerName', 'description'],
        ['company', 'address', 'phone', 'email', 'website'],
        ['photoUpload'],
        ['highLevelCat', 'subcategory'],
      ];
      const invalidField: string = Object.keys(this.lf)?.find(
        (name: string) => this.lf[name].invalid
      );
      if (invalidField) {
        tabFields.forEach((tabGroup: string[], index: number) => {
          if (tabGroup.includes(invalidField))
            this.activeSpeakerTab = index + 1;
        });
      }

      /** Alert the invalidation */
      alert = 'Please fill mandatory fields in all tabs';
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: alert,
        confirmButtonColor: '#3085d6',
      });
      return false;
    }
  }

  isDuplicateSpeaker(speakerName) {
    return (
      this.dataService.getSpeakerList().filter((speaker) => speaker.speakerName?.toLowerCase() == speakerName.toLowerCase()).length > 0
    );
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  uploadFile($event) {
    if ($event.target.files && $event.target.files.length > 0) {
      const reader: FileReader = new FileReader();
      reader.readAsBinaryString($event.target.files[0]);

      reader.onload = (e: any) => {
        /* read workbook */
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

        /* grab first sheet */
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        /* save data */
        this.importedData = <AOA>(XLSX.utils.sheet_to_json(ws, { raw: false }));
        this.createNewSpeakerForm.patchValue({
          speakerUpload: JSON.stringify(this.importedData)
        })
        console.log(this.importedData);

        this.importedData.forEach((data) => {
          if(this.sepakerEvent.hasOwnProperty(data['column_name'])) {
            this.createNewSpeakerForm.get(data['column_name']).setValue(data['data_type'])
          }
        });
        
      }
    }
  }
}
