import { Component, Input, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { AngularEditorConfig } from "@kolkov/angular-editor";
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-send-invite',
  templateUrl: './send-invite.component.html',
  styleUrls: ['./send-invite.component.scss']
})
export class SendInviteComponent implements OnInit {
  @Input() evtUid: string;
  @Input() inviteType: string;
  @Input() tinyUrl: string;
  @Input() eventInfo: any;

  inviteForm: FormGroup;

  loading = true;

  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: "15rem",
    minHeight: "5rem",
    placeholder: "Enter text here...",
    translate: "no",
    defaultParagraphSeparator: "p",
    defaultFontName: "Arial",
    toolbarHiddenButtons: [["bold"]],
    sanitize: false,
    customClasses: [
      {
        name: "quote",
        class: "quote"
      },
      {
        name: "redText",
        class: "redText"
      },
      {
        name: "titleText",
        class: "titleText",
        tag: "h1"
      }
    ]
  };

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder, private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.inviteForm = this.fb.group({
      customerEmail: [[], [Validators.required]],
      // customerName: ['', [Validators.required]],
      // name: ['', [Validators.required]],
      subject: ['', [Validators.required]],
      body: [],
    });

    let defaultHtml = '';
    if (this.eventInfo) {
      let address = this.eventInfo.address1 + (this.eventInfo.address2? ' '+this.eventInfo.address2:'') + (this.eventInfo.address3? ' '+this.eventInfo.address3:'');
      defaultHtml = `<div>
      <p style="text-align:start;">You are invitated to "${this.eventInfo.eventName}"</p><br />
      <p style="text-align:start;">You can access the ${this.inviteType[0].toUpperCase() + this.inviteType.slice(1)} portal here: <a href="${this.tinyUrl}" target="_blank">${this.tinyUrl}</a></p><br />
      <p style="text-align:start;">We look forward to seeing you!</p><br />
      <p style="text-align:start;">${address} in ${this.eventInfo.city}, ${this.eventInfo.state} from ${this.eventInfo.startDate} to ${this.eventInfo.endDate}</p>
      </div>`
    }

    this.form['body'].setValue(defaultHtml);

    setTimeout(() => this.loading=false, 100);
  }

  get form() {
    return this.inviteForm.controls;
  }

  generateBatchEmails(emails){
    // const from = localStorage.getItem('emailAddr')
    let body = {
      "From": 'info@a4safe.com',
      "To": '',
      "Subject": this.form.subject.value,
      "HtmlBody": this.form.body.value,
      "MessageStream": "outbound"
    }
    return emails?.map(email => ({...body, To: email}));
  }

  sendEmail() {
    console.log(this.form.customerEmail.value);
    if (this.inviteForm.invalid) {
      this.markFormGroupTouched(this.inviteForm);
      const alert = 'Please fill required details';
      Swal.fire({
        icon: 'warning',
        title: 'Check Again',
        text: alert,
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    var headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Accept', 'application/json')
      .set('X-Postmark-Server-Token', environment.postmark.serverToken)
    // let base64 = window.btoa(unescape(encodeURIComponent(this.form.body.value)));
    // const postData = {
    //   evtUid: this.evtUid,
    //   customerEmails: this.form.customerEmail.value,
    //   // customerName: this.form.customerName.value,
    //   subject: this.form.subject.value,
    //   // name: this.form.name.value,
    //   body: `data:text/html;base64,${base64}`,
    //   inviteType: this.inviteType,
    //   tinyUrl: this.tinyUrl
    // }
    const postData = this.generateBatchEmails(this.form.customerEmail.value)

    
    this.httpClient.post<any>(environment.postmark.email, postData, { headers }).subscribe(
      (res) => {
        if (res && res[0].ErrorCode==0)
          this.activeModal.close(1);
        else {
          Swal.fire({
            icon: 'error',
            title: 'Sending Email Failed',
            text: res[0].Message,
            confirmButtonColor: '#3085d6',
          });
        }
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Sending Email Failed',
          text: 'There was an error sending your invite email. Try again.',
          confirmButtonColor: '#3085d6',
        });
        console.log(error);
      }
    );
  }

  closeModal() {
    this.activeModal.close();
  }

  markFormGroupTouched(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  errorCustomerEmail = '';
  onAddEmail($event){
		console.log($event.value)
    this.errorCustomerEmail = '';

    if(!this.validateEmail($event.value)) {
      console.log('asdfsafsdaf')
      this.errorCustomerEmail = '* Email is not valid.';
      this.inviteForm.value.customerEmail.pop();
    }
	}

  validateEmail(email) {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };
}
