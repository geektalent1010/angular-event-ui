import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { API_URL, API_URL2 } from 'src/app/services/url/url';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PWChangeValidators } from '../shared/validators/registerValidators';
import { ToastService } from '../services/toast/toast.service';
import { ReportService } from '../services/report.service';

var headers = new HttpHeaders()
  .set('content-type', 'application/json')
  .set('Access-Control-Allow-Headers', 'Content-Type')
  .set('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS')
  .set('Access-Control-Allow-Origin', '*');

const RESET_PASSWORD_API = API_URL2 + '/csi/event/services/usersV2/lostPassVerify';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  isLoading: Boolean;
  isValid: Boolean;

  verifyCode: String;

  errorMessage: String;

  resetPasswordForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private httpClient: HttpClient,
    private fb: FormBuilder,
    public toastService: ToastService,
    private reportService: ReportService
  ) {

    if (localStorage.getItem("Authorization")) {
      headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Access-Control-Allow-Headers', 'Content-Type')
      .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .set('Access-Control-Allow-Origin', '*')
      .set('Authorization', localStorage.getItem("Authorization"));
    }

    this.resetPasswordForm= this.fb.group({
      password: new FormControl("", [Validators.required, Validators.minLength(6)]),
      confirm: new FormControl("", [Validators.required, Validators.minLength(6)]),
    }, {
      validator: PWChangeValidators.newMatchesConfirm,
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.verifyCode = params.get('code');
      this.isValid = true;
    });
  }

  get lf() {
    return this.resetPasswordForm.controls;
  }

  resetPassword() {
    if (this.resetPasswordForm.valid) {
      const resetData: any = this.resetPasswordForm.value;
      const data = {
        resetCode: this.verifyCode,
        password: resetData?.password
      };

      this.httpClient.post<any>(RESET_PASSWORD_API, data, { headers: headers }).subscribe(res => {
        if (res?.statusCode === 200 && res.statusMessage === "Success") {
          const reportUserId: string = localStorage.getItem("reportUserId");
          this.reportService.changePassword(reportUserId, data.password).subscribe(() => {
            this.toastService.show('Password reset successfully!', {
              delay: 6000,
              classname: 'bg-success text-light',
              headertext: 'Reset Password',
              autohide: true,
            });
            this.router.navigate(['/']);
          }, (err: HttpErrorResponse) => {
            console.error(err);
            this.errorMessage = 'Something went wrong, plesae try again!';
            this.toastService.show("Something went wrong, plesae try again!", {
              delay: 6000,
              classname: 'bg-warning text-light',
              headertext: 'Reset Password',
              autohide: true,
            });
          });
        } else {
          this.errorMessage = 'Something went wrong, plesae try again!';
          this.toastService.show("Something went wrong, plesae try again!", {
            delay: 6000,
            classname: 'bg-warning text-light',
            headertext: 'Reset Password',
            autohide: true,
          });
        }
      });
    }
  }

  password_show_hide(id: string) {
    var x: any = document.getElementById(id);
    var show_eye = document.getElementById(id + "_show_eye");
    var hide_eye = document.getElementById(id + "_hide_eye");
    if (x) {
      hide_eye.classList.remove("d-none");
      if (x.type === "password") {
        x.type = "text";
        show_eye.style.display = "none";
        hide_eye.style.display = "block";
      } else {
        x.type = "password";
        show_eye.style.display = "block";
        hide_eye.style.display = "none";
      }
    }
  }
}
