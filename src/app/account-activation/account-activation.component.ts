import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication/authentication';
import { ReportService, ReportUserData } from '../services/report.service';
import { ToastService } from '../services/toast/toast.service';
import { API_URL2 } from '../services/url/url';

@Component({
  selector: 'app-account-activation',
  templateUrl: './account-activation.component.html',
  styleUrls: ['./account-activation.component.scss']
})
export class AccountActivationComponent implements OnInit {
  isLoading: boolean = true;
  isSuccess: boolean = false;
  code: string = "";
  username: string = "";

  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private router: Router,
    public authenticationService: AuthenticationService,
    private reportService: ReportService,
    private toastService: ToastService
  ) {
    this.code = this.route.snapshot.paramMap.get('code');
  }

  ngOnInit(): void {
    this.activate();
  }

  activate() {
    const ACTIVATION_API: string = API_URL2 + `/csi/event/services/usersV2/systemUserVerification?verifyCode=${this.code}`;
    var headers= new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Access-Control-Allow-Headers', 'Content-Type')
      .set('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS')
      .set('Access-Control-Allow-Origin', '*');

    if (localStorage.getItem("Authorization")) {
      headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Access-Control-Allow-Headers', 'Content-Type')
      .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .set('Access-Control-Allow-Origin', '*')
      .set('Authorization', localStorage.getItem("Authorization"));
    }

    this.httpClient.get(ACTIVATION_API, { headers }).subscribe((activateRes: any) => {
      console.error("Activate Response: ", activateRes);
      this.isLoading = false;
      if (activateRes?.response?.activeFlag) {
        this.isSuccess = true;
        const user = activateRes?.response;
        if (user) {
          localStorage.setItem('userId', user.userId);
          localStorage.setItem('attendeeUid', user.attendeeUid);
          localStorage.setItem('emailAddr', user.emailAddr);
          localStorage.setItem('firstName', user.nameFirst || "");
          localStorage.setItem('nameLast', user.nameLast);
          localStorage.setItem('canCreateEvent', user.cancreateevent);
          localStorage.setItem('activeFlag', user.activeFlag);
          localStorage.setItem('username', user.username);
          localStorage.setItem('reportUserId', user.telerikid);
          localStorage.setItem('encryptedpassword', user.encryptedpassword);
          localStorage.setItem('loggedIn', 'true');
          localStorage.setItem('activeUser', 'true');
          if (user?.telerikUserToken) {
            localStorage.setItem("TelerikReportUserToken", user.telerikUserToken);
          }
          this.username = user.username;
          const userTypeCode = user.userTypeCode;
          this.authenticationService.setLoggedInStatus(true);
          // redirect to users page
          if (userTypeCode === 'EX') {
            this.router.navigate([
              '/exhibitor/' + localStorage.getItem('attendeeUid')
            ]);
          } else {
            this.router.navigate([
              '/attendees/' + localStorage.getItem('attendeeUid')
            ]);
          }
        }
      } else {
        const str = activateRes?.response?.statusMessage
        this.isSuccess = false;
        this.toastService.show(str, {
          delay: 6000,
          classname: 'bg-danger text-light',
          headertext: 'Error',
          autohide: true,
        });
      }
    }, (err: HttpErrorResponse) => {
      console.error(err);
      this.isLoading = false;
      this.isSuccess = false;
    });
  }
}
