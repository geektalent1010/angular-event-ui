import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
// import { ReCaptchaV3Service } from 'ng-recaptcha/lib/recaptcha-v3.service';
// import { ReCaptchaV3Service } from 'ng-recaptcha';
import { AuthenticationService } from '../services/authentication/authentication';
import { ToastService } from '../services/toast/toast.service';
import { API_URL2 } from '../services/url/url';
import { ThemeService } from 'src/app/services/theme/theme.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {
  loginForm: FormGroup = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });
  loginError: any = null;
  recaptchaToken: string = null;
  recaptchaNotChecked: boolean = false;
  recaptchSiteKey: string = environment.recaptcha.siteKey;
  logout: boolean = false;

  constructor(
    public authenticationService: AuthenticationService,
    private httpClient: HttpClient,
    public toastService: ToastService,
    private router: Router,
    private themeService: ThemeService
  ) // private recaptchaV3Service: ReCaptchaV3Service
  {
    this.logout = localStorage.getItem('logout') === 'true';
  }

  ngOnInit(): void {
    if (localStorage.getItem('loggedIn') === 'true') {
      this.router.navigateByUrl('/');
    }
  }

  get lf() {
    return this.loginForm.controls;
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

  login() {
    let activeSession = localStorage.getItem('attendeeUid');
    if (activeSession !== null) {
      this.authenticationService.setLoggedInStatus(true);
    } else {
      this.authenticationService.setLoggedInStatus(false);
    }

    let returnCode;
    let usernameVal = this.lf.username.value;
    let passwordVal = this.lf.password.value;

    // if (!this.recaptchaToken) {
    //   this.recaptchaNotChecked = true;
    // } else
    if (typeof usernameVal === 'undefined' || !passwordVal) {
      return false;
    } else {
      this.recaptchaNotChecked = false;
      // this.recaptchaV3Service.execute('importantAction')
      // .subscribe((token: string) => {
      //   console.log(`Token [${token}] generated`);
      // });
      // return false;
      localStorage.setItem('username', String(usernameVal));
      localStorage.setItem('password', String(passwordVal));
      const env: string = window.location.hostname.includes('test')
        ? 'test'
        : 'prod';
      var LOGIN_API = `${API_URL2}/csi/event/services/usersV2/getUserLogin?username=${usernameVal}&password=${passwordVal}&environment=${env}`;
      this.httpClient
        .get(LOGIN_API, { observe: 'response' })
        .subscribe((data: any) => {
          returnCode = data?.['body']?.['statusCode'];
          let errorMessage: string = 'Username and/or Password not found';
          if (returnCode === 200) {
            this.loginError = null;
            if (data?.['body']['response']?.telerikUserToken) {
              localStorage.setItem(
                'TelerikReportUserToken',
                data['response']?.telerikUserToken
              );
            }
            if (data?.['headers'].get('Authorization')) {
              console.log(data?.['headers'].get('Authorization'));
              localStorage.setItem(
                'Authorization',
                data?.['headers'].get('Authorization')
              );
            }
            if (data?.['body']['response']['user']) {
              /** Save the user info to localStorage */
              localStorage.setItem(
                'userId',
                data?.['body']['response']['user']['userid']
              );
              localStorage.setItem(
                'attendeeUid',
                data?.['body']['response']['user']['attendeeuid']
              );
              localStorage.setItem(
                'emailAddr',
                data?.['body']['response']['user']['emailaddr']
              );
              localStorage.setItem(
                'firstName',
                data?.['body']['response']['user']['namefirst'] || ''
              );
              localStorage.setItem(
                'nameLast',
                data?.['body']['response']['user']['namelast']
              );
              localStorage.setItem(
                'canCreateEvent',
                data?.['body']['response']['user']['cancreateevent']
              );
              localStorage.setItem(
                'activeFlag',
                data?.['body']['response']['user']['activeflag']
              );
              localStorage.setItem(
                'username',
                data?.['body']['response']['user']['username']
              );
              localStorage.setItem(
                'reportUserId',
                data?.['body']['response']['user']['telerikid']
              );
              if (data?.['body']['response']['user']['telerikid']) {
                localStorage.setItem(
                  'encryptedpassword',
                  data?.['body']['response']['user']['encryptedpassword']
                );
              }
              localStorage.setItem('loggedIn', 'true');
              localStorage.setItem('activeUser', 'true');

              this.authenticationService.setLoggedInStatus(true);
              const userTypeCode: string =
                data?.['body']['response']['user']['userTypeCode'];

              // theme check
              if (data?.['body']['response']['user']['darkmode']) {
                localStorage.setItem(
                  'mode',
                  data?.['body']['response']['user']['darkmode']
                );
                this.themeService.setDarkTheme(
                  data?.['body']['response']['user']['darkmode'] == 'true'
                    ? true
                    : false
                );
              }
              // let GET_THEME_API = `${API_URL2}/csi/event/services/registerV2/getDarkModeStatus?email=${data?.['body']['response']['user']['emailaddr']}`;
              // let headers = new HttpHeaders()
              // .set('content-type', 'application/json')
              // .set('Access-Control-Allow-Headers', 'Content-Type')
              // .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
              // .set('Access-Control-Allow-Origin', '*')
              // .set('Authorization', data?.['headers'].get('Authorization'));

              // this.httpClient.get(GET_THEME_API, {headers: headers, observe: 'response'}).subscribe((data: any) => {
              //   if (data?.['body']?.['statusCode'] === 200) {
              //     if (data?.['body']?.['response']?.['darkModeStatus']) {
              //       localStorage.setItem("mode", data?.['body']?.['response']?.['darkModeStatus']);
              //       this.themeService.setDarkTheme(data?.['body']?.['response']?.['darkModeStatus']=='true'? true: false);
              //     }
              //   }
              // });

              this.toastService.show('You logged in the system successfully.', {
                delay: 8000,
                classname: 'bg-success text-light',
                headertext: 'Login Success',
                autohide: true,
              });

              // redirect to users page
              if (userTypeCode === 'EX') {
                // this.router.navigate([
                //   '/exhibitor/' + localStorage.getItem('attendeeUid')
                // ]);
                this.router.navigate(['/']);
              } else {
                // this.router.navigate([
                //   '/attendees/' + localStorage.getItem('attendeeUid')
                // ]);
                this.router.navigate(['/']);
              }
            } else {
              this.loginError = 'Failed';
              this.toastService.show(errorMessage, {
                delay: 8000,
                classname: 'bg-danger text-light',
                headertext: 'Login Failed',
                autohide: true,
              });
            }
          } else {
            if (data?.response?.error) errorMessage = data?.response?.error;
            this.loginError = errorMessage;
            this.toastService.show(errorMessage, {
              delay: 8000,
              classname: 'bg-danger text-light',
              headertext: 'Login Failed',
              autohide: true,
            });
          }
        });
    }
  }

  forgotPassword() {
    this.router.navigateByUrl('/forgotpassword');
  }

  createAccount() {
    this.router.navigateByUrl('/signup');
  }

  resolved(captchaResponse: string) {
    console.log(`Resolved captcha with response: ${captchaResponse}`);
    this.recaptchaToken = captchaResponse;
  }
}
