import { Component, Input, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { API_URL2 } from '../../services/url/url';
import { ToastService } from '../../services/toast/toast.service';

var headers = new HttpHeaders()
.set('content-type', 'application/json')
.set('Access-Control-Allow-Headers', 'Content-Type')
.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
.set('Access-Control-Allow-Origin', '*');

@Component({
  selector: 'app-access-code-modal',
  templateUrl: './access-code-modal.component.html',
  styleUrls: ['./access-code-modal.component.scss']
})
export class AccessCodeModalComponent implements OnInit {
  @Input('evtUid') evtUid: any;

  codeInvalid: boolean = false;
  codeForm: FormGroup = new FormGroup({
    code: new FormControl("", [Validators.required, Validators.minLength(6), Validators.maxLength(6)])
  });

  loading = false;

  constructor(public activeModal: NgbActiveModal, private router: Router, private toastService: ToastService, private httpClient: HttpClient,) { }

  ngOnInit(): void {
    if (localStorage.getItem("Authorization")) {
      headers = new HttpHeaders()
        .set('content-type', 'application/json')
        .set('Access-Control-Allow-Headers', 'Content-Type')
        .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        .set('Access-Control-Allow-Origin', '*')
        .set('Authorization', localStorage.getItem("Authorization"));
    }
  }

  get lf() {
    return this.codeForm.controls;
  }

  closeModal() {
    this.activeModal.close();
  }

  onSubmit() {
    Object.keys(this.lf).forEach((key: string) => {
      this.lf[key].markAsTouched();
      this.lf[key].updateValueAndValidity();
    });
    if (this.codeForm.valid) {
      const eventAccessCode = this.codeForm.get('code').value;
      const encoded = btoa(eventAccessCode);
      // validate access code
      const body = {
        evtUid: this.evtUid,
        eventAccessCode: encoded
      }
      
      this.loading = true;
      this.httpClient.post(API_URL2 + '/csi/event/services/eventSetupV2/authorizeAccessCode', body, { headers }).subscribe((x: any) => {
        if (x && x.statusCode == 200 && x?.response?.AccessCodeMatchs === 'true') {
          this.activeModal.close();
          this.router.navigate(["/eventExplorer/edit/" + this.evtUid]);
        } else {
          this.codeInvalid = true;
        }
        this.loading = false;
      }, (err) => {
        console.log(err);
        this.loading = false;
      });
    }
  }

  remindCode() {
    var EVENT_DATA_API1 = API_URL2 + '/csi/event/services/eventSetupV2/sendEmailAccessCode?evtUid=' + this.evtUid;

    this.httpClient.get(EVENT_DATA_API1, { headers }).subscribe((data: any) => {
      this.toastService.show('Email Sent. Please check your inbox', {
        delay: 6000,
        classname: 'bg-success text-light',
        headertext: 'Sent Access Code',
        autohide: true,
      });
    }, (err) => {
      this.toastService.show("Something went wrong. Try again later", {
        delay: 8000,
        classname: 'bg-warning text-light',
        headertext: 'Warning',
        autohide: true,
      });
    });

    
  }
}
