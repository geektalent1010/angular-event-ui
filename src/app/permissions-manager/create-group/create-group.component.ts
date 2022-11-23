import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { MyKeycloakService } from 'src/app/services/my-keycloak.service';
import { RoleData, roleNames } from 'src/app/services/roles.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { GroupData } from '../create-user/create-user.component';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.scss']
})
export class CreateGroupComponent implements OnInit {
  @Input() isSave: boolean;
  groupForm: FormGroup = new FormGroup({
    name: new FormControl("", Validators.required),
    createEvent: new FormControl(false),
    editEvent: new FormControl(false),
    viewEvent: new FormControl(true),
    reportsExplorer: new FormControl(false),
    permissionsManager: new FormControl(false),
    dataManager: new FormControl(false),
    qualificationManager: new FormControl(false)
  });
  createError: any;
  realmRoles: RoleData[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private myKeycloak: MyKeycloakService,
    private utilities: UtilitiesService
  ) { }

  ngOnInit(): void {
    this.myKeycloak.getRealmRoles().then((rolesRes: any) => {
      const realmRoles: RoleData[] = JSON.parse(rolesRes);
      this.realmRoles = realmRoles.filter((role: RoleData) => roleNames.includes(role.name));
    });
  }

  closeModal() {
    this.activeModal.close();
  }

  get lf() {
    return this.groupForm.controls;
  }

  async createGroup() {
    if (this.groupForm.valid) {
      try {
        const group: any = this.groupForm.value;
        let realmRoles: RoleData[] = [];
        Object.keys(group).forEach((field: string) => {
          if (field !== "name" && group[field] === true) {
            const assignedRole: RoleData = this.realmRoles.find((realmRole: RoleData) => realmRole.name === this.utilities.camelToKebab(field));
            realmRoles.push(assignedRole);
          }
        });
        const groupObject: GroupData = {
          name: group.name,
          path: "/"  + group.name,
          subGroups: [],
        };
        if (this.isSave) {
          await this.myKeycloak.createGroup(groupObject);
          if (realmRoles.length) {
            const groupList: GroupData[] = JSON.parse(await this.myKeycloak.getGroupList());
            const newGroup: GroupData = groupList.find((groupItem: GroupData) => groupItem.name === groupObject.name)
            if (newGroup?.id) {
              await this.myKeycloak.updateGroupeRealmRole(newGroup.id, realmRoles);
            }
            this.activeModal.close({ ...groupObject, realmRoles: realmRoles.map((role: RoleData) => role.name) });
          }
        } else {
          this.activeModal.close({ ...groupObject, realmRoles: realmRoles.map((role: RoleData) => role.name) });
        }
      } catch (err) {
        console.error(err);
        this.createError = err?.error;
      }
    } else {
      Object.keys(this.lf).forEach((field: string) => {
        this.lf[field].markAsTouched();
        this.lf[field].updateValueAndValidity();
      });
    }
  }
}
