import { Component, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/services/authentication/authentication';
import { API_URL, API_URL2 } from 'src/app/services/url/url';
import { AuthService, ProfileData } from 'src/app/services/auth.service';
import { ReportService, ReportUserData } from 'src/app/services/report.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ThemeService } from 'src/app/services/theme/theme.service';

var headers = new HttpHeaders()
  .set('content-type', 'application/json')
  .set('Access-Control-Allow-Headers', 'Content-Type')
  .set('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS')
  .set('Access-Control-Allow-Origin', '*');

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  title = 'appBootstrap';
  userInfo = [];
  firstName = '';
  loggedIn: boolean = false;
  username: String;
  password: String;
  attendeeUid: string;
  closeResult: string;
  private REST_API_SERVER = API_URL2 + '/csi/event/services/usersV2/getUserLogin?username=devUser11&password=password';
  userTypeCode: string;
  isLoggedIn: boolean = false;
  userProfile: ProfileData;
  showHomeIcon: boolean = true;

  constructor(
    public authenticationService: AuthenticationService,
    private modalService: NgbModal,
    private httpClient: HttpClient,
    private router: Router,
    public auth: AuthService,
    private reportService: ReportService,
    public toastService: ToastService,
    private activatedRoute: ActivatedRoute,
    private themeService: ThemeService,
  ) {
    if (localStorage.getItem("Authorization")) {
      headers = new HttpHeaders()
        .set('content-type', 'application/json')
        .set('Access-Control-Allow-Headers', 'Content-Type')
        .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        .set('Access-Control-Allow-Origin', '*')
        .set('Authorization', localStorage.getItem("Authorization"));
    }

    router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: any) =>
      {
        if (event.url !== "/") this.showHomeIcon = true;
        else this.showHomeIcon = false;
      }
    );
  }

  ngOnInit(): void {
    const mode: string = localStorage.getItem("mode");
    this.themeService.setDarkTheme(localStorage.getItem("Authorization") && mode=='true'? true: false);

    this.authenticationService.loggedIn.subscribe((loggedIn: boolean) => {
      if (this.loggedIn !== loggedIn) {
        this.loggedIn = loggedIn;
        const username = localStorage.getItem("username");
        if (username && username !== 'null') {
          this.username = username;
        } else {
          this.username = "";
        }
      }
    });

    this.auth.profile.subscribe((profile: ProfileData) => this.userProfile = profile);
    // make sure they are verified or on the signup or verification page
    // or redirect them to the sign up page
    if (localStorage.getItem('activeFlag') != 'true') {
      if (window.location.href.indexOf('signup') > -1) {
        console.log('Sign Up Page');
      } else if (window.location.href.indexOf('verification') > -1) {
        console.log('verification page');
      } else {
        //window.location.href='/';
      }
    } else {
    }

    // check if user has attendeeUid session already set, if so display their info bar
    let activeSession = localStorage.getItem('attendeeUid');
    if (activeSession !== null) {
      this.userTypeCode = localStorage.getItem('userTypeCode');
    } else {
      this.authenticationService.setLoggedInStatus(false);
      this.loggedIn = false;
    }
    this.attendeeUid = localStorage.getItem('attendeeUid');
    this.runAuth();
    this.auth.isLoggedIn.subscribe((isLoggedIn: boolean) => {
      this.isLoggedIn = isLoggedIn
    });
  }

  open(content) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        result => {
          this.closeResult = `Closed with: ${result}`;
        },
        reason => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  public userLogOut() {
    // this.auth.logout();
    var LOGOUT_API =
    API_URL2 +
      '/csi/event/services/usersV2/userLogout?attendeeUid=' +
      localStorage.getItem('attendeeUid');

    console.log(LOGOUT_API);

    this.httpClient.get(LOGOUT_API, { headers }).subscribe((data: any) => {
      if (data?.response?.Error != undefined) {
        console.log('Error: ' + data?.response?.Error);
      }
    });

    //Update localStorage info to be cleared otu
    localStorage.clear();
    this.username = '';
    this.authenticationService.setLoggedInStatus(false);
    this.loggedIn = false;
    // redirect user to home
    this.router.navigateByUrl("/login")
    // window.location.href = '/login';
    localStorage.setItem("logout", "true");

    this.themeService.setDarkTheme(false);
  }

  runAuth() {
    let activeSession = localStorage.getItem('attendeeUid');
    if (activeSession !== null) {
      this.authenticationService.setLoggedInStatus(true);
      this.loggedIn = true;
      this.username = localStorage.getItem('username');
    } else {
      this.authenticationService.setLoggedInStatus(false);
      this.loggedIn = false;
    }

    let returnCode;
    let usernameVal = this.username;
    let passwordVal = this.password;

    if (typeof usernameVal === 'undefined' || !passwordVal) {
      return false;
    } else {
      localStorage.setItem('username', String(this.username));
      localStorage.setItem('password', String(this.password));
      const env: string = window.location.hostname.includes("test") ? "test" : "prod";
      var LOGIN_API = `${API_URL2}/csi/event/services/usersV2/getUserLogin?username=${usernameVal}&password=${passwordVal}&environment=${env}`;
      this.httpClient.get(LOGIN_API, {observe: 'response'}).subscribe((data: any) => {
        returnCode = data?.['body']['statusCode'];
        let errorMessage: string = 'Username and/or Password not found';
        if (returnCode === 200) {
          if (data?.['body']["response"]?.telerikUserToken) {
            localStorage.setItem("TelerikReportUserToken", data["response"]?.telerikUserToken);
          }
          if(data?.['headers'].get('Authorization')) {
            console.log(data?.['headers'].get('Authorization'))
            localStorage.setItem("Authorization", data?.['headers'].get('Authorization'));
          }
          if (data?.['body']['response']['user']) {
            /** Save the user info to localStorage */
            localStorage.setItem('userId', data?.['body']['response']['user']['userid']);
            localStorage.setItem('attendeeUid', data?.['body']['response']['user']['attendeeuid']);
            localStorage.setItem('emailAddr', data?.['body']['response']['user']['emailaddr']);
            // localStorage.setItem('userTypeCode', data?.['body']['response']['user']['userTypeCode']);
            localStorage.setItem('firstName', data?.['body']['response']['user']['namefirst'] || "");
            localStorage.setItem('nameLast', data?.['body']['response']['user']['namelast']);
            // localStorage.setItem('addUserid', data['response']['user']['addUserid']);
            // localStorage.setItem('clientId', data['response']['user']['clientId']);
            localStorage.setItem('canCreateEvent', data?.['body']['response']['user']['cancreateevent']);
            localStorage.setItem('activeFlag', data?.['body']['response']['user']['activeflag']);
            localStorage.setItem('username', data?.['body']['response']['user']['username']);
            localStorage.setItem('reportUserId', data?.['body']['response']['user']['telerikid']);
            if (data?.['body']['response']['user']['telerikid']) {
              localStorage.setItem('encryptedpassword', data?.['body']['response']['user']['encryptedpassword']);
            }
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('activeUser', 'true');

            this.firstName = data?.['body']['response']['user']['namefirst'] || "";
            this.username = data?.['body']['response']['user']['username'];
            this.authenticationService.setLoggedInStatus(true);
            this.loggedIn = true;
            this.userTypeCode = data?.['body']['response']['user']['userTypeCode'];

            this.toastService.show("You logged in the system successfully.", {
              delay: 8000,
              classname: 'bg-success text-light',
              headertext: 'Login Success',
              autohide: true,
            });

            this.modalService.dismissAll();

            // redirect to users page
            if (this.userTypeCode === 'EX') {
              this.router.navigate([
                '/exhibitor/' + localStorage.getItem('attendeeUid')
              ]);
            } else {
              this.router.navigate([
                '/attendees/' + localStorage.getItem('attendeeUid')
              ]);
            }
          } else {
            this.toastService.show(errorMessage, {
              delay: 8000,
              classname: 'bg-danger text-light',
              headertext: 'Login Failed',
              autohide: true,
            });
          }
        } else {
          if (data?.response?.error) errorMessage = data?.response?.error;
          this.toastService.show(errorMessage, {
            delay: 8000,
            classname: 'bg-danger text-light',
            headertext: 'Login Failed',
            autohide: true,
          });
        }
      });
    }
    return this.loggedIn;
  }

  onProfileClick() {
    if (this.userTypeCode && this.userTypeCode === 'EX') {
      this.router.navigate([
        '/exhibitor/' + localStorage.getItem('attendeeUid')
      ]);
    } else {
      this.router.navigate([
        '/attendees/' + localStorage.getItem('attendeeUid')
      ]);
    }
  }

  login() {
    this.auth.login();
  }

  register() {
    this.auth.register();
  }
}
