import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

var serverTokenKey = "TelerikReportServerToken";
var reportTokenKey = "TelerikReportUserToken";

export interface ReportUserData {
  Id?: string,
  Username: string,
  FirstName: string,
  LastName: string,
  Email: string,
  Enabled: boolean,
  RoleIds?: string[],
  Password?: string
};

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  token: string = "";
  reportUserToken: string = "";

  constructor(
    private httpClient: HttpClient
  ) {
    this.reportUserToken = localStorage.getItem(reportTokenKey);
    if (!this.reportUserToken && localStorage.getItem("loggedIn") !== "true") {
      const username: string = localStorage.getItem("username");
      const password: string = localStorage.getItem("password");
      if (username && password) {
        this.reportUserLogin(username, password);
      }
    }

    this.token = localStorage.getItem(serverTokenKey);
    if (!this.token) {
      this.telerkLogin();
    }
  }

  /** Server User: report_user API requests */
  /** Login and get access token */
  telerkLogin() {
    const headers = new HttpHeaders()
      .set('content-type', 'text/plain')
      .set('Access-Control-Allow-Origin', '*')
      .set("Content-Security-Policy", "upgrade-insecure-requests");
    const telerkLoginRequest = `grant_type=password&username=${environment.telerikAuth.username}&password=${environment.telerikAuth.password}`;

    return new Promise((resolve, reject) => {
      this.httpClient.post(environment.telerkServer + "/Token", telerkLoginRequest, { headers }).subscribe((loginRes: any) => {
        if (loginRes?.access_token) {
          this.token = loginRes.access_token;
          window.sessionStorage.setItem(serverTokenKey, loginRes.access_token);
          localStorage.setItem(serverTokenKey, loginRes.access_token);
          resolve(loginRes.access_token);
        } else {
          reject("Failed to get the access token.");
        }
      }, (error: HttpErrorResponse) => {
        reject(error);
      });
    });
  }

  getAllRoles() {
    const headers= new HttpHeaders().set('Authorization', 'Bearer ' + this.token).set('Access-Control-Allow-Origin', '*');
    return this.httpClient.get(environment.telerkServer + "/api/reportserver/v2/userroles", { headers });
  }

  createUser(user: any) {
    const headers= new HttpHeaders()
      .set('Authorization', 'Bearer ' + this.token)
      .set('Access-Control-Allow-Origin', '*')
      .set('Content-Type', 'application/json');
    return this.httpClient.post(environment.telerkServer + `/api/reportserver/v2/users/local`, user, { headers });
  }

  getAllUsers() {
    const headers= new HttpHeaders()
      .set('Authorization', 'Bearer ' + this.token)
      .set('Access-Control-Allow-Origin', '*')
      .set('Content-Type', 'application/json');
    return this.httpClient.get(environment.telerkServer + `/api/reportserver/v2/users`, { headers });
  }

  changePassword(userId: string, newPassword: string) {
    const currentPassword: string = localStorage.getItem("password");
    if (currentPassword) {
      const headers= new HttpHeaders()
        .set('Authorization', 'Bearer ' + this.token)
        .set('Access-Control-Allow-Origin', '*')
        .set('Content-Type', 'application/json');
      const request: any = {
        "CurrentPassword": currentPassword,
        "NewPassword": newPassword
      };
      return this.httpClient.put(environment.telerkServer + `/api/reportserver/v2/users/local/${userId}/password`, request, { headers })
    } else {
      return of(new ErrorEvent('Password missing'));
    }
  }




  /** Report User(sync with EventService postgres sys user) API requests */
  /** Report User Login Request */
  reportUserLogin(username: string, password: string) {
    const headers = new HttpHeaders()
      .set('content-type', 'text/plain')
      .set('Access-Control-Allow-Origin', '*')
      .set("Content-Security-Policy", "upgrade-insecure-requests");
    const reportUserLoginRequest = `grant_type=password&username=${username}&password=${password}`;

    return new Promise((resolve, reject) => {
      this.httpClient.post(environment.telerkServer + "/Token", reportUserLoginRequest, { headers }).subscribe((loginRes: any) => {
        if (loginRes?.access_token) {
          this.reportUserToken = loginRes.access_token;
          window.sessionStorage.setItem(reportTokenKey, loginRes.access_token);
          localStorage.setItem(reportTokenKey, loginRes.access_token);
          resolve(loginRes.access_token);
        } else {
          reject("Failed to get the access token.");
        }
      }, (error: HttpErrorResponse) => {
        reject(error);
      });
    });
  }

  /** Get All Reports */
  getAllReports(tokenType: string = "user") {
    let token = this.reportUserToken;
    if (tokenType === "server") {
      token = this.token;
    }
    const headers= new HttpHeaders().set('Authorization', 'Bearer ' + token).set('Access-Control-Allow-Origin', '*');
    return this.httpClient.get(environment.telerkServer + "/api/reportserver/v2/reports", { headers });
  }

  /** Get All Reports */
  getAllCategories() {
    const headers= new HttpHeaders().set('Authorization', 'Bearer ' + this.reportUserToken).set('Access-Control-Allow-Origin', '*');
    return this.httpClient.get(environment.telerkServer + "/api/reportserver/v2/categories", { headers });
  }

  /** Export Report with PDF or XLSX */
  exportReport(reportId: string, format: string) {
    const headers= new HttpHeaders().set('Authorization', 'Bearer ' + this.reportUserToken).set('Access-Control-Allow-Origin', '*');
    const request = {
      ReportId: reportId,
      Format: format,
      ParameterValues: null
    };
    return new Promise((resolve, reject) => {
      this.httpClient.post(environment.telerkServer + "/api/reportserver/v2/documents", request, { headers }).subscribe((documentId : string) => {
        if (documentId) {
          resolve(environment.telerkServer + "/api/reportserver/v2/documents/" + documentId + "?content-disposition=attachment");
        } else {
          reject(null);
        }
      }, (error: HttpErrorResponse) => {
        reject(null);
      });
    });
  }

  /** Create the Report with *.trdp report file */
  createReport(request) {
    const headers= new HttpHeaders().set('Authorization', 'Bearer ' + this.reportUserToken).set('Access-Control-Allow-Origin', '*');
    return this.httpClient.post(environment.telerkServer + "/api/reportserver/v2/reports", request, { headers });
  }

  /** Get Specified Report revisions */
  getRevisions(reportId: string) {
    const headers= new HttpHeaders().set('Authorization', 'Bearer ' + this.reportUserToken).set('Access-Control-Allow-Origin', '*');
    return this.httpClient.get(environment.telerkServer + `/api/reportserver/v2/reports/${reportId}/revisions`, { headers });
  }

  /** Lock the report specified */
  lockReport(reportId: string) {
    const headers= new HttpHeaders()
      .set('Authorization', 'Bearer ' + this.reportUserToken)
      .set('Access-Control-Allow-Origin', '*')
      .set('Content-Type', 'application/json');
    return this.httpClient.put(environment.telerkServer + `/api/reportserver/v2/reports/${reportId}/lock`, {}, { headers })
  }

  /** Lock and publish */
  publishReport(reportId: string, comment: string) {
    const headers= new HttpHeaders()
      .set('Authorization', 'Bearer ' + this.reportUserToken)
      .set('Access-Control-Allow-Origin', '*')
      .set('Content-Type', 'application/json');
    return this.httpClient.post(
      environment.telerkServer + `/api/reportserver/v2/reports/${reportId}/publish`,
      JSON.stringify(comment),
      { headers });
  }

  /** Unlock Report */
  unlockReport(reportId: string) {
    const headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + this.reportUserToken)
      .set('Access-Control-Allow-Origin', '*')
      .set('Content-Type', 'application/json');
    return this.httpClient.delete(environment.telerkServer + `/api/reportserver/v2/reports/${reportId}/unlock`, { headers })
  }
}
