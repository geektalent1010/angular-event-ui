import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_URL, API_URL2 } from 'src/app/services/url/url';
import { AuthService } from 'src/app/services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ReportService, ReportUserData } from 'src/app/services/report.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { PWChangeValidators } from 'src/app/shared/validators/registerValidators';
import { Observable, of } from 'rxjs';
import {
  debounceTime,
  defaultIfEmpty,
  delay,
  distinctUntilChanged,
  map,
  startWith,
} from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ThemeService } from 'src/app/services/theme/theme.service';

var headers = new HttpHeaders()
  .set('content-type', 'application/json')
  .set('Access-Control-Allow-Origin', '*')
  .set(
    'Access-Control-Allow-Headers',
    'origin, content-type, accept, authorization'
  )
  .set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD')
  .set('Access-Control-Allow-Credentials', 'true');

interface AccountInfo {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phone: string;
  company: string;
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  usernameVerified: string;
  usernameVerifiedColor: string;
  loggedIn: string;
  photoVerified: string;
  photoURL: String;
  API_CREATE_USER = API_URL2 + '/csi/event/services/usersV2/addUser';
  API_GET_ACCOUNT = API_URL2 + '/csi/event/services/registerV2/updateAccount';
  API_UPDATE_ACCOUNT =
    API_URL2 + '/csi/event/services/registerV2/updateAccount';
  API_SET_THEME = API_URL2 + '/csi/event/services/registerV2/setDarkMode';
  addUserId: string;
  recommendedAddUserId: string;
  errorMessageText: string;
  digitalWalletID: String;
  errorCode = null;
  alreadyExists: boolean = null;

  interestSubCat: String;
  topics: String;

  formVars: object;
  loading: boolean = false;
  registerForm: FormGroup;
  reportRoles: any[] = [];

  focusUsername: boolean = false;
  pageType: string = 'signup';
  isEdit: boolean = false;
  unamePattern = '^[a-z0-9_-]{8,15}$';

  accountInfo: AccountInfo = null;
  modeControl: FormControl = new FormControl(false, Validators.required);
  sessionControl: FormControl = new FormControl(false, Validators.required);
  usernameValidatorEmit: Subject<boolean> = new Subject();
  emailValidatorEmit: Subject<boolean> = new Subject();

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private auth: AuthService,
    private spinner: NgxSpinnerService,
    private reportService: ReportService,
    public toastService: ToastService,
    private fb: FormBuilder,
    private themeService: ThemeService
  ) {
    if (localStorage.getItem('Authorization')) {
      headers = new HttpHeaders()
        .set('content-type', 'application/json')
        .set('Access-Control-Allow-Headers', 'Content-Type')
        .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        .set('Access-Control-Allow-Origin', '*')
        .set('Authorization', localStorage.getItem('Authorization'));
    }

    this.registerForm = this.fb.group(
      {
        firstName: new FormControl('', Validators.required),
        nameLast: new FormControl('', Validators.required),
        username: new FormControl(
          '',
          [Validators.required, Validators.pattern(this.unamePattern)],
          [this.usernameExistingValidator()]
        ),
        empEmail: new FormControl(
          '',
          [Validators.email, Validators.required],
          [this.emailExistingValidator()]
        ),
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(6),
        ]),
        confirm: new FormControl('', [
          Validators.required,
          Validators.minLength(6),
        ]),
        userPhoneNbr: new FormControl('', Validators.required),
        orgId: new FormControl('', Validators.required),
      },
      {
        validator: PWChangeValidators.newMatchesConfirm,
      }
    );

    const mode: string = localStorage.getItem('mode');
    if (mode === 'true') this.modeControl.setValue(true);
    else if (mode === 'false') this.modeControl.setValue(false);
    const session: string = localStorage.getItem('session');
    if (session === 'true') this.sessionControl.setValue(true);
    else if (session === 'false') this.sessionControl.setValue(false);
  }

  ngOnInit(): void {
    this.addUserId = null;
    this.recommendedAddUserId = null;

    if (this.router.url === '/account') {
      this.pageType = 'account';
      this.getAccountInfo();
    }

    this.lf['firstName'].valueChanges.subscribe((firstName: string) => {
      if (this.lf.firstName.value && this.lf.nameLast.value) {
        this.resetRecommendedAddUserId();
      }
    });
    this.lf['nameLast'].valueChanges.subscribe((nameLast: string) => {
      if (this.lf.firstName.value && this.lf.nameLast.value) {
        this.resetRecommendedAddUserId();
      }
    });
    if (this.pageType === 'account') {
      this.lf['username'].valueChanges
        .pipe(debounceTime(300), defaultIfEmpty())
        .subscribe((username: string) => {
          this.usernameValidatorEmit.next(
            username !== this.accountInfo.username
          );
        });
      this.lf['empEmail'].valueChanges.subscribe((empEmail: string) => {
        this.emailValidatorEmit.next(empEmail !== this.accountInfo.email);
      });
      this.usernameValidatorEmit.next(true);
      this.usernameValidatorEmit
        .pipe(distinctUntilChanged())
        .subscribe((value: boolean) => {
          if (value) {
            this.lf['username'].setAsyncValidators([
              this.usernameExistingValidator(),
            ]);
            this.lf['username'].updateValueAndValidity();
          } else {
            this.lf['username'].clearAsyncValidators();
            this.lf['username'].updateValueAndValidity();
          }
        });
      this.emailValidatorEmit.next(true);
      this.emailValidatorEmit
        .pipe(distinctUntilChanged())
        .subscribe((value: boolean) => {
          if (value) {
            this.lf['empEmail'].setAsyncValidators([
              this.emailExistingValidator(),
            ]);
            this.lf['empEmail'].updateValueAndValidity();
          } else {
            this.lf['empEmail'].clearAsyncValidators();
            this.lf['empEmail'].updateValueAndValidity();
          }
        });
    }

    /** Get telerik Roles */
    // this.getRoles();

    this.modeControl.valueChanges.subscribe((mode: boolean) => {
      localStorage.setItem('mode', JSON.stringify(mode));
    });
    this.sessionControl.valueChanges.subscribe((session: boolean) => {
      localStorage.setItem('session', JSON.stringify(session));
    });
  }

  getAccountInfo() {
    const userId: string = localStorage.getItem('userId');
    this.spinner.show('pageLoading', { bdColor: '#007497', size: 'medium' });

    this.httpClient
      .get(this.API_GET_ACCOUNT + '?userId=' + userId, { headers })
      .subscribe(
        (res: any) => {
          if (res.statusMessage === 'Success') {
            this.accountInfo = {
              ...res.response?.accountInfo,
              password: localStorage.getItem('password') || '',
            };
          } else {
            this.accountInfo = {
              firstName: localStorage.getItem('firstName'),
              lastName: localStorage.getItem('nameLast'),
              username: localStorage.getItem('username'),
              email: localStorage.getItem('emailAddr'),
              password: '',
              phone: '',
              company: '',
            };
          }
          this.spinner.hide('pageLoading');
        },
        (error: HttpErrorResponse) => {
          console.error('Get Account Info API Failed: ', error);
          this.spinner.hide('pageLoading');
          this.accountInfo = {
            firstName: localStorage.getItem('firstName'),
            lastName: localStorage.getItem('nameLast'),
            username: localStorage.getItem('username'),
            email: localStorage.getItem('emailAddr'),
            password: '',
            phone: '',
            company: '',
          };
        }
      );
  }

  onFocusUsername() {
    this.focusUsername = true;
  }

  emailExistingValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const EXIST_CHECK_API: string =
        API_URL2 +
        `/csi/event/services/registerV2/checkUsernameOrEmail?type=${'email'}&value=${
          control.value
        }`;
      return this.httpClient.get<any>(EXIST_CHECK_API, { headers }).pipe(
        defaultIfEmpty(),
        debounceTime(1000),
        map((res) => {
          return res?.response?.isExist ? { exist: true } : null;
        })
      );
    };
  }

  usernameExistingValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const EXIST_CHECK_API: string =
        API_URL2 +
        `/csi/event/services/registerV2/checkUsernameOrEmail?type=${'username'}&value=${
          control.value
        }`;
      return this.httpClient.get<any>(EXIST_CHECK_API, { headers }).pipe(
        defaultIfEmpty(),
        debounceTime(1000),
        map((res) => {
          return res?.response?.isExist ? { exist: true } : null;
        })
      );
    };
  }

  async getRoles() {
    const access_token = await this.reportService.telerkLogin();
    if (access_token) {
      const roleNames: string[] = ['Normal User'];
      this.reportService.getAllRoles().subscribe(
        (res: any[]) => {
          this.reportRoles = res?.filter((role: any) =>
            roleNames.includes(role.Name)
          );
          console.error('getAllRoles: ', res);
        },
        (err: HttpErrorResponse) => {
          console.error(err);
        }
      );
    }
  }

  // createReportUser(user: ReportUserData) {
  //   const roleIds: string[] = this.reportRoles.map((role: any) => role.Id);
  //   user.RoleIds = roleIds;
  //   if (!roleIds) {
  //     user.RoleIds = ["908c7ce14a5"];
  //   }
  //   this.reportService.createUser(user).subscribe((res: any) => {
  //     console.error("create user response: ", res);
  //     this.toastService.show('Thank you, Please follow the link to finish registration.', {
  //       delay: 6000,
  //       classname: 'bg-success text-light',
  //       headertext: 'Registration Success',
  //       autohide: true,
  //     });
  //     this.router.navigateByUrl("/").then(() => {
  //       this.auth.login();
  //     });
  //   }, (err: HttpErrorResponse) => {
  //     console.error(err);
  //     this.toastService.show(err.error.Message, {
  //       delay: 6000,
  //       classname: 'bg-danger text-light',
  //       headertext: 'Error',
  //       autohide: true,
  //     });
  //   });
  // }

  get lf() {
    return this.registerForm.controls;
  }

  resetRecommendedAddUserId() {
    this.recommendedAddUserId =
      this.lf.firstName.value.charAt(0) + this.lf.nameLast.value;

    const regex = new RegExp(this.unamePattern);
    if (!regex.test(this.recommendedAddUserId)) {
      this.recommendedAddUserId = null;
    }
  }

  submit() {
    /** Check the form is valid */
    let valid: boolean = true;
    Object.keys(this.lf).forEach((field: string) => {
      valid = valid && this.lf[field].valid;
      this.lf[field].markAsTouched();
      this.lf[field].updateValueAndValidity();
    });

    if (valid) {
      if (this.pageType === 'signup') {
        this.register();
      } else if (this.pageType === 'account') {
        this.updateAccount();
      }
    }
  }

  register() {
    console.log('run save started');
    const formData: any = this.registerForm.value;
    var myNewUser = {
      addUserid: formData.username,
      nameLast: formData.nameLast,
      tradeShowEvent: 'CES21',
      firstName: formData.firstName,
      nameMi: '',
      empEmail: formData.empEmail,
      password: formData.password,
      userPhoneNbr: formData.userPhoneNbr,
      clientId: 191,
      orgId: formData.orgId,
      environment: window.location.hostname.includes('test') ? 'test' : 'prod',
    };
    this.spinner.show('registrationLoading');
    this.httpClient
      .post<any>(this.API_CREATE_USER, myNewUser, {
        observe: 'response',
        headers: headers,
      })
      .subscribe(
        (data) => {
          console.log(data?.['body']);
          this.spinner.hide('registrationLoading');
          if (data?.['body']['response'].invalidProperty !== undefined) {
            this.errorCode = data?.['body']['response'].invalidProperty;
            return;
          }
          if (data?.['body']['response'].user) {
            console.log('success');

            if (data?.['headers'].get('Authorization')) {
              console.log(data?.['headers'].get('Authorization'));
              localStorage.setItem(
                'Authorization',
                data?.['headers'].get('Authorization')
              );
            }

            this.errorCode = null;
            console.log(data?.['body']);
            var attendeeUid = data?.['body']['response']['user']['attendeeUid'];
            localStorage.setItem('aid', attendeeUid);
            this.toastService.show(
              'Thank you, Please follow the link to finish registration.',
              {
                delay: 6000,
                classname: 'bg-success text-light',
                headertext: 'Registration Success',
                autohide: true,
              }
            );
            this.router.navigateByUrl('/').then(() => {
              this.auth.login();
            });
            return;
          }
          if (data?.['body']['statusCode'] === 400) {
            if (data?.['body']?.response?.Reason) {
              this.toastService.show(data?.['body']?.response?.Reason, {
                delay: 6000,
                classname: 'bg-warning text-light',
                headertext: 'Warning',
                autohide: true,
              });
              this.alreadyExists = false;
            }
            if (data?.['body']['response']['Recommended Username']) {
              this.toastService.show(
                'The username is already existing now. Please reset the password if you are the user.',
                {
                  delay: 6000,
                  classname: 'bg-warning text-light',
                  headertext: 'Warning',
                  autohide: true,
                }
              );
              this.alreadyExists = true;
              return;
            } else if (
              data?.['body']['response']['Message'] ===
              'Email address already exists. Please try again with different Email address'
            ) {
              /** Go to forgot password */
              this.toastService.show(
                'The email is already existing now. Please reset the password if you are the user.',
                {
                  delay: 6000,
                  classname: 'bg-warning text-light',
                  headertext: 'Warning',
                  autohide: true,
                }
              );
              this.alreadyExists = true;
              return;
            }
          }
          if (data?.['body']['response']['Message']) {
            this.toastService.show(data?.['body']['response']['Message'], {
              delay: 6000,
              classname: 'bg-danger text-light',
              headertext: 'Error',
              autohide: true,
            });
            this.alreadyExists = false;
          }
        },
        (err: HttpErrorResponse) => {
          console.error(err);
          this.toastService.show(
            err?.error?.Message || 'Something went wrong, please try again',
            {
              delay: 6000,
              classname: 'bg-danger text-light',
              headertext: 'Error',
              autohide: true,
            }
          );
          this.alreadyExists = false;
          this.spinner.hide('registrationLoading');
        }
      );
  }

  updateAccount() {
    const formData: any = this.registerForm.value;
    var accountInfo: AccountInfo = {
      firstName: formData.firstName,
      lastName: formData.nameLast,
      username: formData.username,
      email: formData.empEmail,
      password: formData.password,
      phone: formData.userPhoneNbr,
      company: formData.orgId,
    };

    const isSame: boolean = Object.keys(accountInfo)?.every((key: string) => {
      return accountInfo[key] === this.accountInfo[key];
    });

    if (
      isSame &&
      Object.keys(accountInfo)?.length === Object.keys(this.accountInfo)?.length
    ) {
      this.isEdit = false;
    } else {
      this.spinner.show('registrationLoading');
      const userId: string = localStorage.getItem('userId');
      this.httpClient
        .post<any>(this.API_UPDATE_ACCOUNT + '?userId=' + userId, accountInfo, {
          headers: headers,
        })
        .subscribe(
          (data: any) => {
            this.spinner.hide('registrationLoading');
            if (data.statusMessage === 'Success') {
              this.isEdit = false;
              this.accountInfo = accountInfo;
              this.toastService.show(
                'The account information updated successfully!',
                {
                  delay: 6000,
                  classname: 'bg-success text-light',
                  headertext: 'Registration Success',
                  autohide: true,
                }
              );
            } else {
              this.toastService.show('Something wrong', {
                delay: 6000,
                classname: 'bg-warning text-light',
                headertext: 'Warning',
                autohide: true,
              });
            }
          },
          (err: HttpErrorResponse) => {
            console.error(err);
            this.spinner.hide('registrationLoading');
            this.toastService.show(err?.message || err?.error?.message, {
              delay: 6000,
              classname: 'bg-danger text-light',
              headertext: 'Error',
              autohide: true,
            });
          }
        );
    }
  }

  password_show_hide(id: string) {
    var x: any = document.getElementById(id);
    var show_eye = document.getElementById(id + '_show_eye');
    var hide_eye = document.getElementById(id + '_hide_eye');
    if (x) {
      hide_eye.classList.remove('d-none');
      if (x.type === 'password') {
        x.type = 'text';
        show_eye.style.display = 'none';
        hide_eye.style.display = 'block';
      } else {
        x.type = 'password';
        show_eye.style.display = 'block';
        hide_eye.style.display = 'none';
      }
    }
  }

  goEditMode() {
    this.lf['firstName'].setValue(this.accountInfo?.firstName || '');
    this.lf['nameLast'].setValue(this.accountInfo?.lastName || '');
    this.lf['empEmail'].setValue(this.accountInfo?.email || '');
    this.lf['empEmail'].clearAsyncValidators();
    this.lf['username'].setValue(this.accountInfo?.username || '');
    this.lf['username'].clearAsyncValidators();
    this.lf['password'].setValue(this.accountInfo?.password);
    this.lf['confirm'].setValue(this.accountInfo?.password);
    this.lf['userPhoneNbr'].setValue(this.accountInfo?.phone || '');
    this.lf['orgId'].setValue(this.accountInfo?.company || '');
    this.isEdit = true;
  }

  cancel() {
    this.isEdit = false;
  }

  switchTheme(isDark) {
    const emailAddr: string = localStorage.getItem('emailAddr');
    console.log(headers);

    this.httpClient
      .post<any>(
        `${this.API_SET_THEME}?email=${emailAddr}&darkMode=${isDark}`,
        null,
        { headers: headers }
      )
      .subscribe(
        (data: any) => {
          if (data && data.statusMessage === 'Success') {
            this.themeService.setDarkTheme(isDark);

            this.toastService.show('Updated successfully!', {
              delay: 6000,
              classname: 'bg-success text-light',
              headertext: 'Registration Success',
              autohide: true,
            });
          } else {
            this.toastService.show('Something wrong', {
              delay: 6000,
              classname: 'bg-warning text-light',
              headertext: 'Warning',
              autohide: true,
            });
          }
        },
        (err: HttpErrorResponse) => {
          this.toastService.show(err?.message || err?.error?.message, {
            delay: 6000,
            classname: 'bg-danger text-light',
            headertext: 'Error',
            autohide: true,
          });
        }
      );
  }
}
