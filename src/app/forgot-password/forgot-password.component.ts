import { Component, OnInit } from '@angular/core';
import { API_URL, API_URL2 } from 'src/app/services/url/url';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';

var headers = new HttpHeaders()
  .set('content-type', 'application/json')
  .set('Access-Control-Allow-Headers', 'Content-Type')
  .set('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS')
  .set('Access-Control-Allow-Origin', '*');
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  infoMessage: String;
  isSuccess: Boolean;
  forgotPwForm: FormGroup = new FormGroup({
    emailaddress: new FormControl("", [Validators.required, Validators.email])
  });

  constructor(private httpClient: HttpClient) {

    if (localStorage.getItem("Authorization")) {
      headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Access-Control-Allow-Headers', 'Content-Type')
      .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .set('Access-Control-Allow-Origin', '*')
      .set('Authorization', localStorage.getItem("Authorization"));
    }

  }

  ngOnInit(): void {}

  get lf() {
    return this.forgotPwForm.controls;
  }

  public submit() {
    const LOST_PASSWORD_API = API_URL2 + '/csi/event/services/usersV2/lostPass';
    if (this.forgotPwForm.valid) {
      this.httpClient
        .post<any>(
          LOST_PASSWORD_API,
          {
            emailAddr: this.forgotPwForm.value.emailaddress,
            environment: window.location.hostname.includes("test") ? "test" : "prod"
          },
          { headers: headers }
        )
        .subscribe(res => {
          console.log('forgot password', res);
          if (res.statusCode === 200) {
            this.infoMessage = 'We sent an email to you, please check your email';
            this.isSuccess = true;
          } else {
            this.infoMessage = res?.response?.statusMessage || 'Something went wrong, please try again!';
            this.isSuccess = false;
          }
          console.log('message', this.infoMessage, this.isSuccess);
        });
    } else {
      if (this.lf["emailaddress"].errors.required) {
        this.infoMessage = 'Please input the email.';
        this.isSuccess = false;
      }

      if (this.lf["emailaddress"].errors.email) {
        this.infoMessage = 'Invalid email.';
        this.isSuccess = false;
      }
    }
  }
}
