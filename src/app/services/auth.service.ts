import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
// import { KeycloakEventType, KeycloakService } from 'keycloak-angular';
import { setTime } from 'ngx-bootstrap/chronos/utils/date-setters';
import { BehaviorSubject } from 'rxjs-compat';
import { environment } from 'src/environments/environment';
import { MyKeycloakService } from './my-keycloak.service';
import { API_URL2 } from './url/url';

export interface ProfileData {
  attributes: Object
  email: string,
  emailVerified: boolean,
  firstName: string,
  id: string,
  lastName: string,
  userProfileMetadata: {
    attributes: any[]
  }
  username: string,
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  profile: BehaviorSubject<ProfileData> = new BehaviorSubject<ProfileData>(null);

  constructor(
    // private keycloak: KeycloakService,
    private router: Router,
    private myKeycloak: MyKeycloakService,
    private http: HttpClient
  ) {
    // keycloak.keycloakEvents$.subscribe({
    //   next: e => {
    //     if (e.type == KeycloakEventType.OnTokenExpired) {
    //       keycloak.updateToken(20);
    //     }
    //   }
    // });
    this.getToken();
  }

  async getToken() {
    // this.keycloak.loadUserProfile(true).then((profile: ProfileData) => {
    //   console.log("Keycloak user profile: ", profile);
    //   this.profile.next(profile);
    //   localStorage.setItem('userId', profile.id);
    //   // localStorage.setItem('attendeeUid', profile.id);
    //   localStorage.setItem('emailAddr', profile.email);
    //   localStorage.setItem('firstName', profile.firstName);
    //   localStorage.setItem('nameLast', profile.lastName);
    //   localStorage.setItem('activeFlag', 'true');
    //   localStorage.setItem('username', profile.username);
    //   localStorage.setItem('loggedIn', 'true');
    //   localStorage.setItem('activeUser', 'true');
    //   this.getAttendeeUid(profile.id);
    // });
    // const token = localStorage.getItem("userToken");
    // this.isLoggedIn.next(!!token);
    // this.keycloak.getToken().
    //   then((token) => {
    //     localStorage.setItem("userToken", token);
    //     this.isLoggedIn.next(true);
    //   })
    //   .catch(err => {
    //     console.error(err);
    //     const token = localStorage.getItem("userToken");
    //     this.isLoggedIn.next(!!token);
    //   });
  }

  getAttendeeUid(keyclockId: string) {
    this.http.get(`/apiv2/csi/event/services/registerV2/getAttendeeUid?keycloakId=${keyclockId}`).subscribe((res: any) => {
      console.error("res: ", res);
      localStorage.setItem("attendeeUid", res?.response?.AttendeeUid)
    }, (err: HttpErrorResponse) => {
      console.error(err);
    });
  }

  async login() {
    // await this.keycloak.login();
    // this.getToken();
  }

  async register() {
    // await this.keycloak.register();
    // this.getToken();
  }

  async logout() {
    // this.myKeycloak.logout(this.profile.value.id).subscribe(() =>{
      localStorage.clear();
      this.isLoggedIn.next(false);
    // }, (err: any) => {
    //   console.error(err);
    // })
    // this.keycloak.clearToken();
    // await this.keycloak.logout(environment.baseURL);
  }
}
