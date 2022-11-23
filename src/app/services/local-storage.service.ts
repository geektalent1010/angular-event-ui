import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './authentication/authentication';
import { API_URL2 } from './url/url';

var headers= new HttpHeaders()
.set('content-type', 'application/json')
.set('Access-Control-Allow-Headers', 'Content-Type')
.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
.set('Access-Control-Allow-Origin', '*');

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor(
    private httpClient: HttpClient,
    public authenticationService: AuthenticationService,
    private router: Router
  ) {

    if (localStorage.getItem("Authorization")) {
      headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Access-Control-Allow-Headers', 'Content-Type')
      .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .set('Access-Control-Allow-Origin', '*')
      .set('Authorization', localStorage.getItem("Authorization"));
    }

  }

  set(key: string, value: any) {
    if (key && value) {
      let stringValue: string = "";
      if (typeof value !== "string") {
        stringValue = value;
      } else {
        stringValue = JSON.stringify(value);
      }
      localStorage.setItem(key, stringValue);
    } else {
      console.error("localStorage.setItem needs the key/value pairs.");
    }
  }

  get(key: string) {
    if (key) {
      const value = localStorage.getItem(key);
      if (key === "username" && !value) {
        const attendeeUid = localStorage.getItem('attendeeUid');
        this.removeAll();
        this.authenticationService.setLoggedInStatus(false);
        this.router.navigateByUrl("/");
        var LOGOUT_API = `${API_URL2}/csi/event/services/usersV2/userLogout?attendeeUid=${attendeeUid}`;
        this.httpClient.get(LOGOUT_API, { headers }).subscribe((data: any) => {
          if (data?.response?.Error) {
            console.log('Logout API Error: ' + data?.response?.Error);
          } else {

          }
        });
      }
      return value;
    } else {
      console.error("localStorage.getItem needs the key");
      return null;
    }
  }

  remove(key: string) {
    if (key) {
      localStorage.removeItem(key);
    } else {
      console.error("localStorage.removeItem needs the key");
    }
  }

  removeAll() {
    localStorage.clear();
  }
}
