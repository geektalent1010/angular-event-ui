import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { BehaviorSubject } from 'rxjs-compat';
import { MyKeycloakService } from './my-keycloak.service';

export interface PermissionData {
  createEvent: boolean,
  editEvent: boolean,
  viewEvent: boolean,
  reportsExplorer: boolean,
  permissionsManager: boolean,
  dataManager: boolean,
  qualificationManager: boolean
}

export interface RoleData {
  id?: string,
  name: string,
  description: string,
  composite: boolean,
  clientRole: boolean,
  containerId: string
}

export const roleNames: string[] = [
  "create-event",
  "edit-event",
  "view-event",
  "reports-explorer",
  "permissions-manager",
  "data-manager",
  "qualification-manager"
];

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  permissions: BehaviorSubject<PermissionData> = new BehaviorSubject<PermissionData>(null);

  constructor(
    private myKeycloak: MyKeycloakService,
    private keycloak: KeycloakService
  ) {
    this.permissions.next({
      createEvent: false,
      editEvent: false,
      viewEvent: false,
      reportsExplorer: false,
      permissionsManager: false,
      dataManager: false,
      qualificationManager: false
    });
  }

  getUserRoles() {
    const roles: string[] = this.keycloak.getUserRoles();
    this.permissions.next({
      createEvent: roles.includes("create-event"),
      editEvent: roles.includes("edit-event"),
      viewEvent: roles.includes("view-event"),
      reportsExplorer: roles.includes("reports-explorer"),
      permissionsManager: roles.includes("permissions-manager"),
      dataManager: roles.includes("data-manager"),
      qualificationManager: roles.includes("qualification-manager")
    });
    this.permissions.subscribe((permissions: PermissionData) => {
      localStorage.setItem('canCreateEvent', permissions.createEvent ? "true" : "false");
    })
  }
}
