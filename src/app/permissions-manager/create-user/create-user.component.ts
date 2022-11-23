import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { MyKeycloakService } from 'src/app/services/my-keycloak.service';
import { RoleData } from 'src/app/services/roles.service';
import { UserData } from '../permissions-manager.component';

export interface GroupData {
  id?: string,
  name: string,
  path: string,
  subGroups: any[],
  attributes?: any,
  realmRoles?: string[]
};

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit, AfterViewInit {
  @Input() user: UserData;
  groupList: GroupData[] = [];
  userForm: FormGroup = new FormGroup({
    firstName: new FormControl("", Validators.required),
    lastName: new FormControl("", Validators.required),
    username: new FormControl("", Validators.required),
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", Validators.required),
    group: new FormControl("", Validators.required),
    disable: new FormControl(false, Validators.required)
  });
  oldGroupId: string = "";

  constructor(
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef,
    private myKeycloak: MyKeycloakService
  ) { }

  ngOnInit(): void {
    if (this.user) {
      this.userForm = new FormGroup({
        firstName: new FormControl(this.user.firstName, Validators.required),
        lastName: new FormControl(this.user.lastName, Validators.required),
        username: new FormControl(this.user.username || "", Validators.required),
        email: new FormControl(this.user.email, [Validators.required, Validators.email]),
        group: new FormControl(null, Validators.required),
        disable: new FormControl(!Boolean(this.user.enabled), Validators.required),
        logout: new FormControl(false, Validators.required)
      });
      this.myKeycloak.getGroupbyUser(this.user.id).then((userListRes: string) => {
        const groupList: UserData[] = JSON.parse(userListRes);
        this.oldGroupId = groupList[0]?.id || "";
        this.userForm.setControl("group", new FormControl(this.oldGroupId, Validators.required))
      }).catch((error: HttpErrorResponse) => {
        console.error(error);
      });
    }
    this.myKeycloak.getGroupList().then((userListRes: string) => {
      const groups: GroupData[] = JSON.parse(userListRes);
      this.groupList = groups;
    }).catch((error: HttpErrorResponse) => {
      console.error(error);
    });
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  closeModal() {
    this.activeModal.close();
  }

  get lf() {
    return this.userForm.controls;
  }

  async save() {
    if (this.userForm.valid) {
      let formData: any = this.userForm.value;
      
      let user: UserData = {
        ...this.user,
        createdTimestamp: new Date().getTime(),
        username: formData.username,
        enabled: !formData.disable,
        emailVerified: false,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      };

      if (this.user) {
        try {
          const isSame: boolean = Object.keys(formData).every((key: string) => {
            if (key === "group" || key === "logout") {
              return true;
            } else if(key === "disable") {
              return formData["disable"] === !this.user["enabled"];
            } else {           
              return formData[key] === this.user[key];
            }
          });
          delete user["highlight"];
          if (!isSame) {
            await this.myKeycloak.updateUser(user);
          }
          let promiseArray: Promise<any>[] = [];
          if (formData.logout) {
            promiseArray.push(this.myKeycloak.logout(user.id));
          }
          if (this.oldGroupId !== formData.group) {
            if (this.oldGroupId) {
              promiseArray.push(this.myKeycloak.deleteGroupToUser(user.id, this.oldGroupId));
            }
            promiseArray.push(this.myKeycloak.addGroupToUser(user.id, formData.group));
          }
          await Promise.all(promiseArray);
          if (isSame && this.oldGroupId === formData.group) {
            this.activeModal.close();
          } else {
            this.activeModal.close(user);
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        this.myKeycloak.createUser(user).then(async (res: any) => {
          try {
            if (!res) {
              const userList: UserData[] = JSON.parse(await this.myKeycloak.getUserList());
              const createdUser: UserData = userList.find((userItem: UserData) => userItem.email === user.email);
              const PromiseArray: Promise<any>[] = [
                this.myKeycloak.setPassword(createdUser.id, formData.password),
                this.myKeycloak.addGroupToUser(createdUser.id, formData.group)
              ]
              Promise.all(PromiseArray).then((setRes: any) => {
                this.activeModal.close(user);
              }).catch(err => console.error(err));
            } else {
              console.error(res.errorMessage);
              alert(res.errorMessage);
            }
          } catch (err) {
            console.error(err);
          }
        }).catch(err => {
          console.error(err);
        });
      }
    } else {
      Object.keys(this.lf).forEach((field: string) => {
        this.lf[field].markAsTouched();
        this.lf[field].updateValueAndValidity();
      });
    }
  }
}
