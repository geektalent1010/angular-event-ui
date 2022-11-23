import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MdbTableDirective, MdbTablePaginationComponent } from 'angular-bootstrap-md';
import { forkJoin, of } from 'rxjs';
import { Observable } from 'rxjs-compat';
import { debounceTime, distinctUntilChanged, mergeMap, startWith } from 'rxjs/operators';
import { USER_LEFT } from 'src/app/components/angular-chat-ui-kit/components/utils/enums';
import { MyKeycloakService } from 'src/app/services/my-keycloak.service';
import { RoleData, roleNames } from 'src/app/services/roles.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { CreateGroupComponent } from '../create-group/create-group.component';
import { GroupData } from '../create-user/create-user.component';

interface DisplayGroupData {
  id?: string,
  name: string,
  createEvent: string,
  editEvent: string,
  viewEvent: string,
  reportsExplorer: string,
  permissionsManager: string,
  dataManager: string,
  qualificationManager: string
};

@Component({
  selector: 'app-group-permissions',
  templateUrl: './group-permissions.component.html',
  styleUrls: ['./group-permissions.component.scss']
})
export class GroupPermissionsComponent implements OnInit {
  groupList: GroupData[] = [];
  displayGroupList: DisplayGroupData[] = [];
  searchedGroupList: DisplayGroupData[] = [];
  deleteGroupList: DisplayGroupData[] = [];
  originalGroupList: DisplayGroupData[] = [];
  searchControl: FormControl = new FormControl("");
  realmRoles: RoleData[] = [];
  
  constructor(
    public activeModal: NgbActiveModal,
    private myKeycloak: MyKeycloakService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private utilities: UtilitiesService
  ) { }

  ngOnInit(): void {
    this.getRealmRoles();
    this.getGroupList();
    this.searchControl.valueChanges.pipe(
      startWith(""),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((value: string) => {
      this.searchGroup(value);
    });
  }

  getRealmRoles() {
    this.myKeycloak.getRealmRoles().then((rolesRes: any) => {
      const realmRoles: RoleData[] = JSON.parse(rolesRes);
      this.realmRoles = realmRoles.filter((role: RoleData) => roleNames.includes(role.name));
    });
  }

  async getGroupList() {
    try {
      const groupList: GroupData[] = JSON.parse(await this.myKeycloak.getGroupList());
      this.groupList = groupList;
      let GetGroups: Promise<any>[] = [];
      groupList.forEach((group: GroupData) => {
        GetGroups.push(this.myKeycloak.getGroupbyId(group.id));
      });
      const detailGroupList: GroupData[] = (await Promise.all(GetGroups)).map((group: any) => JSON.parse(group));
      this.groupList = detailGroupList;
      this.displayGroupList = this.groupList.map((group: GroupData) => {
        let displayGroup: DisplayGroupData = {
          id: group.id,
          name: group.name,
          createEvent: "Deny",
          editEvent: "Deny",
          viewEvent: "Deny",
          reportsExplorer: "Deny",
          permissionsManager: "Deny",
          dataManager: "Deny",
          qualificationManager: "Deny"
        };
        roleNames.map((roleName: string) => {
          if (group.realmRoles.includes(roleName)) {
            displayGroup[this.utilities.kebabToCamel(roleName)] = "Allow";
          }
        });
        return displayGroup;
      });
      this.searchedGroupList = this.displayGroupList;
      this.originalGroupList = this.displayGroupList.map((group: DisplayGroupData) => { return { ...group } });
    } catch (err) {
      console.error(err);
    }
  }
  
  searchGroup(keyword: string = "") {
    if (keyword === "") {
      keyword = this.searchControl.value
    }
    this.searchedGroupList = this.displayGroupList.filter((group: DisplayGroupData) => group.name.toLowerCase().includes(keyword.toLowerCase()))
  }

  closeModal() {
    this.activeModal.close();
  }

  createGroup() {
    const createGroupModalRef = this.modalService.open(CreateGroupComponent, {
      size: 'lg',
      windowClass: 'modal-custom-createGroup'
    });
    createGroupModalRef.componentInstance.isSave = true;
    createGroupModalRef.result.then((group: GroupData) => {
      if (group) {
        const displayGroup: DisplayGroupData = {
          id: group.id,
          name: group.name,
          createEvent: "Deny",
          editEvent: "Deny",
          viewEvent: "Deny",
          reportsExplorer: "Deny",
          permissionsManager: "Deny",
          dataManager: "Deny",
          qualificationManager: "Deny"
        };
        roleNames.map((roleName: string) => {
          if (group.realmRoles.includes(roleName)) {
            displayGroup[this.utilities.kebabToCamel(roleName)] = "Allow";
          }
        });
        this.displayGroupList.push(displayGroup);
        this.searchGroup();
        this.getGroupList();
      }
    }).catch(err => console.error(err));
  }

  deleteGroup(group: DisplayGroupData, index: number) {
    this.deleteGroupList.push(group);
    this.displayGroupList = this.displayGroupList.filter((oldGroup: DisplayGroupData) => group.id !== oldGroup.id);
    this.searchGroup();
  }

  async save() {
    try {
      let promiseArray: Promise<any>[] = [];
      let testArray: any[] = [];
      this.deleteGroupList.forEach((group: DisplayGroupData) => {
        promiseArray.push(this.myKeycloak.deleteGroup(group.id));
        testArray.push({
          type: "Delete",
          group
        });
      });
      this.displayGroupList.forEach((group: DisplayGroupData) => {
        if (group.id) {
          const originDisplayGroup = this.originalGroupList.find((originGroup: DisplayGroupData) => originGroup.id === group.id);
          if (!this.checkSameGroup(group, originDisplayGroup)) {
            let realmRoles: RoleData[] = [];
            Object.keys(group).forEach((field: string) => {
              if (field !== "id" && field !== "name" && group[field] === "Allow") {
                const realmRole: RoleData = this.realmRoles.find((realmRole: RoleData) => realmRole.name === this.utilities.camelToKebab(field));
                realmRoles.push(realmRole);
              }
            });
            promiseArray.push(this.myKeycloak.updateGroupeRealmRole(group.id, realmRoles));
            testArray.push({
              type: "Update",
              group,
              realmRoles
            });
          }
        }
      });
      // console.log(promiseArray)
      await Promise.all(promiseArray);
      this.closeModal();
    } catch (err) {
      console.error(err);
    }
  }

  checkSameGroup(value1: Object, value2: Object) {    
    return Object.keys(value1).every((key: string) => value1[key] === value2[key]) && Object.keys(value2).every((key: string) => value1[key] === value2[key]);
  }
}
