import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, defaultIfEmpty, distinctUntilChanged } from 'rxjs/operators';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { API_URL2 } from 'src/app/services/url/url';
import { environment } from 'src/environments/environment';

var headers = new HttpHeaders()
  .set('content-type', 'application/json')
  .set('Access-Control-Allow-Headers', 'Content-Type')
  .set('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS')
  .set('Access-Control-Allow-Origin', '*');

const CREATE_DUPLICATE_EVENT: string = `${API_URL2}/csi/event/services/eventSetupV2/createDuplicateEvent`;
const projectId: string = environment.production
  ? 'csi-event-a3367'
  : 'test-csi-event';

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
    private spinner: NgxSpinnerService,
    private http: HttpClient,
    public toastService: ToastService,
    private localStorageService: LocalStorageService,
    private router: Router
  ) {
    this.duplicateEventForm = new FormGroup({
      evtName: new FormControl("", Validators.required),
      regTypes: new FormControl(true, Validators.required),
      costsAndPackages: new FormControl(true, Validators.required),
      discounts: new FormControl(true, Validators.required),
      qualifications: new FormControl(true, Validators.required),
      sessions: new FormControl(true, Validators.required),
      floorplan: new FormControl(true, Validators.required),
      questions: new FormControl(true, Validators.required),
      pageBuilder: new FormControl(true, Validators.required),
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
        if (index < 10) console.error("eventName: ", eventName);
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
      this.spinner.show("registrationLoading");
      var userName = this.localStorageService.get('username');
      const duplicateEventBody: any = {
        evtUid: this.evtUid,
        projectId,
        clientName: userName,
        ...this.duplicateEventForm.value
      };

      if (localStorage.getItem("Authorization")) {
        headers = new HttpHeaders()
        .set('content-type', 'application/json')
        .set('Access-Control-Allow-Headers', 'Content-Type')
        .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        .set('Access-Control-Allow-Origin', '*')
        .set('Authorization', localStorage.getItem("Authorization"));
      }

      this.http.post(CREATE_DUPLICATE_EVENT, duplicateEventBody, { headers }).subscribe((res: any) => {
        this.spinner.hide("registrationLoading");
        if (res?.statusMessage === "Success") {
          this.toastService.show('The event was cloned successfully', {
            delay: 6000,
            classname: 'bg-success text-light',
            headertext: 'Create Duplicate Event',
            autohide: true,
          });
          this.closeModal();
          this.router.navigateByUrl("");
        } else {
          this.toastService.show(res?.response?.Reason || 'Something went wrong, please try again', {
            delay: 6000,
            classname: 'bg-danger text-light',
            headertext: 'Duplicate Event Error',
            autohide: true,
          });
        }
      }, (err: HttpErrorResponse) => {
        this.spinner.hide("registrationLoading");
        this.toastService.show(err?.message || 'Something went wrong, please try again', {
          delay: 6000,
          classname: 'bg-danger text-light',
          headertext: 'Duplicate Event Error',
          autohide: true,
        });
      });
    } else {
      Object.keys(this.lf).forEach((field: string) => {
        this.lf[field].markAsTouched();
      });
    }
  }
}
