import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, defaultIfEmpty, distinctUntilChanged } from 'rxjs/operators';
import { ToastService } from 'src/app/services/toast/toast.service';
  
@Component({
  selector: 'app-duplicate-event',
  templateUrl: './duplicate-event.component.html',
  styleUrls: ['./duplicate-event.component.scss']
})
export class DuplicateEventComponent implements OnInit {
  @Input() evtUid: string;
  @Input() events: string[];
  duplicateEventForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    public toastService: ToastService,
  ) {
    this.duplicateEventForm = new FormGroup({
      evtName: new FormControl("", Validators.required),
      regTypes: new FormControl({ value: true, disabled: true }, Validators.required),
      costsAndPackages: new FormControl(true, Validators.required),
      discounts: new FormControl(true, Validators.required),
      qualifications: new FormControl(true, Validators.required),
      sessions: new FormControl(true, Validators.required),
      floorplan: new FormControl(true, Validators.required),
      questions: new FormControl(true, Validators.required),
      pageBuilder: new FormControl({ value: true, disabled: true }, Validators.required),
      exhibitorAllotments: new FormControl(true, Validators.required),
      memberships: new FormControl(true, Validators.required),
    });
  }

  ngOnInit(): void {
    this.lf["evtName"]?.valueChanges.pipe(
      defaultIfEmpty(),
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((evtName: string) => {
      const sameNameIndex: number = this.events?.findIndex((event: string, index: number) => {
        let eventName: string = "";
        if (!isNaN(Number(event?.split(' ')?.slice(-1)[0]))) {
          const eventNameArray: string[] = event.split(' ');
          eventName = eventNameArray.slice(0, eventNameArray.length - 1)?.join(" ");
        } else {
          eventName = event;
        }
        if (eventName?.trim()?.toLowerCase() === evtName?.trim()?.toLowerCase()) return true;
        else return false;
      });
      if (sameNameIndex > -1) {
        this.lf["evtName"].setErrors({ duplicateName: true });
      } else if (this.lf["evtName"].value) {
        this.lf["evtName"].setErrors(null);
      }
    });
  }

  get lf() {
    return this.duplicateEventForm.controls;
  }

  closeModal() {
    this.activeModal.close();
  }

  save() {
    if (this.duplicateEventForm.valid) {
      this.activeModal.close({
        ...this.duplicateEventForm.value,
        regTypes: true,
        pageBuilder: true
      });
    } else {
      Object.keys(this.lf).forEach((field: string) => {
        this.lf[field].markAsTouched();
      });
    }
  }
}
