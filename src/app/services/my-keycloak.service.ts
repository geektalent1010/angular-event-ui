import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { GroupData } from '../permissions-manager/create-user/create-user.component';
import { UserData } from '../permissions-manager/permissions-manager.component';
import { RoleData } from './roles.service';
import { UtilitiesService } from './utilities.service';

const keyclockConfig = environment.keycloak.config;
const basePath: string = environment.proxyBaseURL + `/auth/admin/realms/${keyclockConfig.realm}`;
const keycloak = environment.keycloak;

@Injectable({
  providedIn: 'root'
})
export class MyKeycloakService {
  token: string = "";

  constructor(
    // private keycloak: KeycloakService,
    private http: HttpClient,
    private utilities: UtilitiesService
  ) {
  }

  /** Basic API functins */
  fetchGet(URL: string, headers: Headers = new Headers(), contentType?: string) {
    if (contentType) {
      headers.append("Content-Type", contentType);
    }
    headers.append("Authorization", "Bearer " + localStorage.getItem("keycloakToken"));
    var requestOptions = {
      method: 'GET',
      headers: headers
    };
    return fetch(URL, requestOptions).then(response => response?.text());
  }

  fetchPost(URL: string, bodyObject: any, headers: Headers = new Headers(), contentType?: string) {
    let body: any;
    if (contentType) {
      headers.append("Content-Type", contentType);
      switch (contentType) {
        case "application/x-www-form-urlencoded":
          var urlencoded = new URLSearchParams();
          Object.keys(bodyObject).forEach((key: string) => {
            urlencoded.append(key, bodyObject[key]);
          });
          body = urlencoded;
          break;
        default:
          body = JSON.stringify(bodyObject);
          break;
      }
    }
    headers.append("Authorization", "Bearer " + localStorage.getItem("keycloakToken"));
    var requestOptions = {
      method: 'POST',
      headers: headers,
      body: body,
    };
    return fetch(URL, requestOptions).then(response => response?.text());
  }

  fetchPut(URL: string, bodyObject: any, headers: Headers = new Headers(), contentType?: string) {
    let body: any;
    headers.append("Authorization", "Bearer " + localStorage.getItem("keycloakToken"));
    if (contentType) {
      headers.append("Content-Type", contentType);
      switch (contentType) {
        case "application/x-www-form-urlencoded":
          var urlencoded = new URLSearchParams();
          Object.keys(bodyObject).forEach((key: string) => {
            urlencoded.append(key, bodyObject[key]);
          });
          body = urlencoded;
          break;
        default:
          body = JSON.stringify(bodyObject);
          break;
      }
    }

    var raw = JSON.stringify(bodyObject);

    var requestOptions = {
      method: 'PUT',
      headers: headers,
      body: raw
    };

    return fetch(URL, requestOptions).then(response => response?.text());
  }

  fetchDelete(URL: string, headers: Headers = new Headers(), contentType?: string) {
    headers.append("Authorization", "Bearer " + localStorage.getItem("keycloakToken"));
    if (contentType) {
      headers.append("Content-Type", contentType);
    }
    var requestOptions = {
      method: 'DELETE',
      headers: headers
    };
    return fetch(URL, requestOptions).then(response => response?.text());
  }

  /** Keycloak APIs */
  getToken() {
    const TOKEN_URL = environment.proxyBaseURL + `/auth/realms/${keyclockConfig.realm}` + `/protocol/openid-connect/token`;
    const bodyRequest = {
      ...keycloak.adminCredentials,
      client_id: keycloak.config.clientId,
      grant_type: "password"
    };
    return this.fetchPost(TOKEN_URL, bodyRequest, new Headers(), "application/x-www-form-urlencoded");
  }

  /** User APIs */
  getUserList() {
    return this.fetchGet(basePath + `/users`);
  }

  createUser(user: UserData) {
    return this.fetchPost(basePath + `/users`, user, new Headers(), "application/json");
  }

  updateUser(user: UserData) {
    return this.fetchPut(basePath + `/users/${user.id}`, user, new Headers(), "application/json");
  }

  setPassword(userId: string, password: string) {
    const passwordBody = {
      userLabel: "password",
      value: password
    };
    return this.fetchPut(basePath + `/users/${userId}/reset-password`, passwordBody, new Headers(), "application/json");
  }

  addGroupToUser(userId: string, groupId: string) {
    return this.fetchPut(basePath + `/users/${userId}/groups/${groupId}`, {}, new Headers(), "application/json");
  }

  deleteGroupToUser(userId: string, groupId: string) {
    return this.fetchDelete(basePath + `/users/${userId}/groups/${groupId}`);
  }

  getUserRoleMapping(userId: string) {
    return this.fetchGet(basePath + `/users/${userId}/role-mappings`);
  }

  logout(userId: string) {
    return this.fetchPost(basePath + `/users/${userId}/logout`, {});
  }

  /** Group APIs */
  getGroupbyUser(userId: string) {
    return this.fetchGet(basePath + `/users/${userId}/groups`);
  }

  getGroupbyId(groupId: string) {
    return this.fetchGet(basePath + `/groups/${groupId}`);
  }

  getGroupList() {
    return this.fetchGet(basePath + `/groups`);
  }

  createGroup(group: GroupData) {
    return this.fetchPost(basePath + `/groups`, group, new Headers(), "application/json");
  }

  updateGroup(group:GroupData) {
    if (group.id) {
      return this.fetchPut(basePath + `/groups/${group.id}`, group);
    } else {
      return new Promise(null);
    }
  }

  deleteGroup(groupId: string) {
    return this.fetchDelete(basePath + `/groups/${groupId}`);
  }

  updateGroupeRealmRole(groupId: string, realmRoles: RoleData[]) {
    return this.fetchPost(basePath + `/groups/${groupId}/role-mappings/realm`, realmRoles, new Headers(), "application/json");
  }

  /** Role APIs */
  getRealmRoles() {
    return this.fetchGet(basePath + `/roles`);
  }
}
