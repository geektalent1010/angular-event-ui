import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MdbTableDirective, MdbTablePaginationComponent } from 'angular-bootstrap-md';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { MyKeycloakService } from '../services/my-keycloak.service';
import { CreateGroupComponent } from './create-group/create-group.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { GroupPermissionsComponent } from './group-permissions/group-permissions.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { DisableUserComponent } from './disable-user/disable-user.component';
import moment from 'moment';
import { API_URL2 } from '../services/url/url';

export interface UserData {
  id: string,
  createdTimestamp: number,
  username: string,
  enabled: boolean,
  totp?: boolean,
  emailVerified: boolean,
  firstName: string,
  lastName: string,
  email: string,
  disableableCredentialTypes?: any[],
  requiredActions?: any[],
  notBefore?: number,
  access?: {
      manageGroupMembership: boolean,
      view: boolean,
      mapRoles: boolean,
      impersonate: boolean,
      manage: boolean
  },
  realmRoles?: string[],
  highlight?: boolean
};

@Component({
  selector: 'app-permissions-manager',
  templateUrl: './permissions-manager.component.html',
  styleUrls: ['./permissions-manager.component.scss']
})
export class PermissionsManagerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MdbTablePaginationComponent, { static: true }) userTablePagination: MdbTablePaginationComponent;
  @ViewChild(MdbTableDirective, { static: true }) userTable: MdbTableDirective
  currentTab: number = 1;
  periodOptions: any[] = [
    { label: "All days", value: "all" },
    { label: "Last 24 hours", value: "1" },
    { label: "Last 7 days", value: "7" },
    { label: "Last 14 days", value: "14" },
    { label: "Last 30 days", value: "30" }
  ];
  searchForm: FormGroup = new FormGroup({
    period: new FormControl(this.periodOptions[0].value),
    search: new FormControl("")
  });
  userList: UserData[] = [];
  filteredUserList: UserData[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private myKeycloak: MyKeycloakService,
    private auth: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.searchForm.controls["period"].valueChanges.subscribe((period: string) => {
      this.searchFilter(period, "period");
    });
    this.searchForm.controls["search"].valueChanges.pipe(
      startWith(""),
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((search: string) => {
      this.searchFilter(search, "search");
    });
    this.getUserList();
  }

  ngAfterViewInit() {
    this.userTablePagination.setMaxVisibleItemsNumberTo(10);
    this.userTablePagination.calculateFirstItemIndex();
    this.userTablePagination.calculateLastItemIndex();
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    
  }

  setTab(tab: number): void {
    this.currentTab = tab;
  }

  async getUserList() {
    let keycloakToken = localStorage.getItem("keycloakToken");

    if (keycloakToken) {
      this.myKeycloak.getUserList().then((userListRes: string) => {
        const usersRes: UserData[] = JSON.parse(userListRes);
        this.userList = usersRes.map((user: UserData) => {
          return {
            ...user,
            highlight: false
          };
        });
        this.searchFilter(null, null);
      }).catch(error => {
        console.log('Get User List error', error)
      });
    }
  }

  /** Search and Filter the user list on the table */
  searchFilter(value: string, field: string) {
    let searchValues = this.searchForm.value;
    if (value && field) {
      searchValues[field] = value;
    }
    let filteredUserList: UserData[] = this.userList
      .filter((user: UserData) => {
        if (searchValues["period"] === "all") {
          return true;
        } else {
          const diffHours = moment().diff(moment(user.createdTimestamp), "hours");
          if (diffHours <= Number(searchValues["period"]) * 24) {
            return true;
          } else {
            return false;
          }
        }
      })
      .filter((user: UserData) => {
        const searchObj: Object = {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username
        };
        const keyword: string = searchValues["search"];
        return Object.keys(searchObj).some((key: string) => String(searchObj[key]).toLowerCase().includes(keyword.toLowerCase()));
      });

    this.filteredUserList = filteredUserList;
    this.userTable.setDataSource(this.filteredUserList);
    this.filteredUserList = this.userTable.getDataSource();
    this.userTablePagination.firstPage();
    this.cdr.detectChanges();
  }

  createUser() {
    const createUserModalRef = this.modalService.open(CreateUserComponent, {
      size: 'lg',
      windowClass: 'modal-custom-createUser'
    });
    createUserModalRef.result.then((user: UserData) => {
      if (user) {
        this.userList.unshift({
          ...user,
          highlight: true
        });
        this.searchFilter(null, null);
      }
    });
  }

  editUser(user: UserData, index: number) {
    const editUserModalRef = this.modalService.open(CreateUserComponent, {
      size: 'lg',
      windowClass: 'modal-custom-createUser'
    });
    editUserModalRef.componentInstance.user = user;
    editUserModalRef.result.then((editedUser: UserData) => {
      if (editedUser) {
        this.userList[index] = {
          ...editedUser,
          highlight: true
        };
        this.searchFilter(null, null);
      }
    });
  }

  createGroup() {
    const createGroupModalRef = this.modalService.open(CreateGroupComponent, {
      size: 'lg',
      windowClass: 'modal-custom-createGroup'
    });
    createGroupModalRef.componentInstance.isSave = true;
    createGroupModalRef.result.then((isCreated: boolean) => {
      if (isCreated) {

      }
    }).catch(err => console.error(err));
  }

  groupPermissions() {
    const groupPermissionsModalRef = this.modalService.open(GroupPermissionsComponent, {
      size: 'lg',
      windowClass: 'modal-custom-groupPermissions'
    });
    groupPermissionsModalRef.result.then((data: any) => {
      console.error("group permissions modal closed: ", data);
    });
  }

  disableUser(user: UserData, index: number, newEnabled: boolean) {
    const updatedUser: UserData = { ...user };
    updatedUser.enabled = newEnabled;
    delete updatedUser["highlight"];

    const disableUserModalRef = this.modalService.open(DisableUserComponent, {
      size: 'lg',
      windowClass: 'modal-custom-disableUser'
    });
    disableUserModalRef.componentInstance.user = updatedUser;
    disableUserModalRef.result.then((status: boolean) => {
      console.error("disable user modal closed: ", status);
      if (status) {
        this.userList[index] = { ...updatedUser };
        this.searchFilter(null, null);
      }
    });
  }

  changePassword(userId: string, index: number) {
    const changePasswordModalRef = this.modalService.open(ChangePasswordComponent, {
      size: 'lg',
      windowClass: 'modal-custom-changePassword'
    });
    changePasswordModalRef.componentInstance.userId = userId;
    changePasswordModalRef.result.then((data: any) => {
      console.error("change password modal closed: ", data);
    });
  }
}
